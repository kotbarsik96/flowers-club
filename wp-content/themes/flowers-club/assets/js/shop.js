class Catalog {
    constructor(node) {
        this.toggle = this.toggle.bind(this);
        this.getCategories = this.getCategories.bind(this);
        this.onItemClick = this.onItemClick.bind(this);

        this.rootElem = node;
        this.button = qs(".catalog__button", this.rootElem);
        this.subcategoriesContainer = qs(".catalog__subcategories", this.rootElem);
        this.categories = [];
        this.subcategories = [];
        const header = document.querySelector(".header");

        if (!this.rootElem.parentNode.classList.contains("header__icons"))
            header.prepend(this.rootElem);
        this.button.addEventListener("click", () => this.toggle());
        document.addEventListener("click", (event) => {
            if (event.target.closest(".catalog") || event.target.classList.contains("catalog"))
                return;

            this.toggle(true).hide();
        });
        correctDynamicAdaptive.call(this);
        this.getCategories();
        document.addEventListener("init-inputs", this.getCategories);

        if (this.categories[0])
            this.setItem(this.categories[0].value);

        function correctDynamicAdaptive() {
            const inpParams = inittedInputs.find(inpP => {
                return inpP.rootElem === this.rootElem
                    && inpP instanceof DynamicAdaptive;
            });

            if (inpParams) {
                if (inpParams.params.media) {
                    inpParams.params.media.addEventListener("change", () => {
                        if (!inpParams.params.media.matches) header.prepend(this.rootElem);
                    });
                }
            }
        }
    }
    getCategories() {
        // собрать новые категории
        const newItems = qsAll(".catalog__category-item", this.rootElem)
            .filter(node => !this.categories.find(obj => obj.node === node))
            .map(node => {
                const textSpan = qs(".catalog__category-item-text", node);
                const value = textSpan ? textSpan.textContent.trim() : '';
                return { node, value }
            });
        newItems.forEach(obj => {
            obj.node.addEventListener("click", this.onItemClick);
        });

        this.categories = this.categories.concat(newItems);

        // соотнести контент категории с категорией (контент - подкатегории, которые появляются при клике по категории)
        qsAll(".catalog__hidden-subcategory", this.rootElem)
            .forEach(node => {
                const value = node.dataset.value.trim();
                const obj = this.categories.find(o => o.value === value);
                if (!obj) {
                    node.remove();
                    return;
                }

                node.classList.remove("catalog__hidden-subcategory");

                obj.subcategoryNode = node;
                node.remove();
            });
    }
    onItemClick(event) {
        const item = event.target.classList.contains("catalog__category-item")
            ? event.target : event.target.closest(".catalog__category-item");
        this.setItem(item);
    }
    toggle(boolean = false) {
        show = show.bind(this);
        hide = hide.bind(this);
        if (boolean === true) return { show, hide };

        this.rootElem.classList.contains("__shown")
            ? hide()
            : show();

        function show() {
            this.rootElem.classList.add("__shown");
        }
        function hide() {
            this.rootElem.classList.remove("__shown");
        }
    }
    setItem(itemOrValue) {
        let obj;
        if (typeof itemOrValue === "string") {
            obj = this.categories.find(o => o.value === itemOrValue);
        } else {
            obj = this.categories.find(o => o.node === itemOrValue);
        }

        if (!obj) return;
        if (!obj.subcategoryNode) return;
        if (this.currentSubcategoryNode === obj.subcategoryNode) return;

        if (this.currentSubcategoryNode) {
            htmlElementMethods.remove(this.currentSubcategoryNode, { transitionDur: 300 })
                .then(() => {
                    htmlElementMethods.insert(
                        obj.subcategoryNode,
                        this.subcategoriesContainer,
                        { transitionDur: 300 }
                    );
                });
        } else {
            htmlElementMethods.insert(
                obj.subcategoryNode,
                this.subcategoriesContainer,
                { transitionDur: 300 }
            );
        }

        this.currentSubcategoryNode = obj.subcategoryNode;
    }
}

class CatalogPage {
    categorySlug = categorySlug;
    products = [];
    productsIds = [];

    constructor(node) {
        this.productsQuery = this.productsQuery.bind(this);
        this.sortProducts = this.sortProducts.bind(this);

        this.rootElem = node;
        this.productsList = qs(".products-list", this.rootElem);
        this.emptyListMessage = qs(".shop__empty-list", this.rootElem);
        this.cardsBlock = qs(".shop__cards", this.rootElem);
        this.sortParams = initInput(qs(".shop__selects-sort", this.rootElem), Select);
        this.filterParams = initInput(qs(".filter", this.rootElem), Filter);

        this.emptyListMessage.remove();

        if (this.filterParams)
            this.filterParams.rootElem.addEventListener("change", this.productsQuery);
        if (this.sortParams)
            this.sortParams.rootElem.addEventListener("change", this.sortProducts);

        setTimeout(this.productsQuery, 100);
    }
    async productsQuery() {
        const filterData = JSON.stringify(this.getFilterData());
        const data = {
            category: this.categorySlug,
            filterData,
        };
        setLoadingState(this.rootElem);

        const tempContainer = createElement("div", "", "", { style: "display: none;" });
        const res = await ajaxQuery("products_query", data, "json");
        // очистить текущий массив от тех товаров, которые не пришли по запросу
        this.products = this.products.filter(obj => {
            if (!res.data.products.find(o => o.id === obj.id)) {
                if (obj.node) obj.node.remove();
                return false;
            }
            return true;
        });
        // очистить новый массив от тех товаров, которые уже есть в текущем
        const newProducts = res.data.products.filter(obj => {
            if (this.productsIds.includes(obj.id)) return false;

            tempContainer.insertAdjacentHTML("afterbegin", obj.layout);
            const node = qs("li", tempContainer);
            node.remove();
            obj.node = node;
            node.setAttribute("data-animate", "popUp");
            return true;
        });
        // соединить текущие товары с новыми
        this.products = this.products.concat(newProducts);
        // отсортировать в соответствии с текущим выбранным способом сортировки и отрендерить товары
        this.sortProducts();

        unsetLoadingState(this.rootElem);
    }
    getFilterData() {
        const arrays = [];
        this.filterParams.components.forEach(inpP => {
            const name = inpP.params ? inpP.params.name : null;
            if (!name) return;

            const obj = { name };

            if (inpP instanceof InputButtonsList) {
                const values = inpP.inputs.filter(obj => obj.input.checked)
                    .map(obj => obj.input.value);
                obj.values = values;
            }
            else if (inpP instanceof RangeDouble) {
                const min = Math.abs(parseInt(inpP.inputMin.el.value));
                const max = Math.abs(parseInt(inpP.inputMax.el.value));

                obj.values = { min, max };
            }
            else return;

            arrays.push(obj);
        });
        return arrays;
    }
    sortProducts() {
        const sortMethods = bindMethods(this, {
            // по количеству товаров в наличии
            recommended(obj1, obj2) {
                if (obj1.stock_quantity < obj2.stock_quantity) return -1;
                if (obj1.stock_quantity > obj2.stock_quantity) return 1;
                return 0;
            },
            // а-я
            alphabetAsc(obj1, obj2) {
                if (obj1.title < obj2.title) return -1;
                if (obj1.title > obj2.title) return 1;
                return 0;
            },
            // я-а
            alphabetDesc(obj1, obj2) {
                if (obj1.title > obj2.title) return -1;
                if (obj1.title < obj2.title) return 1;
                return 0;
            },
            // от дешевых к дорогим
            priceAsc(obj1, obj2) {
                if (obj1.price < obj2.price) return -1;
                if (obj1.price > obj2.price) return 1;
                return 0;
            },
            // от дорогих к дешевым
            priceDesc(obj1, obj2) {
                if (obj1.price > obj2.price) return -1;
                if (obj1.price < obj2.price) return 1;
                return 0;
            }
        });

        let callback = sortMethods.recommended;
        if (this.sortParams) {
            if (typeof sortMethods[this.sortParams.value] === "function")
                callback = sortMethods[this.sortParams.value];
        }

        this.products = this.products.sort(callback);
        this.productsIds = this.products.map(obj => obj.id);
        this.renderProducts();
    }
    renderProducts() {
        if (this.products.length < 1) {
            htmlElementMethods.insert(this.emptyListMessage, this.cardsBlock, {
                insertType: "append"
            });
        } else {
            this.emptyListMessage.remove();
        }

        this.products.forEach(obj => {
            this.productsList.append(obj.node);
        });
    }
}

class Filter {
    afterChangeTimeout = 500;

    constructor(node) {
        this.toggle = this.toggle.bind(this);
        this.onAnyChange = this.onAnyChange.bind(this);
        this.doFilter = this.doFilter.bind(this);

        const self = this;
        this.rootElem = node;
        this.button = this.rootElem.querySelector(".filter__button");
        this.closeButton = this.rootElem.querySelector(".filter__close-button");
        this.components = [];

        getComponents();
        this.button.addEventListener("click", this.toggle);
        if (this.closeButton) this.closeButton.addEventListener("click", this.toggle(true).hide);

        this.toggleVisibilityMedia = window.matchMedia("(max-width: 767px)");
        onVisibilityMediaChange();
        this.toggleVisibilityMedia.addEventListener("change", onVisibilityMediaChange);

        // каждый компонент фильтра должен генерировать событие "change" на своем rootElem при изменении
        async function getComponents() {
            await delay(100);

            const filteringInstances = [
                Range,
                InputButtonsList
            ];
            const newComponents = inittedInputs.filter(inpP => {
                const notFilteringInst = !filteringInstances.find(inst => inpP instanceof inst);
                if (notFilteringInst)
                    return false;

                const exists = self.components.find(selfInpP => selfInpP.rootElem === inpP.rootElem);
                if (exists)
                    return false;

                return true;
            });
            newComponents.forEach(inpP => {
                inpP.rootElem.addEventListener("change", self.onAnyChange);
            });
            self.components = self.components.concat(newComponents);
        }
        function onVisibilityMediaChange() {
            if (self.toggleVisibilityMedia.matches) self.toggle(true).hide();
            else self.toggle(true).show();
        }
    }
    toggle(boolean = false) {
        show = show.bind(this);
        hide = hide.bind(this);
        const admBar = qs("#wpadminbar");
        if (boolean === true) return { show, hide };

        this.rootElem.classList.contains("__shown")
            ? hide()
            : show();

        function show() {
            if (!this.toggleVisibilityMedia.matches) return;

            if (admBar)
                admBar.style.transform = "translate(0, -100px)";
            this.rootElem.classList.add("__shown");
            document.body.classList.add("__locked-scroll");
        }
        function hide() {
            if (admBar)
                admBar.style.removeProperty("transform");
            this.rootElem.classList.remove("__shown");
            document.body.classList.remove("__locked-scroll");
        }
    }
    onAnyChange() {
        if (this.afterChangeTimer)
            clearTimeout(this.afterChangeTimer);

        this.afterChangeTimer = setTimeout(this.doFilter, this.afterChangeTimeout);
    }
    doFilter() {
        // запускает CatalogPage.onChange
        this.rootElem.dispatchEvent(new Event("change"));
    }
}

class Range {
    constructor(node) {
        this.onPointerdown = this.onPointerdown.bind(this);
        this.onInputChange = this.onInputChange.bind(this);

        this.rootElem = node;
        this.scale = this.rootElem.querySelector(".range__scale");
        this.bar = this.rootElem.querySelector(".range__bar");
        this.params = getParams(this);
        setDefaultParams.call(this, {
            minValue: { value: 0, type: "number" },
            maxValue: { value: 1000, type: "number" },
            valuePrefix: { value: "", type: "string" },
            valueSuffix: { value: "", type: "string" },
        });

        this.setProperties();
        window.addEventListener("resize", onResize.bind(this));

        function onResize() {
            this.setProperties();
            this.sync(true);
        }
    }
    onInputFocus(event) {
        const input = event.target;
        const numberValue = input.value.replace(/\D/g, "").trim();
        if (numberValue === "0") input.value = "";
        else input.value = numberValue;
        setTimeout(() => {
            input.selectionStart = input.selectionEnd = input.value.length;
        }, 0);
    }
    onInputBlur(event) {
        const input = event.target;
        this.setValue(input, input.value);
    }
    setProperties() {
        const scaleCoords = getCoords(this.scale);
        const toggler = this.rootElem.querySelector(".range__toggler");

        this.shift = scaleCoords.left;
        this.halfToggler = toggler.offsetWidth / 2;
        this.scaleWidth = this.scale.offsetWidth - this.halfToggler;
        this.step = (this.params.maxValue - this.params.minValue) / this.scaleWidth;
        this.shiftByValue = this.params.minValue / this.step;
    }
    setValue(input, num) {
        input.value = `${this.params.valuePrefix}${num}${this.params.valueSuffix}`;
    }
    sync() {
        this.rootElem.dispatchEvent(new Event("change"));
    }
}

class RangeSingle extends Range {
    constructor(node) {
        super(node);

        this.toggler = this.rootElem.querySelector(".range__toggler");
        this.input = this.rootElem.querySelector(".range__value-item");

        this.toggler.addEventListener("pointerdown", this.onPointerdown);
        this.input.addEventListener("change", this.onInputChange);
        this.input.addEventListener("focus", this.onInputFocus);
        this.toggler.ondragstart = () => false;

        setDefaultValue.call(this);

        this.scale.addEventListener("pointerdown", onScalePointerdown.bind(this));

        function onScalePointerdown(event) {
            event.preventDefault();
            const x = event.clientX - this.shift - this.halfToggler;
            this.moveToggler(x);
            this.toggler.dispatchEvent(new Event("pointerdown"));
        }
        function setDefaultValue() {
            setDefaultParams.call(this, { defaultValue: { value: this.params.minValue, type: "number" } });
            if (this.params.defaultValue < this.params.minValue)
                this.params.defaultValue = this.params.minValue;

            this.input.value = this.params.defaultValue;
            this.sync(true);
        }
    }
    sync(byValueInput = false) {
        super.sync();

        if (byValueInput) {
            const num = this.validateInputValue();
            const x = num / this.step - this.shiftByValue;
            this.moveToggler(x);
        } else {
            const value = Math.floor(this.togglerX * this.step);
            this.setValue(this.input, value);
        }
    }
    onPointerdown() {
        onMove = onMove.bind(this);
        onUp = onUp.bind(this);

        this.toggler.classList.add("__active");
        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onUp);

        function onMove(moveEvent) {
            moveEvent.preventDefault();
            const x = moveEvent.clientX - this.shift - this.halfToggler;

            if (x >= 0 && x <= this.scaleWidth) this.moveToggler(x);
            else if (x < 0) this.moveToggler(0);
            else if (x > this.scaleWidth) this.moveToggler(this.scaleWidth);

            this.sync();
        }
        function onUp() {
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerup", onUp);
            this.toggler.classList.remove("__active");
        }
    }
    moveToggler(x) {
        this.togglerX = x;
        this.toggler.style.left = `${x}px`;
        this.setBarWidth();
    }
    validateInputValue() {
        let num = parseInt(this.input.value.replace(/[^-.0-9]/g, "").trim()) || 0;

        if (num < this.params.minValue) num = this.params.minValue;
        if (num > this.params.maxValue) num = this.params.maxValue;

        this.setValue(this.input, num);
        return num;
    }
    onInputChange() {
        this.validateInputValue();
        this.sync(true);
    }
    setBarWidth() {
        this.bar.style.width = `${this.togglerX}px`;
    }
}

class RangeDouble extends Range {
    constructor(node) {
        super(node);

        this.inputMin = {
            el: this.rootElem.querySelector(".range__value-item--min")
        }
        this.inputMax = {
            el: this.rootElem.querySelector(".range__value-item--max")
        }
        this.togglerMin = {
            el: this.rootElem.querySelector(".range__toggler--min")
        };
        this.togglerMax = {
            el: this.rootElem.querySelector(".range__toggler--max")
        }

        this.inputMin.el.addEventListener("change", this.onInputChange);
        this.inputMax.el.addEventListener("change", this.onInputChange);
        this.togglerMin.el.addEventListener("pointerdown", this.onPointerdown);
        this.togglerMax.el.addEventListener("pointerdown", this.onPointerdown);
        setDefaultValues.call(this);

        this.scale.addEventListener("pointerdown", onScalePointerdown.bind(this));

        function onScalePointerdown(event) {
            event.preventDefault();
            const x = event.clientX - this.shift - this.halfToggler;

            let closestToggler = x - this.togglerMin.x >= this.togglerMax.x - x
                ? this.togglerMax.el
                : this.togglerMin.el;

            this.moveToggler(x, closestToggler);
            closestToggler.dispatchEvent(new Event("pointerdown"));
        }
        function setDefaultValues() {
            const p = {
                defaultValueMin: { value: this.params.minValue, type: "number" },
                defaultValueMax: { value: this.params.maxValue, type: "number" }
            };
            setDefaultParams.call(this, p);
            if (this.params.defaultValueMin < this.params.minValue)
                this.params.defaultValueMin = this.params.minValue;
            if (this.params.defaultValueMax < this.params.maxValue)
                this.params.defaultValueMax = this.params.maxValue;

            this.inputMin.el.value = this.params.defalutValueMin;
            this.inputMax.el.value = this.params.defaultValueMax;
            this.sync(true);
        }
    }
    sync(byValueInput = false) {
        super.sync();

        if (byValueInput) {
            const numMin = this.validateInputValue(this.inputMin.el);
            const numMax = this.validateInputValue(this.inputMax.el);

            const minX = numMin / this.step - this.shiftByValue;
            const maxX = numMax / this.step - this.shiftByValue;
            this.moveToggler(minX, this.togglerMin.el);
            this.moveToggler(maxX, this.togglerMax.el);
        } else {
            const valueMin = Math.floor((this.togglerMin.x + this.shiftByValue) * this.step);
            const valueMax = Math.floor((this.togglerMax.x + this.shiftByValue) * this.step);
            this.setValue(this.inputMin.el, valueMin);
            this.setValue(this.inputMax.el, valueMax);
        }
    }
    validateInputValue(input) {
        // const regExp = this.params.ignoreMinusSign === "true"
        //     ? /[^.0-9]/g
        //     : /[^-.0-9]/g;
        const regExp = /[^.0-9]/g;
        let num = parseInt(input.value.replace(regExp, "").trim()) || 0;

        if (input === this.inputMin.el) {
            const maxValue = parseInt(this.inputMax.el.value.replace(regExp, "").trim());

            if (num < this.params.minValue) num = this.params.minValue;
            if (num > maxValue) num = maxValue;
        }
        if (input === this.inputMax.el) {
            const minValue = parseInt(this.inputMin.el.value);
            if (num < minValue) num = minValue;
            if (num > this.params.maxValue) num = this.params.maxValue;
        }

        this.setValue(input, num);
        return num;
    }
    onPointerdown(event) {
        onMove = onMove.bind(this);
        onUp = onUp.bind(this);

        const toggler = event.target;
        toggler.classList.add("__active");
        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onUp);

        function onMove(moveEvent) {
            moveEvent.preventDefault();
            const x = moveEvent.clientX - this.shift - this.halfToggler;

            if (toggler === this.togglerMin.el) {
                if (x >= 0 && x <= this.togglerMax.x) this.moveToggler(x, this.togglerMin.el);
                else if (x < 0) this.moveToggler(0, this.togglerMin.el);
                else if (x > this.togglerMax.x) this.moveToggler(this.togglerMax.x, this.togglerMin.el);
            }
            if (toggler === this.togglerMax.el) {
                if (x <= this.scaleWidth && x >= this.togglerMin.x) this.moveToggler(x, this.togglerMax.el);
                else if (x > this.scaleWidth) this.moveToggler(this.scaleWidth, this.togglerMax.el);
                else if (x < this.togglerMin.x) this.moveToggler(this.togglerMin.x, this.togglerMax.el);
            }
            this.sync();
        }
        function onUp() {
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerup", onUp);
            toggler.classList.remove("__active");
        }
    }
    moveToggler(x, toggler) {
        toggler.style.left = `${x}px`;
        if (toggler === this.togglerMin.el) this.togglerMin.x = x;
        if (toggler === this.togglerMax.el) this.togglerMax.x = x;
        this.setBarWidth();
    }
    onInputChange(event) {
        const input = event.target;
        this.validateInputValue(input);
        this.sync(true);
    }
    setBarWidth() {
        const diff =
            (getCoords(this.togglerMax.el).right - this.halfToggler) - getCoords(this.togglerMin.el).left;
        this.bar.style.width = `${diff}px`;
        this.bar.style.left = `${this.togglerMin.x}px`;
    }
}

class Cart {
    cartArray = [];
    cartItems = [];

    constructor(node) {
        this.calcPrices = this.calcPrices.bind(this);
        this.rootElem = node;
        this.totalPriceBlock = qs(".cart__total-price .price__value", this.rootElem);

        const self = this;
        onInitInputs();
        document.addEventListener("init-inputs", onInitInputs);

        function onInitInputs() {
            self.getCartArray();
            self.getCartItems();
        }
    }
    getCartItems() {
        const newCartItems = qsAll("[data-cart-item-key]", this.rootElem)
            .filter(node => !this.cartItems.find(obj => obj.node === node))
            .map(node => {
                const productTitle = qs(".cart__item-title", node)
                    ? qs(".cart__item-title", node).textContent.trim()
                    : "";
                const cartItemKey = node.dataset.cartItemKey;
                const removeButton = qs(".cart__item-remove", node);
                const priceBlock = qs(".cart__item-total .price__value", node);
                const amountNode = qs(".amount-change", node);
                const pricePerPieceBlock = qs(".cart__item-price .price__value", node);
                const pricePerPiece = pricePerPieceBlock
                    ? parseInt(pricePerPieceBlock.textContent.replace(/\D/g, ""))
                    : 0;
                let amountParams = initInput(amountNode, AmountChange);

                node.removeAttribute("data-cart-item-key");
                return {
                    node,
                    productTitle,
                    cartItemKey,
                    removeButton,
                    pricePerPiece,
                    priceBlock,
                    amountParams
                };
            });

        newCartItems.forEach(obj => {
            obj.removeButton.addEventListener("click", () => this.removeItem(obj));
            obj.amountParams.input.addEventListener("change", this.calcPrices);
        });

        this.cartItems = this.cartItems.concat(newCartItems);
        if (this.cartItems.length < 1 && this.rootElem && this.emptyLayout) {
            const sel = this.rootElem.className.split(" ")[0];
            this.oldLayoutNodes = qs(`.${sel} > *`, this.rootElem);
            this.rootElem.innerHTML = this.emptyLayout;
        } else if (this.oldLayoutNodes) {
            this.rootElem.innerHTML = "";
            this.oldLayoutNodes.forEach(n => this.rootElem.append(n));
        }
    }
    async getCartArray() {
        const res = await ajaxQuery("get_cart", { userNonce: wpAjaxData.userNonce }, "json");
        if (!res.success) return;

        if (!this.emptyLayout) this.emptyLayout = res.data.empty_layout;
        this.cartArray = res.data.cart;
        this.getCartItems();
    }
    async removeItem(obj) {
        if (!obj) return;
        const index = this.cartItems.findIndex(o => o.node === obj.node);
        if (index < 0) return;

        setLoadingState(obj.node);
        const res = await ajaxQuery("remove_from_cart", {
            cartItemKey: obj.cartItemKey
        }, "json");

        if (res.success) {
            htmlElementMethods.remove(obj.node, { transitionDur: 300 });
            this.cartItems.splice(index, 1);
        }

        unsetLoadingState(obj.node);
    }
    calcPrices() {
        let totalPrice = 0;
        this.cartItems.forEach(obj => {
            const itemPrice = parseInt(obj.amountParams.input.value) * obj.pricePerPiece;
            obj.priceBlock.textContent = itemPrice;
            totalPrice += itemPrice;
        });
        this.totalPriceBlock.textContent = totalPrice;

        this.setCartSync();
    }
    // спустя timeout, если пользователь за этот период не нажмет еще раз на изменение количества товара, запустится метод для актуализации товаров в корзине на бекенде.
    setCartSync() {
        if (this.syncCartTimeout)
            clearTimeout(this.syncCartTimeout);

        this.syncCartTimeout = setTimeout(async () => {
            const itemsData = this.cartItems.map(obj => {
                return {
                    key: obj.cartItemKey,
                    quantity: parseInt(obj.amountParams.input.value.replace(/\D/g, ""))
                };
            });
            setLoadingState(this.rootElem);
            const res = await ajaxQuery("sync_cart", { data: JSON.stringify(itemsData) }, "json");
            if (res.data && res.data.errors) {
                res.data.errors.forEach(errObj => {
                    const itemObj = this.cartItems.find(o => o.cartItemKey === errObj.cart_item_key);
                    if (!itemObj) return;

                    if (errObj.stock_quantity) {
                        itemObj.amountParams.input.value = errObj.stock_quantity;
                        itemObj.amountParams.input.dispatchEvent(new Event("change"));
                        popupsMethods.callPopup("error", {
                            destroyTimeout: 8000,
                            "error_text": `Вы выбрали больше товара "${itemObj.productTitle.replace(/\"/g, "")}", чем есть в наличии (${errObj.stock_quantity} шт.)`
                        });
                    }
                });
            }

            unsetLoadingState(this.rootElem);
        }, 750);
    }
}

const shopSelectors = [
    { selector: ".catalog", classInstance: Catalog },
    { selector: ".shop", classInstance: CatalogPage },
    { selector: ".filter", classInstance: Filter },
    { selector: ".range--single", classInstance: RangeSingle },
    { selector: ".range--double", classInstance: RangeDouble },
    { selector: ".cart", classInstance: Cart },
];
inittingSelectors = inittingSelectors.concat(shopSelectors);
initInputs();