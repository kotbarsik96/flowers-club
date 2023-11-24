// определить браузер
function getBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    let browser = [
        userAgent.match(/chrome/),
        userAgent.match(/opera/),
        userAgent.match(/safari/),
        userAgent.match(/firefox/)
    ].find(br => br);
    if (browser) browser = browser[0];

    return browser;
}

const isLoggedIn = document.body.classList.contains("logged-user");

const browser = getBrowser();
const mobileRegexp = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i;
let isMobileBrowser = Boolean(navigator.userAgent.match(mobileRegexp));

window.addEventListener("resize", setMobileClassname);
setMobileClassname();

function setMobileClassname() {
    isMobileBrowser = Boolean(navigator.userAgent.match(mobileRegexp));
    if (isMobileBrowser) {
        document.body.classList.add("__mobile");
    } else {
        document.body.classList.remove("__mobile");
    }
}

async function setCartNotify() {
    const res = await ajaxQuery("get_cart", { userNonce: wpAjaxData.userNonce }, "json");
    if (!res.success) return;

    const cart = res.data.cart;
    const cartIcons = qsAll(".icon-cart", qs(".header"));
    if (cart.length > 0) {
        cartIcons.forEach(iconCart => iconCart.classList.add("icon-wrapper--notify"));
    } else {
        cartIcons.forEach(iconCart => iconCart.classList.remove("icon-wrapper--notify"));
    }
}

// принимает сообщение о необходимости перезагрузить главную страницу из iframe
document.addEventListener("reload-page", onReloadPage);
function onReloadPage() {
    const parentDocument = window.parent.document;
    const isInIframe = parentDocument !== document;
    if (isInIframe) parentDocument.dispatchEvent(new CustomEvent("reload-page"));
    else location.reload();
}

function doReloadPage() {
    document.dispatchEvent(new Event("reload-page"));
}

// инициализирует кнопки, позволяющие выйти из аккаунта
function initLogoutButtons() {
    const buttons = qsAll("[data-logout-button]");
    buttons.forEach((btn) => {
        btn.removeAttribute("data-logout-button");
        btn.addEventListener("click", doLogout);
    });

    async function doLogout() {
        bodyLoadingState.setLoadingState();
        await ajaxQuery("user_logout");
        bodyLoadingState.unsetLoadingState();
        location.reload();
    }
}
initLogoutButtons();

// если нужно, чтобы в this.params класса были дефолтные параметры. Вызывается после присваивания this.params обязательно с контекстом this: setDefaultParams.call(this, defaultParams)
function setDefaultParams(defaultParams) {
    /* пример defaultParams:
          {
              minValue: { value: 0, type: "number" },
              maxValue: { value: 1000, type: "number" },
              valuePrefix: { value: "", type: "string" },
              valueSuffix: { value: "", type: "string" }
          }
      */

    for (let key in defaultParams) {
        const def = defaultParams[key];
        const prop = this.params[key];

        if (def.type === "number") {
            const num = parseInt(prop);
            if (!num && num !== 0) this.params[key] = def.value;
            else this.params[key] = num;
        }
        if (def.type === "string") {
            if (!prop || (prop && !prop.toString())) this.params[key] = def.value;
        }
        if (!def.type) {
            if (!prop) this.params[key] = def.value;
        }
    }

    if (this.params.minValue > this.params.maxValue) {
        this.params.minValue = defaultParams.minValue.value;
        this.params.maxValue = defaultParams.maxValue.value;
    }
}
// инициализация элементов-классов
let inittedInputs = [];
let inittedInputsTrashCan = [];
// спустя 5 итераций вызовов initInputs(), попавшие в корзину элементы будут удалены
const maxInittedInputsTrashCanCounts = 5;
function initInputs() {
    inittingSelectors.forEach((selectorData) => {
        const selector = selectorData.selector;
        const classInstance = selectorData.classInstance;
        const notInittedNodes = Array.from(
            document.querySelectorAll(selector)
        ).filter((node) => {
            let isInittedWithoutArray = node.hasAttribute("data-i");
            if (isInittedWithoutArray) return false;

            const isInArray = inittedInputs.find((inpClass) => {
                return (
                    inpClass.rootElem === node &&
                    inpClass instanceof selectorData.classInstance
                );
            });
            return isInArray ? false : true;
        });

        notInittedNodes.forEach((inittingNode) => {
            initInput(inittingNode, classInstance, selectorData, true);
        });
    });

    setTimeout(() => {
        // очистить inittedInputs от элементов, не присутствующих на странице
        clearInittedInputs();
        document.dispatchEvent(new Event("init-inputs"));
    }, 0);
}

/* можно использовать эту функцию, если нужно вручную инициализировать компонент. Она же используется в initInputs(). В таком случае avoidChecks не нужно указывать! 
возвращает инициализированный компонент или undefined, если не передан node или classInstance
*/
function initInput(node, classInstance, selectorData = {}, avoidChecks = false) {
    if (!avoidChecks) {
        if (!node || !classInstance) return;
        const alreadyInitted = node.hasAttribute("data-i")
            || inittedInputs.find(inpP => inpP.rootElem === node && inpP instanceof classInstance);
        if (alreadyInitted) return alreadyInitted;
    }

    const inst = new classInstance(node);
    // если не нужно инициализировать элемент совсем
    if (selectorData.noInit) return inst;
    // если нужно инициализировать элемент, но при этом не нужно помещать его в массив inittedInputs
    if (selectorData.noArray) {
        // пометить, что элемент инициализирован, т.к. он не будет помещен в массив inittedInputs
        node.setAttribute("data-i", true);
        return inst;
    }
    // поместить в массив инициализированный элемент
    inittedInputs.push(inst);

    return inst;
}

function clearInittedInputs() {
    inittedInputs.forEach((inpParams) => {
        if (
            !inpParams.rootElem.closest("body") &&
            !inpParams.neverRemoveFromArray
        ) {
            inittedInputsTrashCan.push({ inpParams, count: 0 });
        }
    });

    inittedInputsTrashCan.forEach((obj, index, array) => {
        // если элемент появился на странице, убрать его из корзины
        if (obj.inpParams.rootElem.closest("body")) array.splice(index, 1);
        // когда count будет больше, чем значение maxInittedInputsTrashCanCounts, элемент будет удален из всех массивов. count увеличивается при каждом вызове initInputs();
        obj.count++;
        // удалить элемент из всех массивов, чтобы он был удален сборщиком мусора
        if (obj.count > maxInittedInputsTrashCanCounts) {
            setTimeout(() => {
                array.splice(index, 1);
                const inittedInputsIndex = inittedInputs.findIndex(
                    (inpP) => inpP.rootElem === obj.inpParams.rootElem
                );
                if (inittedInputsIndex >= 0)
                    inittedInputs.splice(inittedInputsIndex, 1);
            }, 0);
        }
    });
}

function findInittedInput(selector, isAll = false) {
    // isAll == true: вернет array, isAll == false: вернет первый найденный по селектору элемент
    const selectorNodes = Array.from(document.querySelectorAll(selector));
    if (!isAll) {
        const input = inittedInputs.find(arrayHandler);
        return input || null;
    } else {
        const inputs = inittedInputs.filter(arrayHandler);
        return inputs || null;
    }

    function arrayHandler(inpClass) {
        return selectorNodes.includes(inpClass.rootElem);
    }
}

function findInittedInputByFlag(instanceFlag, isAll = false) {
    // isAll == true: вернет array, isAll == false: вернет первый найденный по флагу элемент
    if (isAll) {
        const inputs = inittedInputs.filter(arrayHandler);
        return inputs;
    } else {
        const input = inittedInputs.find(arrayHandler);
        return input;
    }

    function arrayHandler(inpClass) {
        let matches = inpClass.instanceFlag === instanceFlag;
        return matches;
    }
}

class Search {
    constructor(node) {
        this.toggle = this.toggle.bind(this);
        this.onMediaChange = this.onMediaChange.bind(this);

        this.rootElem = node;
        this.searchWrapper = qs(".search-wrapper", this.rootElem);
        this.searchIcon = qs(".search-wrapper__icon", this.rootElem);
        this.input = qs(".search-wrapper__input", this.rootElem);
        const disableToggleMedia = this.rootElem.dataset.disableToggle;

        this.searchIcon.addEventListener("click", this.toggle);
        if (disableToggleMedia) {
            this.disableToggleMedia = window.matchMedia(disableToggleMedia);
            this.disableToggleMedia.addEventListener("change", this.onMediaChange);
            this.rootElem.removeAttribute("data-disable-toggle");
            this.onMediaChange();
        }
        this.rootElem.classList.contains("__shown") ? this.show() : this.hide();

        this.searchParams = this.initSearch();
    }
    onMediaChange() {
        if (this.disableToggleMedia.matches) {
            this.show();
            this.searchIcon.removeEventListener("click", this.toggle);
        } else {
            this.hide();
            this.searchIcon.addEventListener("click", this.toggle);
        }
    }
    toggle() {
        this.rootElem.classList.contains("__shown") ? this.hide() : this.show();
    }
    hide() {
        this.rootElem.classList.remove("__shown");
        this.input.style.maxWidth = "0px";
    }
    show() {
        this.rootElem.classList.add("__shown");
        const width =
            getSizes(this.rootElem, {
                selector: ".search-wrapper__input",
            }).width || 50;
        this.input.style.maxWidth = `${width}px`;
    }
    initSearch() {
        const data = bindMethods(this, {
            resultsContainer: qs(".search__results", this.rootElem),
            timeout: 500,
            timeoutHandler: null,

            init() {
                this.input.addEventListener("input", data.onInput);
                this.input.addEventListener("focus", data.onFocus);
                this.input.addEventListener("blur", data.onBlur);
                this.input.addEventListener("keyup", data.onKeyup);
                if (!data.resultsContainer) {
                    data.resultsContainer = createElement("ul", "search__results");
                    this.rootElem.append(data.resultsContainer);
                }
            },
            onFocus() {
                this.rootElem.classList.add("__focus");
            },
            onBlur() {
                setTimeout(() => {
                    this.rootElem.classList.remove("__focus");
                }, 100);
            },
            onKeyup(event) {
                if (event.key.match(/enter/i))
                    this.search();
            },
            // этот метод отвечает за то, чтобы через 2 секунды после последнего события input запустить search
            onInput() {
                // очистить запущенный таймаут
                if (data.timeoutHandler) clearTimeout(data.timeoutHandler);
                // поставить новый. Будет очищен и перезаписан, если в течение времени, указанного в data.timeout, не будет введено никакое новое значение
                data.timeoutHandler = setTimeout(data.search, data.timeout);
            },
            async search() {
                const value = this.input.value.trim();

                if (!value) {
                    this.rootElem.classList.remove("__have-results");
                    return;
                }

                data.resultsContainer.innerHTML = "";
                const res = await ajaxQuery("search", { searchQuery: value }, "json");
                const hasResults = Object.values(res).find(o => o.length > 0);
                if (res && hasResults) {
                    this.rootElem.classList.add("__have-results");
                } else {
                    this.rootElem.classList.remove("__have-results");
                }

                res.products.forEach(obj => {
                    data.resultsContainer.insertAdjacentHTML("beforeend", `
                    <li class="search__results-item">
                        <a href="${obj.url}">
                            <span class="search__result-image search__result-image--round">
                                <img src="${obj.image}">
                            </span>
                            <span class="search__result-texts">
                                <span class="search__result-title">
                                    ${cutText(obj.title, 75, { addEllipsis: true })}
                                </span>
                                <span class="search__result-price">
                                    ${obj.price_with_symbol}
                                </span>
                            </span>
                        </a>
                    </li>
                `);
                });
                res.pages.forEach(obj => {
                    data.resultsContainer.insertAdjacentHTML("beforeend", `
                        <li class="search__results-item">
                            <a href="${obj.url}">
                                <span class="search__result-texts">
                                    <span class="search__result-title">
                                        ${obj.title}
                                    </span>
                                </span>
                            </a>
                        </li>
                    `);
                });
                res.users.forEach(obj => {
                    data.resultsContainer.insertAdjacentHTML("beforeend", `
                        <li class="search__results-item">
                            <a href="${obj.user_page_url}">
                                <span class="search__result-image search__result-image--round">
                                    <img src="${obj.avatar_url}">
                                </span>
                                <span class="search__result-title">
                                    ${obj.first_name || ""}
                                    ${obj.last_name || ""}
                                    ${obj.patronymic_name || ""}
                                </span>
                            </a>
                        </li>
                    `);
                });
                res.articles.forEach(obj => {
                    data.resultsContainer.insertAdjacentHTML("beforeend", `
                        <li class="search__results-item">
                            <a href="${obj.url}">
                                <span class="search__result-image search__result-image--round">
                                    <img src="${obj.avatar}">
                                </span>
                                <span class="search__result-texts">
                                    <span class="search__result-title">
                                        ${cutText(obj.title, 50, { addEllipsis: true })}
                                    </span>
                                    <span class="search__result-text">
                                        ${cutText(obj.content, 50, { addEllipsis: true })}
                                    </span>
                                </span>
                            </a>
                        </li>
                    `);
                });
            }
        });
        data.init();

        return data;
    }
}

class Spoiler {
    constructor(node) {
        this.toggle = this.toggle.bind(this);

        this.rootElem = node;
        this.spoilerContent = this.rootElem.querySelector(".spoiler__content");
        this.spoilerButton = this.rootElem.querySelector(".spoiler__button");

        this.rootElem.classList.contains("__shown") ? this.show() : this.hide();
        this.spoilerButton.addEventListener("click", this.toggle);
    }
    toggle() {
        this.rootElem.classList.contains("__shown") ? this.hide() : this.show();
    }
    hide() {
        this.rootElem.classList.remove("__shown");
        this.spoilerContent.style.cssText =
            "max-height: 0px; padding: 0; marign: 0;";
    }
    show() {
        this.rootElem.classList.add("__shown");
        const height = getSizes(this.spoilerContent, {
            setOriginalWidth: true,
        }).height;

        this.spoilerContent.style.maxHeight = `${height}px`;
        this.spoilerContent.style.removeProperty("padding");
        this.spoilerContent.style.removeProperty("margin");
    }
}

class Header {
    constructor(node) {
        this.toggleMenu = this.toggleMenu.bind(this);
        this.onDocClick = this.onDocClick.bind(this);

        this.rootElem = node;
        this.menuButton = this.rootElem.querySelector(".header__menu-button");
        this.siteMenu = document.querySelector(".site-menu");

        this.menuButton.addEventListener("click", this.toggleMenu);
        document.addEventListener("click", this.onDocClick);
    }
    toggleMenu() {
        this.menuButton.classList.contains("__active")
            ? this.hideMenu()
            : this.showMenu();
    }
    showMenu() {
        this.menuButton.classList.add("__active");
        this.siteMenu.classList.add("__shown");
        document.body.classList.add("__locked-scroll");
    }
    hideMenu() {
        this.menuButton.classList.remove("__active");
        this.siteMenu.classList.remove("__shown");
        document.body.classList.remove("__locked-scroll");
    }
    onDocClick(event) {
        const isNotShownOrActive =
            !this.menuButton.classList.contains("__active") &&
            !this.siteMenu.classList.contains("__shown");
        if (isNotShownOrActive) return;

        if (
            event.target !== this.rootElem &&
            !event.target.closest(".site-menu") &&
            !event.target.closest(".header__menu-button") &&
            event.target !== this.menuButton
        )
            this.hideMenu();
    }
}

class DynamicAdaptive {
    constructor(node) {
        this.onMediaChange = this.onMediaChange.bind(this);

        this.rootElem = node;
        const dataset = this.rootElem.dataset.dynamicAdaptive.split(", ");
        this.params = {
            selector: dataset[0],
            media: window.matchMedia(`(max-width: ${dataset[1]}px)`),
            isReplace: dataset[2] && dataset[2] != "false" ? true : false,
        };
        if (this.params.isReplace)
            this.replaceNode = findClosest(this.rootElem, `${this.params.selector}`);
        else
            this.destinationNode = findClosest(
                this.rootElem,
                `${this.params.selector}`
            );

        this.anchor = createElement("div", "__removed");

        this.params.media.addEventListener("change", this.onMediaChange);
        this.onMediaChange();
    }
    onMediaChange() {
        if (this.params.media.matches) {
            this.rootElem.replaceWith(this.anchor);

            if (this.replaceNode) this.replaceNode.replaceWith(this.rootElem);
            else if (this.destinationNode) this.destinationNode.append(this.rootElem);
        } else {
            if (!this.anchor.closest("body")) return;

            this.anchor.replaceWith(this.rootElem);
            if (this.replaceNode) this.replaceNode.remove();
        }
    }
}

class ToggleSlider {
    /* 
          params:
          sliderMedia: числовая строка - на каком медиа-запросе нужно включать слайдер. Если отсутствует, слайдер не включается
          widthMedia: "min"|"max" - по умолчанию "max", означает "(min-width)" или "(max-width)" соответственно для sliderMedia
      */
    constructor(node) {
        this.rootElem = node;
        this.params = getParams(this);
        this.rootElem.removeAttribute("data-params");

        this.getSliderMedia();
    }
    getSliderMedia() {
        if (!this.params.sliderMedia) return;
        onMediaChange = onMediaChange.bind(this);
        enableSlider = enableSlider.bind(this);
        disableSlider = disableSlider.bind(this);

        const widthMedia =
            this.params.widthMedia === "min" || this.params.widthMedia === "max"
                ? this.params.widthMedia
                : "max";
        const mediaValue = this.params.sliderMedia;
        this.sliderMedia = window.matchMedia(
            `(${widthMedia}-width: ${mediaValue.replace(/\D/g, "")}px)`
        );

        this.sliderMedia.addEventListener("change", onMediaChange);
        onMediaChange();

        function onMediaChange() {
            if (this.sliderMedia.matches) enableSlider();
            else disableSlider();
        }
        function enableSlider() {
            const self = this;
            self.sliderParams = new Swiper(self.rootElem, {
                wrapperClass: self.params.wrapperClass || "swiper-wrapper",
                slideClass: self.params.slideClass || "swiper-slide",
                slidesPerView: parseFloat(self.params.slidesPerView) || "auto",
                spaceBetween: parseFloat(self.params.spaceBetween) || 10,
                on: {
                    slideChange() {
                        self.rootElem.dispatchEvent(new CustomEvent("slide-change"));
                    }
                }
            });
        }
        function disableSlider() {
            if (!this.sliderParams) return;

            this.sliderParams.disable();
            this.sliderParams.destroy();
            this.sliderParams = null;
        }
    }
}

class NavTile {
    constructor(node) {
        this.toggleMobileHidden = this.toggleMobileHidden.bind(this);

        this.rootElem = node;
        this.media = window.matchMedia("(max-width: 767px)");
        this.mobileHiddenToggle = this.rootElem.querySelector(
            ".nav-tile__item--mobile-toggle"
        );

        if (this.mobileHiddenToggle)
            this.mobileHiddenToggle.addEventListener(
                "click",
                this.toggleMobileHidden
            );
    }
    toggleMobileHidden(cancelToggle = false) {
        show = show.bind(this);
        hide = hide.bind(this);
        if (cancelToggle === true) return { show, hide };

        this.mobileHiddenToggle.classList.contains("__active") ? hide() : show();

        function show() {
            this.mobileHiddenToggle.classList.add("__active");
        }
        function hide() {
            this.mobileHiddenToggle.classList.remove("__active");
        }
    }
}

class Tabs {
    constructor(node) {
        this.onBtnClick = this.onBtnClick.bind(this);
        this.setLinePosition = this.setLinePosition.bind(this);
        onResize = onResize.bind(this);

        this.rootElem = node;
        this.params = getParams(this);
        this.buttonsListContainer = this.rootElem.querySelector(
            ".tabs__buttons-list"
        );
        this.contentContainer = this.rootElem.querySelector(".tabs__content");
        this.buttons = [];
        this.contentItems = [];
        this.line = createElement("div", "tabs__buttons-line");
        const dependenciesBlocks = Array.from(
            this.rootElem.querySelectorAll(".tabs__dependencies")
        );
        this.dependenciesBlocks = dependenciesBlocks.map((parentNode) => {
            const dependencies = Array.from(
                parentNode.querySelectorAll(".tabs__dependency-item")
            );
            return { parentNode, dependencies };
        });

        this.rootElem.removeAttribute("data-params");
        this.getData();

        this.buttonsListContainer.append(this.line);
        if (this.buttons.length > this.contentItems.length) {
            const diff = this.buttons.length - this.contentItems.length;
            for (let i = 0; i < diff; i++) {
                const contentItem = createElement("div", "tabs__content-item");
                this.contentContainer.append(contentItem);
            }
        }

        if (!this.params.transitionDur) this.params.transitionDur = 150;
        this.line.style.transitionDuration = `${this.params.transitionDur / 1000}s`;

        window.addEventListener("resize", onResize);
        onResize();
        setContentContainerObserver.call(this);

        const defaultItemIndex = this.params.defaultItemIndex || 0;
        this.setContent(defaultItemIndex);
        setTimeout(() => this.setLinePosition(), 100);

        function onResize() {
            this.isInRow = checkRow.call(this);
            this.setLinePosition();

            function checkRow() {
                let isInRow = true;
                const arr = this.buttons;
                for (let i = 0; i < arr.length; i++) {
                    if (i === 0) continue;

                    const btnCoords = getCoords(arr[i]);
                    const prevBtnCoords = getCoords(arr[i - 1]);
                    if (btnCoords.top !== prevBtnCoords.top) {
                        isInRow = false;
                        break;
                    }
                }
                return isInRow;
            }
        }
        function setContentContainerObserver() {
            const observer = new MutationObserver((mutlist) => this.getData());
            observer.observe(this.contentContainer, { childList: true });
        }
    }
    getData() {
        const newButtons = Array.from(
            this.buttonsListContainer.querySelectorAll(".tabs__button")
        ).filter((btn) => !this.buttons.includes(btn));
        this.buttons = this.buttons.concat(newButtons);
        newButtons.forEach((btn) => {
            btn.addEventListener("click", this.onBtnClick);
        });

        const newContentItems = Array.from(
            this.rootElem.querySelectorAll(".tabs__content-item")
        ).filter((i) => !this.contentItems.includes(i));
        const newContentItemsClone = newContentItems.map((i) => i);
        newContentItemsClone.forEach((itemNode, index) => {
            const replaceIndex = parseInt(itemNode.dataset.tabContentReplace);
            if (!replaceIndex && replaceIndex !== 0) return;

            if (this.contentItems[replaceIndex])
                this.contentItems[replaceIndex] = itemNode;
            else this.contentItems.push(itemNode);
            newContentItems.splice(index, 1);
        });
        this.contentItems = this.contentItems.concat(newContentItems);
        newContentItemsClone.forEach((item) => item.remove());
    }
    onBtnClick(event) {
        const btn = event.target;
        const index = this.buttons.indexOf(btn);

        if (index < 0) return;

        if (this.currentIndex != index) this.setContent(index);
    }
    setContent(index) {
        insertItem = insertItem.bind(this);
        removeDependencies = removeDependencies.bind(this);

        const item = this.contentItems[index];
        if (!item || this.currentItemIndex === index) return;

        const otherItems = this.contentItems.filter((ci) => {
            return ci.closest("body") && ci !== item;
        });
        this.currentItemIndex = index;

        const button = this.buttons[index];
        const otherButtons = this.buttons.filter((b) => b !== button);
        button.classList.add("__active");
        otherButtons.forEach((b) => b.classList.remove("__active"));

        const transitionDur = this.params.transitionDur;
        const insertParams = { transitionDur, insertType: "prepend" };

        removeDependencies();

        if (otherItems.length < 1) insertItem();
        else
            otherItems.forEach((otherItem, i, arr) => {
                if (i === arr.length - 1) {
                    htmlElementMethods
                        .remove(otherItem, { transitionDur })
                        .then(insertItem);
                } else htmlElementMethods.remove(otherItem, { transitionDur });
            });

        function insertItem() {
            htmlElementMethods.insert(item, this.contentContainer, insertParams);
            this.setLinePosition();
            this.dependenciesBlocks.forEach((obj) => {
                const el = obj.dependencies[index];
                const parentNode = obj.parentNode;
                htmlElementMethods.insert(el, parentNode, insertParams);
            });
        }
        function removeDependencies() {
            this.dependenciesBlocks.forEach((obj) => {
                obj.dependencies.forEach((node, i) => {
                    if (i === index) return;

                    htmlElementMethods.remove(node, { transitionDur });
                });
            });
        }
    }
    setLinePosition() {
        const activeButton = this.buttons.find((btn) =>
            btn.classList.contains("__active")
        );
        if (!activeButton) return;

        const width = activeButton.offsetWidth;
        const left =
            getCoords(activeButton).left - getCoords(this.buttonsListContainer).left;

        this.line.style.width = `${width}px`;
        this.line.style.left = `${left}px`;

        if (!this.isInRow) {
            const activeButtonBottom = activeButton.getBoundingClientRect().bottom;
            const buttonsListBottom =
                this.buttonsListContainer.getBoundingClientRect().bottom;
            const bottom = buttonsListBottom - activeButtonBottom;
            this.line.style.bottom = `${bottom}px`;
            this.buttons.forEach((btn) => (btn.style.paddingBottom = "10px"));
        } else {
            this.line.style.removeProperty("bottom");
            this.buttons.forEach((btn) => btn.style.removeProperty("padding-bottom"));
        }
    }
}

class StarRating {
    constructor(node) {
        this.rootElem = node;
        this.fullStars = {
            container: createElement("div", "star-rating__fullstars"),
            stars: [],
        };
        this.emptyStars = {
            container: createElement("div", "star-rating__empty-stars"),
            stars: [],
        };
        this.params = getParams(this);
        setDefaultParams.call(this);

        this.rootElem.append(this.fullStars.container);
        this.rootElem.append(this.emptyStars.container);
        this.createStars();
        this.rootElem.removeAttribute("data-params");
        if (this.params.noInteract)
            this.rootElem.classList.add("star-rating--no-interact");

        function setDefaultParams() {
            if (!this.params.starsAmount) this.params.starsAmount = 5;
            if (!this.params.defaultAmount) this.params.defaultAmount = 0;
        }
    }
    createStars() {
        onPointerOver = onPointerOver.bind(this);

        this.emptyStars.container.innerHTML = "";
        this.fullStars.container.innerHTML = "";
        this.emptyStars.stars = [];
        this.fullStars.stars = [];

        for (let i = 0; i < this.params.starsAmount; i++) {
            const fullStar = createElement(
                "span",
                "star-rating__star icon-star-colored"
            );
            const emptyStar = createElement("span", "star-rating__star icon-star");

            if (!this.params.noInteract)
                emptyStar.addEventListener("pointerover", onPointerOver);

            this.fullStars.container.append(fullStar);
            this.emptyStars.container.append(emptyStar);
            this.fullStars.stars.push(fullStar);
            this.emptyStars.stars.push(emptyStar);
        }
        this.setValue(this.params.defaultAmount - 1);

        function onPointerOver(event) {
            onPointerLeave = onPointerLeave.bind(this);
            onPointerUp = onPointerUp.bind(this);

            const star = event.target;
            const starIndex = this.emptyStars.stars.indexOf(star);
            if (starIndex < 0) return;
            this.setWidth(starIndex);

            star.addEventListener("pointerleave", onPointerLeave);
            star.addEventListener("pointerup", onPointerUp);

            function onPointerLeave() {
                this.setWidth(this.currentStarIndex);
                removeHandlers();
            }
            function onPointerUp() {
                this.setValue(starIndex);
                removeHandlers();
            }
            function removeHandlers() {
                star.removeEventListener("pointerleave", onPointerLeave);
                star.removeEventListener("pointerup", onPointerUp);
            }
        }
    }
    setValue(starIndex = null) {
        if (!starIndex && starIndex !== 0) starIndex = -1;

        this.currentStarIndex = parseInt(starIndex);
        this.setWidth(starIndex);
        const detail = { ratingValue: this.currentStarIndex + 1 };
        this.rootElem.dispatchEvent(new CustomEvent("rating-change", { detail }));
    }
    setWidth(starIndex) {
        if (starIndex < 0) {
            this.fullStars.container.style.width = 0;
        }

        const starNumber = starIndex + 1;
        const percent = starNumber / (this.params.starsAmount / 100);
        this.fullStars.container.style.width = `${percent}%`;
    }
    get onRatingChange() {
        return function (handler) {
            this.rootElem.addEventListener("rating-change", handler);
        }
    }
}

class Select {
    constructor(node) {
        this.onOptionClick = this.onOptionClick.bind(this);

        this.rootElem = node;
        this.valueNode = this.rootElem.querySelector(".select__value");
        this.optionsUl = this.rootElem.querySelector(".select__options-list");

        this.getOptions();
        setFirstValue.call(this);
        addToggleListHandlers.call(this);

        function setFirstValue() {
            const ariaSelectedObj =
                this.options.find((obj) => obj.li.hasAttribute("aria-selected")) ||
                this.options[0];
            this.setValue(ariaSelectedObj.value);
        }
        function addToggleListHandlers() {
            this.valueNode.addEventListener("click", () => this.toggleList());

            document.addEventListener("click", (event) => {
                const exception =
                    event.target.classList.contains("select") ||
                    event.target.closest(".select") === this.rootElem;
                if (exception) return;

                this.toggleList(true).hide();
            });
        }
    }
    getOptions() {
        if (!this.options) this.options = [];

        const newOptions = Array.from(
            this.rootElem.querySelectorAll(".select__option")
        )
            .filter((li) => !this.options.find((obj) => obj.li === li))
            .map((li) => {
                const text = getTextContent(li);
                const value = li.dataset.value || text || "";
                return { li, text, value };
            });
        newOptions.forEach((obj) =>
            obj.li.addEventListener("click", this.onOptionClick)
        );

        this.options = this.options.concat(newOptions);
    }
    onOptionClick(event) {
        const li = event.target;
        const optionObj = this.options.find((obj) => obj.li === li);
        this.setValue(optionObj.value);
    }
    setValue(value) {
        const optionsObject = this.options.find((obj) => obj.value === value);
        if (!optionsObject) {
            const newOption = `<li class="select__option" role="option">${value.trim()}</li>`;
            this.rootElem.insertAdjacentHTML("beforeend", newOption);
            this.getOptions();
        }
        setTextContent(this.valueNode, optionsObject.text);
        this.options.forEach((obj) => {
            if (obj.value === value) obj.li.classList.add("__active");
            else obj.li.classList.remove("__active");
        });
        this.toggleList(true).hide();

        this.value = value;
        this.rootElem.dispatchEvent(new Event("change"));
    }
    toggleList(boolean) {
        show = show.bind(this);
        hide = hide.bind(this);

        if (boolean) return { show, hide };

        this.rootElem.classList.contains("__shown") ? hide() : show();

        function show() {
            this.rootElem.classList.add("__shown");
            const maxHeight = getMaxHeight(this.optionsUl);
            this.optionsUl.style.cssText = `max-height: ${maxHeight}px;`;
        }
        function hide() {
            this.rootElem.classList.remove("__shown");
            this.optionsUl.style.maxHeight = "0px";
        }
    }
}

class InputButtonsList {
    constructor(node) {
        this.getInputs = this.getInputs.bind(this);
        this.onChange = this.onChange.bind(this);

        this.rootElem = node;
        this.params = getParams(this);
        this.inputs = this.getInputs();

        document.addEventListener("init-inputs", this.getInputs);
    }
    getInputs() {
        if (!this.inputs) this.inputs = [];

        const newInputs = qsAll(".radio-item, .checkbox-item", this.rootElem)
            .filter(node => !this.inputs.find(o => o.node === node))
            .map(node => {
                const input = qs("input[type='radio'], input[type='checkbox']", node);
                const type = input.getAttribute("type");
                return { node, input, type };
            });

        newInputs.forEach(obj => {
            obj.node.addEventListener("change", this.onChange);
        });

        this.inputs = this.inputs.concat(newInputs);
        return this.inputs;
    }
    onChange() {
        this.rootElem.dispatchEvent(new Event("change"));
    }
}

// вставка: <div class="amount-change" data-params="minValue:1; maxValue:99; value:4"></div>
class AmountChange {
    constructor(node) {
        this.onInputChange = this.onInputChange.bind(this);
        this.onInput = this.onInput.bind(this);
        this.doPlus = this.doPlus.bind(this);
        this.doMinus = this.doMinus.bind(this);

        this.rootElem = node;
        this.rootElem.innerHTML = getLayout();
        this.buttonPlus = this.rootElem.querySelector(
            ".amount-change__button--plus"
        );
        this.buttonMinus = this.rootElem.querySelector(
            ".amount-change__button--minus"
        );
        this.input = this.rootElem.querySelector(".amount-change__input");
        this.params = getParams(this);

        setHandlers.call(this);
        setDefaultValues.call(this);

        this.input.value = this.params.value;
        this.input.dispatchEvent(new Event("change"));

        function setDefaultValues() {
            const defaultParams = {
                minValue: { value: 0, type: "number" },
                maxValue: { value: 99, type: "number" },
            };
            setDefaultParams.call(this, defaultParams);
            if (this.params.minValue < 0)
                this.params.minValue = 0;
            if (this.params.minValue > this.params.maxValue)
                this.params.minValue = this.params.maxValue;

            if (
                !this.params.value ||
                typeof this.params.value !== "string"
            )
                this.params.value = this.params.minValue;
        }
        function setHandlers() {
            this.input.addEventListener("change", this.onInputChange);
            this.input.addEventListener("input", this.onInput);
            this.buttonPlus.addEventListener("click", this.doPlus);
            this.buttonMinus.addEventListener("click", this.doMinus);
        }
        function getLayout() {
            return `
            <button class="amount-change__button amount-change__button--minus" type="button">
                -
            </button>
            <input class="amount-change__input" type="text">
            <button class="amount-change__button amount-change__button--plus" type="button">
                +
            </button>
            `;
        }
    }
    onInputChange() {
        const value = this.input.value.trim();
        if (value.length > 1 && value.startsWith("0"))
            this.input.value = this.input.value.slice(1);
        this.setInputWidth();
    }
    getNumValue() {
        return parseInt(this.input.value.replace(/\D/g, ""));
    }
    onInput() {
        const num = this.getNumValue() || "";
        if (num) {
            if (num < this.params.minValue) this.input.value = this.params.minValue;
            if (num > this.params.maxValue) this.input.value = this.params.maxValue;
        }
        this.setInputWidth();
    }
    setInputWidth() {
        const value = this.input.value;
        const width = value.length > 0 ? value.length / 1.5 : 0.5;
        this.input.style.width = `${width}em`;
    }
    doPlus() {
        const num = this.getNumValue();
        if (num < this.params.maxValue) this.input.value = num + 1;
        this.input.dispatchEvent(new Event("change"));
    }
    doMinus() {
        const num = this.getNumValue();
        if (num > this.params.minValue) this.input.value = num - 1;
        this.input.dispatchEvent(new Event("change"));
    }
}

// используется только внутри LoadableFeed
class ArticleTagsList {
    constructor(node) {
        this.onClick = this.onClick.bind(this);

        this.rootElem = node;
        this.params = getParams(this);
        this.buttons = [];

        this.getButtons();
    }
    getButtons() {
        const newButtons = qsAll("[data-category-url]", this.rootElem)
            .filter((node) => !this.buttons.find((obj) => obj.node === node))
            .map((node) => {
                const url = node.dataset.categoryUrl;
                let slug = getSlugFromURL(url);
                if (slug === "#") slug = "all";
                return { node, slug };
            });

        newButtons.forEach((obj) => {
            obj.node.addEventListener("click", this.onClick);
        });

        this.buttons = this.buttons.concat(newButtons);
    }
    onClick(event) {
        event.preventDefault();
        const obj = this.buttons.find((obj) => obj.node === event.target);
        if (!obj) return;

        const slug = obj.slug;
        if (slug === this.currentSlug) return;
        this.rootElem.dispatchEvent(
            new CustomEvent("set-slug", { detail: { slug } })
        );
    }
    setActive(slug) {
        this.currentSlug = slug;
        this.buttons.forEach((obj) => {
            if (obj.slug === slug) {
                obj.node.classList.add("__active");
                return;
            }
            obj.node.classList.remove("__active");
        });
    }
}

class LoadableFeed {
    constructor(node) {
        this.getNewLists = this.getNewLists.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.onSetSlug = this.onSetSlug.bind(this);
        this.onSlideChange = this.onSlideChange.bind(this);

        this.rootElem = node;
        this.params = getParams(this, "loadableFeed");
        this.postsPerPage = parseInt(this.params.postsPerPage) || 7;
        this.name = this.params.name || "";
        this.lists = [];
        this.slugsWithUrls = [];
        if (this.params.staticSlug) {
            this.slugsWithUrls = [{ slug: this.params.staticSlug }];
        } else this.getNewLists();
        this.loadingStateController = new LoadingState(this.rootElem);

        document.addEventListener("init-inputs", this.getNewLists);

        onInitInputs = onInitInputs.bind(this);
        setDefaultSlug = setDefaultSlug.bind(this);

        document.addEventListener("init-inputs", onInitInputs);
        setDefaultSlug();
        setTimeout(() => {
            window.addEventListener("scroll", this.onScroll);
        }, 100);

        function onInitInputs() {
            this.getNewLists();
        }
        function setDefaultSlug() {
            if (this.params.staticSlug) {
                this.currentSlug = this.params.staticSlug;
                this.setActive(this.currentSlug);
                return;
            }

            const firstSlugObj =
                this.slugsWithUrls.find((o) => o.slug === "all") ||
                this.slugsWithUrls[0];
            if (!firstSlugObj) return;

            this.currentSlug = firstSlugObj.slug;
            this.setActive(this.currentSlug);
        }
    }
    getNewLists() {
        const newLists = qsAll(`[data-choose-taxonomy="${this.name}"]`)
            .filter((node) => !this.lists.find((obj) => obj.node === node))
            .map((node) => {
                const params = new ArticleTagsList(node);
                return { node, params };
            });
        newLists.forEach((obj) => {
            obj.node.addEventListener("set-slug", this.onSetSlug);
            obj.params.buttons.forEach((linkObj) => {
                const slug = linkObj.slug;
                if (this.slugsWithUrls.find((o) => o.slug === slug)) return;

                this.slugsWithUrls.push({ slug, url: linkObj.href });
            });
            obj.params.setActive(this.currentSlug);
        });

        this.lists = this.lists.concat(newLists);
    }
    onScroll() {
        // если обнаруживается, что на текущий момент является swiper-wrapper'ом или slider'ом, отменить onScroll и поставить обработчик на пролистывание слайдера, если такой обработчик еще не выставлен, а выполнение текущего метода остановить
        const isSlider = this.rootElem.classList.contains("swiper-initialized")
            || this.rootElem.parentNode.classList.contains("swiper-initialized");
        if (!this.slider && isSlider) {
            if (this.rootElem.classList.contains("swiper-initialized"))
                this.slider = this.rootElem;
            if (this.rootElem.parentNode.classList.contains("swiper-initialized"))
                this.slider = this.rootElem.parentNode;

            this.slider.addEventListener("slide-change", this.onSlideChange);
        }
        if (isSlider) return;

        if (this.isDoingAjaxQuery || this.noMorePosts) return;

        const scrollTop = window.scrollY;
        const windowHeight =
            document.documentElement.clientHeight || window.innerHeight;
        const windowBottom = scrollTop + windowHeight;
        const rootElCoords = getCoords(this.rootElem);
        const rootElBottom = rootElCoords.bottom;

        if (windowBottom > rootElBottom + 20)
            this.loadNewArticles();
    }
    onSlideChange() {
        // swiper-slide-active
        const activeSlide = qs(".swiper-slide-active", this.slider);
        const sliderWrapper = activeSlide.parentNode;
        const sliderWrapperClassName = sliderWrapper.className.split(" ")[0];
        const slides = qsAll(`.${sliderWrapperClassName} > *`, sliderWrapper);
        const isPrelastSlideActive = slides[slides.length - 2] === activeSlide
            || slides[slides.length - 1] === activeSlide;

        if (isPrelastSlideActive) this.loadNewArticles();
    }
    loadNewArticles() {
        if (this.isDoingAjaxQuery || this.noMorePosts) return;

        const slugWUrl = this.slugsWithUrls.find(
            (o) => o.slug === this.currentSlug
        );
        if (!slugWUrl.pagination) slugWUrl.pagination = 1;
        slugWUrl.pagination++;

        this.ajaxQuery(this.currentSlug, { concat: true });
    }
    onSetSlug(event = {}) {
        if (this.isDoingAjaxQuery) return;

        const detail = event && event.detail ? event.detail : null;
        if (!detail) return;

        const slug = detail.slug;
        this.setActive(slug);
    }
    setActive(slug) {
        this.lists.forEach((obj) => {
            obj.params.setActive(slug);
        });
        const slugWUrl = this.slugsWithUrls.find((o) => o.slug === slug);
        this.currentSlug = slug;
        this.noMorePosts = Boolean(slugWUrl.noMorePosts);

        this.ajaxQuery(slug);
    }
    ajaxQuery(slug, opts = { concat: false }) {
        return new Promise(async (resolve, reject) => {
            if (this.isDoingAjaxQuery || this.noMorePosts) resolve();

            this.isDoingAjaxQuery = true;
            this.loadingStateController.setLoadingState();
            const category = this.currentSlug;
            const slugWUrl = this.slugsWithUrls.find((o) => o.slug === slug);

            if (!slugWUrl.loadedPostsNumber) slugWUrl.loadedPostsNumber = 0;

            /* определить тип запроса:
                      "initial" - запрос по этой категории выполняется первый раз
                      "concat" - нужно получить новые посты из категории
                      "pastInitial" - запрос по этой категории уже выполнялся, нужно подгрузить те, что были загружены ранее
                  */
            let ajaxQueryType = "initial";
            if (opts.concat) ajaxQueryType = "concat";
            else if (slugWUrl.pastInitial) ajaxQueryType = "pastInitial";

            const bodyData = {
                category,
                ajaxQueryType,
                postsPerPage: this.postsPerPage,
            };
            switch (ajaxQueryType) {
                case "initial":
                    break;
                case "concat":
                    bodyData.loadedPostsNumber = slugWUrl.loadedPostsNumber;
                    bodyData.postsTotalNumber = slugWUrl.postsTotalNumber;
                    break;
                case "pastInitial":
                    bodyData.loadedPostsNumber = slugWUrl.loadedPostsNumber;
                    break;
            }
            if (ajaxQueryType === "concat" && slugWUrl.noMorePosts) {
                this.noMorePosts = true;
                reject();
            }
            let json = await ajaxQuery("load_posts_by_category", bodyData, "json");
            const data = json.data;

            // указать, что последующие запросы к этой категории будут уже не первыми
            if (ajaxQueryType === "initial") slugWUrl.pastInitial = true;

            // data.postsTotalNumber придет только при "initial" запросе
            if (data.postsTotalNumber)
                slugWUrl.postsTotalNumber = data.postsTotalNumber;
            if (data.noMorePosts) {
                slugWUrl.noMorePosts = true;
                this.noMorePosts = true;
            }

            if (ajaxQueryType === "initial" || ajaxQueryType === "pastInitial")
                this.rootElem.innerHTML = data.content;
            if (ajaxQueryType === "concat") this.rootElem.innerHTML += data.content;
            if (ajaxQueryType === "initial" || ajaxQueryType === "concat")
                slugWUrl.loadedPostsNumber += data.queryLoadedPostsNumber;

            setTimeout(() => (this.isDoingAjaxQuery = false), 0);
            resolve(data);
            this.loadingStateController.unsetLoadingState();
        });
    }
}

class AnimateElem {
    constructor(node) {
        this.rootElem = node;
        this.params = getParams(this, "animate");
        this.params.timeout = parseInt(this.params.timeout) || 500;
        this.params.timeoutSeconds = this.params.timeout / 1000;

        this.animate();
    }
    animate() {
        const method = this.params.method || "popUp";
        this[method]().then(() => {
            setTimeout(() => {
                this.rootElem.style.removeProperty("transition");
                this.rootElem.style.removeProperty("transform");
            }, this.params.timeout);
        });
    }
    popUp() {
        return new Promise((resolve) => {
            this.rootElem.style.transform = "translate(0, 300px)";
            setTimeout(() => {
                this.rootElem.style.cssText = `
                    transition: all ${this.params.timeoutSeconds}s ease 0s;
                    transform: translate(0px, 0px);
                `;
                resolve();
            }, 100);
        });
    }
}

class LoadAvatar {
    constructor(node) {
        this.onChange = this.onChange.bind(this);

        this.rootElem = node;
        this.params = getParams(this);
        this.thumbnailBlocks = getThumbBlocks(this);
        this.rootElem.addEventListener("change", this.onChange);

        function getThumbBlocks(ctx) {
            let selectors = [
                ".user-avatar img",
                { withDelay: true, selector: "#wp-admin-bar-my-account img" },
            ];
            if (ctx.params.thumbnailBlocks)
                selectors = selectors.concat(ctx.params.thumbnailBlocks.split(", "));

            setTimeout(() => {
                selectors
                    .filter((item) => item.withDelay)
                    .forEach((obj) => {
                        const delayedImg = qs(obj.selector);
                        if (delayedImg) ctx.thumbnailBlocks.push(delayedImg);
                    });
            }, 100);

            return selectors
                .filter((item) => typeof item === "string")
                .map((selector) => qs(selector))
                .filter((img) => img && img.tagName.match(/img/i));
        }
    }
    onChange() {
        this.img = this.createThumbnail();
        if (!this.img) return;

        this.uploadFile();
    }
    createThumbnail() {
        const thumbs = createThumbnails(this.rootElem.files);
        return (Array.isArray(thumbs)) ? thumbs[0] : false;
    }
    async uploadFile() {
        setLoadingState(this.thumbnailBlocks);
        const res = await ajaxQuery(
            "load_avatar",
            { img: this.rootElem.files[0], userNonce: wpAjaxData.userNonce },
            "json"
        );
        if (res.success) {
            this.thumbnailBlocks.forEach((img) => {
                img.src = res.data.attachmentUrl;
                img.removeAttribute("srcset");
            });
        } else {
            popupsMethods.callPopup("error", res.data);
        }

        unsetLoadingState(this.thumbnailBlocks);
    }
}

class Article {
    constructor(node) {
        this.toggleFavorites = this.toggleFavorites.bind(this);

        this.rootElem = node;
        this.articleId = this.rootElem.getAttribute("id").replace("post_", "").trim();

        this.init();
    }
    init() {
        this.favoritesButton = qs("button.article-card__icon.icon-bookmark", this.rootElem);
        if (this.favoritesButton) this.favoritesIcon = this.favoritesButton;

        if (this.favoritesButton) {
            this.favoritesButton.addEventListener("click", this.toggleFavorites);
            this.setMarkIcon();
        }
    }
    async toggleFavorites() {
        const data = {
            userNonce: wpAjaxData.userNonce,
            articleId: this.articleId
        };
        this.rootElem.classList.add("article-card--favorite");
        const res = await ajaxQuery("article_to_favorites", data, "json");
        if (res.success) {
            if (res.data.action === "added") {
                this.rootElem.setAttribute("data-article-favorite", "");
                this.setMarkIcon();
            } else if (res.data.action === "removed") {
                this.rootElem.removeAttribute("data-article-favorite");
                this.setMarkIcon();
            }
        } else if (res.data) {
            if (res.data.error === "not_logged_in") {
                popupsMethods.callPopup(
                    "error",
                    {
                        destroyTimeout: 2500,
                        "error_text": "Авторизуйтесь, чтобы добавить статью в избранное",
                        isOnce: true
                    }
                );
            }
        }
    }
    setMarkIcon() {
        if (!this.favoritesIcon) return;

        if (this.rootElem.hasAttribute("data-article-favorite")) {
            this.favoritesIcon.classList.remove("icon-bookmark");
            this.favoritesIcon.classList.add("icon-bookmark-colored");
        } else {
            this.favoritesIcon.classList.remove("icon-bookmark-colored");
            this.favoritesIcon.classList.add("icon-bookmark");
        }
    }
}

class ArticlePage extends Article {
    constructor(node) {
        super(node);

        this.likeParams = this.initLike();
    }
    init() {
        this.favoritesButton = qs("button.article-page__button", this.rootElem);
        if (this.favoritesButton) {
            this.favoritesIcon = qs("span[class*='icon']", this.favoritesButton);
            this.favoritesButtonText = qs(".article-page__button-text", this.favoritesButton);
        }

        if (this.favoritesButton) {
            this.favoritesButton.addEventListener("click", this.toggleFavorites);
            this.setMarkIcon();
        }
    }
    setMarkIcon() {
        super.setMarkIcon();

        if (this.rootElem.hasAttribute("data-article-favorite")) {
            this.favoritesButtonText.textContent = "Сохранено";
        } else {
            this.favoritesButtonText.textContent = "Сохранить";
        }
    }
    initLike() {
        const button = qs(".comments__button-like", this.rootElem);
        if (!button) return null;

        const data = bindMethods(this, {
            button,
            amountNode: qs(".comments__button-content--small", button),
            amount: 0,

            init() {
                data.button.addEventListener("click", data.toggleLike);
                data.amount = parseInt(data.amountNode.textContent.trim().replace(/\D/g, ""));
            },
            async toggleLike() {
                if (!wpAjaxData.userNonce) {
                    popupsMethods.callPopup("error",
                        {
                            "error_text": "Авторизуйтесь, чтобы поставить отметку \"Нравится\"",
                            destroyTimeout: 3000,
                            isOnce: true
                        }
                    );
                    return;
                }

                const postId = getPostId(this.rootElem);
                const postData = { postId, userNonce: wpAjaxData.userNonce };
                const res = await ajaxQuery("toggle_article_like", postData, "json");

                if (!res.success) return;

                if (res.data.has_like) {
                    data.amount++;
                    data.button.classList.add("__active");
                } else {
                    data.amount--;
                    data.button.classList.remove("__active");
                }
                data.amountNode.textContent = data.amount;
            }
        });
        data.init();

        return data;
    }
}

class Product {
    constructor(node) {
        this.toggleFavorites = this.toggleFavorites.bind(this);
        this.onToCartClick = this.onToCartClick.bind(this);
        this.toggleToCart = this.toggleToCart.bind(this);

        this.rootElem = node;
        this.productId = this.rootElem.getAttribute("id").replace(/\product_/, "");
        this.loadingStateController = new LoadingState(this.rootElem);

        this.init();
    }
    init() {
        this.isProductCard = true;
        this.toFavoritesButton = qs(".product-to-favorites", this.rootElem);
        this.toCartButton = qs(".product-card__button--cart", this.rootElem);
        this.toFavoritesButton.addEventListener("click", this.toggleFavorites);
        this.toCartButton.addEventListener("click", this.onToCartClick);
    }
    async toggleFavorites() {
        const data = {
            userNonce: wpAjaxData.userNonce,
            productId: this.productId
        };
        this.loadingStateController.setLoadingState();
        const res = await ajaxQuery("product_to_favorites", data, "json");
        if (res.success) {
            if (res.data.action === "added") {
                this.rootElem.classList.add("product--favorite");
            } else if (res.data.action === "removed") {
                this.rootElem.classList.remove("product--favorite");
            }
        } else if (res.data) {
            if (res.data.error === "not_logged_in") {
                popupsMethods.callPopup(
                    "error",
                    {
                        destroyTimeout: 2500,
                        "error_text": "Авторизуйтесь, чтобы добавить товар в избранное",
                        isOnce: true
                    }
                );
            }
        }
        this.loadingStateController.unsetLoadingState();

        if (this.toFavoritesButton) {
            const textSpan = qs(".product-page__like-button-text", this.toFavoritesButton);
            if (textSpan) {
                if (res.data) {
                    if (res.data.action === "added")
                        textSpan.textContent = "В избранном";
                    if (res.data.action === "removed")
                        textSpan.textContent = "В избранное";
                }
            }
        }
    }
    // если в карточке, нужно при нажатии проверить, авторизован ли пользователь, затем вывести модальное окно с выбором количества товара или просто убрать товар из корзины
    async onToCartClick() {
        if (this.onToCartClicked) return;

        this.onToCartClicked = true;
        this.loadingStateController.setLoadingState();
        if (isLoggedIn) {
            const resInCart = await ajaxQuery("is_in_cart", { productId: this.productId }, "json");
            if (resInCart.success) {
                this.amount = 1;
                await this.toggleToCart();
                this.amount = 0;
                this.onToCartClicked = false;
                return;
            }

            const modalParams = modalsMethods.createNewModal({
                modalName: "choose-amount",
                refresh: true,
                modalInitParams: {
                    title: "Выберите количество товара",
                    applyButton: {
                        title: "Добавить в корзину",
                        callback: onApply.bind(this)
                    },
                }
            });

            function onApply() {
                this.amount = modalParams.amount;
                this.toggleToCart();
            }
        } else {
            popupsMethods.callPopup("error",
                {
                    "error_text": "Авторизуйтесь, чтобы добавить товар в корзину",
                    destroyTimeout: 3000,
                    isOnce: true
                }
            );
        }
        this.loadingStateController.unsetLoadingState();

        this.onToCartClicked = false;
    }
    // на странице товара при нажатии кнопки "В корзину"/"Убрать из корзины" вызовется этот метод
    async toggleToCart() {
        if (!this.amount) return;
        if (this.amount < 1) return;

        const data = {
            userNonce: wpAjaxData.userNonce,
            quantity: this.amount,
            productId: this.productId
        };
        this.loadingStateController.setLoadingState();
        const res = await ajaxQuery("product_to_cart", data, "json");
        if (res.success) {
            if (res.data) {
                if (res.data.action === "added") {
                    if (this.isProductCard)
                        this.toCartButton.classList.add("__active");
                }
                if (res.data.action === "removed") {
                    if (this.isProductCard)
                        this.toCartButton.classList.remove("__active");
                }
            }
        } else if (res.data) {
            if (res.data.error === "more_than_in_stock") {
                popupsMethods.callPopup("error", {
                    destroyTimeout: 10000,
                    isOnce: true,
                    "error_text": `К сожалению, вы выбрали больше товаров, чем есть в наличии. Доступно: ${res.data.quantity} шт.`
                });
            }
        }
        this.loadingStateController.unsetLoadingState();
        setCartNotify();

        return res;
    }
}

class ProductPage extends Product {
    constructor(node) {
        super(node);
        this.onUserRatingChange = this.onUserRatingChange.bind(this);
        this.removeRating = this.removeRating.bind(this);

        this.amount = 0;
        this.amountParams = this.createAmountParams();
        this.userRatingParams = initInput(qs(".star-rating--user", this.rootElem), StarRating);
        this.currentUserRating = this.userRatingParams.currentStarIndex || 0;
        this.initRemoveRatingButton(true);

        this.userRatingParams.onRatingChange(this.onUserRatingChange);
    }
    init() {
        this.toFavoritesButton = qs(".product-page__like-button", this.rootElem);
        this.toFavoritesButton.addEventListener("click", this.toggleFavorites);
        this.toCartButton = qs(".product-page__to-cart", this.rootElem);
        this.toCartButton.addEventListener("click", this.toggleToCart);
        this.toCartButtonText = qs(".product-page__to-cart-text", this.toCartButton);
    }
    createAmountParams() {
        const container = qs(".product-body__pricing-amount .amount-change", this.rootElem)
        let inpParams = findInittedInputByEl(container);
        if (!inpParams) inpParams = initInput(container, AmountChange);

        const data = bindMethods(this, {
            inpParams,

            init() {
                inpParams.input.addEventListener("change", data.onChange);
                inpParams.input.addEventListener("input", data.onChange);
                setTimeout(() => data.onChange(), 0);
            },
            onChange() {
                this.amount = parseInt(inpParams.input.value.replace(/\D/g, ""));
            }
        });
        data.init();

        return data;
    }
    onToCartClick() {
        this.toggleToCart();
    }
    async toggleToCart() {
        const res = await super.toggleToCart();

        if (res.success) {
            if (res.data.action === "added") {
                this.toCartButtonText.textContent = "Убрать";
                this.toCartButton.insertAdjacentHTML("beforebegin", `
                <div class="product-body__in-cart">
                    Товар уже в корзине: ${res.data.quantity} шт.
                </div>
                `);
            }
            if (res.data.action === "removed") {
                this.toCartButtonText.textContent = "В корзину";
                const quantityText = qs(".product-body__in-cart", this.toCartButton.parentNode);
                if (quantityText) quantityText.remove();
            }
        }
    }
    onUserRatingChange(event) {
        if (this.onUserRatingChangeAction) return;

        this.onUserRatingChangeAction = true;
        const detail = event && event.detail ? event.detail : {};
        const ratingValue = detail.ratingValue || 0;
        const self = this;

        if (isLoggedIn) {
            modalsMethods.createNewModal({
                modalName: "confirm",
                modalInitParams: {
                    title: `Вы уверены, что хотите поставить оценку "${ratingValue}" этому товару?`,
                    applyButton: { title: "Поставить оценку", callback: apply },
                    declineButton: { title: "Отмена", callback: decline },
                    onClose(isApply) {
                        if (!isApply)
                            decline();
                        setTimeout(() => self.onUserRatingChangeAction = false, 100);
                    }
                }
            });

            async function apply() {
                self.currentUserRating = ratingValue;
                setLoadingState(self.rootElem);
                await ajaxQuery("update_product_rating", {
                    productId: self.productId,
                    userId: wpAjaxData.userId,
                    ratingValue
                }, "json");
                unsetLoadingState(self.rootElem);
                self.initRemoveRatingButton();
            }
            function decline() {
                self.userRatingParams.setValue(self.currentUserRating);
            }
        } else {
            popupsMethods.callPopup("error", {
                destroyTimeout: 3000,
                isOnce: true,
                "error_text": "Авторизуйтесь, чтобы поставить оценку"
            });
        }
    }
    initRemoveRatingButton(onInit = false) {
        if (this.removeRatingButton) return;

        this.removeRatingButton = qs(".product-page__remove-review", this.rootElem);
        if (!this.removeRatingButton && onInit) return;

        if (!this.removeRatingButton) {
            this.removeRatingButton = createElement("button", "button product-page__remove-review", "Убрать оценку", { type: "button" });
            this.userRatingParams.rootElem.after(this.removeRatingButton);
        }

        const self = this;
        this.removeRatingButton.addEventListener("click", callback);

        function callback() {
            modalsMethods.createNewModal({
                modalName: "confirm",
                modalInitParams: {
                    title: `Вы уверены, что хотите убрать свою оценку, выставленную  этому товару?`,
                    applyButton: { title: "Убрать оценку", callback: self.removeRating },
                }
            });
        }
    }
    async removeRating() {
        if (!isLoggedIn) return;
        this.onUserRatingChangeAction = true;

        setLoadingState(this.rootElem);
        const res = await ajaxQuery("remove_user_product_rating", {
            productId: this.productId,
        }, "json");


        if (res.success) {
            this.userRatingParams.setValue(-1);

            if (this.removeRatingButton)
                this.removeRatingButton.remove();
        } else {
            popupsMethods.callPopup("error", {
                destroyTimeout: 3000,
                "error_text": "К сожалению, произошла ошибка"
            });
        }

        unsetLoadingState(this.rootElem);
        setTimeout(() => this.onUserRatingChangeAction = false, 100);
    }
}
// ================================= ПОПАПЫ - начало ================================= //
/* для создания нового попапа: popupsMethods.callPopup("popupName", { 
    destroyTimeout: num, 
    isOnce: false|true 
});,
где popupName нужно определить в Popups.createCallMethods и все params пойдут в этот метод */
class Popups {
    constructor(node) {
        this.rootElem = node;
        this.popups = [];
        this.popupsContainer = createElement("div", "popups-container");
        this.callMethods = this.createCallMethods();
    }
    createNewPopup(params = {}) {
        /* params:
                destroyTimeout: number || "infinite" (в мс),
                contentParams: все то, что пойдет в this.renderBody
            */
        if (!this.popupsContainer.closest("body"))
            document.body.append(this.popupsContainer);

        const popup = this.renderBody(params.contentParams);
        htmlElementMethods.insert(popup, this.popupsContainer, {
            transitionDur: 300,
        });
        const destroyTimeout = parseInt(params.destroyTimeout);
        if (destroyTimeout) {
            setTimeout(() => this.removePopup(popup), destroyTimeout);
        }
        this.popups.push({ popup, params });
    }
    createCallMethods() {
        return bindMethods(this, {
            cartAdded(params = {}) {
                const contentParams = {
                    bodyContent:
                        `<p>Товар был добавлен в корзину. Товаров в Вашей корзине: ${params.amount}</p>`,
                    applyButton: {
                        title: "Перейти в корзину",
                        callback: applyCallback,
                    },
                    cancelButton: {
                        title: "Вернуться к просмотру товаров",
                        className: "button--gray-pink",
                    },
                };
                popupsMethods.createNewPopup({
                    destroyTimeout: 5000,
                    contentParams,
                });

                function applyCallback() {
                    const link = createElement("a", "none");
                    link.setAttribute("href", "/flowers-club/cart/");
                    link.click();
                }
            },
            error(params = {}) {
                const destroyTimeout = parseInt(params.destroyTimeout) || 10000;

                const contentParams = {
                    bodyContent: `<p>${params["error_text"] || "Произошла ошибка"}</p>`,
                    cancelButton: {
                        title: "Закрыть",
                        className: "button--gray-pink",
                    },
                };
                popupsMethods.createNewPopup({
                    destroyTimeout,
                    contentParams,
                    popupName: params.popupName,
                });
            },
            success(params = {}) {
                const destroyTimeout = parseInt(params.destroyTimeout) || 10000;

                const contentParams = {
                    bodyContent: `<p>${params.message}</p>`,
                    cancelButton: {
                        title: "Закрыть",
                        className: "button--gray-pink",
                    },
                };
                popupsMethods.createNewPopup({
                    destroyTimeout,
                    contentParams,
                    popupName: params.popupName,
                });
            },
        });
    }
    renderBody(contentParams = {}) {
        /* contentParams:
                applyButton: { 
                    callback: function(){}, title: HTMLString, className: string,rewriteClassName: boolean
                },
                cancelButton: { 
                    callback: function(){}, title: HTMLString, className: string, rewriteClassName: boolean
                }
                body: HTMLString (полная замена того, что будет в переменной bodyInner),
                bodyContent: HTMLString (заменяет только часть того, что будет в переменной bodyInner. Не сработает, если в этом же объекте передано body)
            */
        setDefaultContentParams.call(this);

        const applyBtn = contentParams.applyButton;
        const cancelBtn = contentParams.cancelButton;

        let applyBtnLayout = '';
        if (applyBtn && applyBtn.href) {
            applyBtnLayout = `
            <a class="button popup__button--apply ${applyBtn.className || ""}" href="${applyBtn.href}">
                ${applyBtn.title}
            </a>`;
        } else if (applyBtn) {
            applyBtnLayout = `
            <button class="button popup__button--apply ${applyBtn.className || ""}" type="button">
                ${applyBtn.title}
            </button>`;
        }

        let cancelBtnLayout = cancelBtn
            ? `
                <button class="button popup__button--cancel ${cancelBtn.className || ""}" type="button">
                    ${cancelBtn.title}
                </button>`
            : "";

        const bodyInner = contentParams.body
            ? contentParams.body
            : ` 
                <div class="popup__close-container">
                    <button class="popup__close close" type="button" aria-label="Закрыть"></button>
                </div>
                <div class="popup__body">
                    <div class="popup__content">
                        ${contentParams.bodyContent}
                    </div>
                    <div class="popup__buttons">
                        ${applyBtnLayout}
                        ${cancelBtnLayout}
                    </div>
                </div>
        `;
        const body = createElement("div", "popup", bodyInner);

        if (applyBtn) {
            const btn = body.querySelector(".popup__button--apply");
            btn.addEventListener("click", () => {
                applyBtn.callback();
                this.removePopup(body);
            });
            if (applyBtn.rewriteClassName) btn.className = applyBtn.className;
        }
        if (cancelBtn) {
            const btn = body.querySelector(".popup__button--cancel");
            btn.addEventListener("click", () => {
                cancelBtn.callback();
                this.removePopup(body);
            });
            if (cancelBtn.rewriteClassName) btn.className = applyBtn.className;
        }
        const closeBtn = body.querySelector(".popup__close");
        if (closeBtn)
            closeBtn.addEventListener("click", () => this.removePopup(body));
        return body;

        function setDefaultContentParams() {
            if (!contentParams.title || typeof contentParams.title !== "string")
                contentParams.title = "Уведомление";

            if (contentParams.applyButton) {
                const ab = contentParams.applyButton;
                if (!ab.callback) ab.callback = function () { };
                if (!ab.title) ab.title = "Принять";
                if (!ab.className) ab.className = "button";
            }
            if (contentParams.cancelButton) {
                const cb = contentParams.cancelButton;
                if (!cb.callback) cb.callback = function () { };
                if (!cb.title) cb.title = "Отказаться";
                if (!cb.className) cb.className = "button button--gray-pink";
            }
            if (typeof contentParams.bodyContent !== "string")
                contentParams.bodyContent = "";
        }
    }
    removePopup(popup) {
        htmlElementMethods.remove(popup, { transitionDur: 300 });
        const index = this.popups.findIndex((obj) => obj.popup === popup);
        this.popups.splice(index, 1);
    }
    callPopup(popupName, params = {}) {
        if (params.isOnce) {
            const alreadyExists = this.popups.find(
                (obj) => obj.params.popupName === popupName
            );
            if (alreadyExists) return;
        }
        if (typeof this.callMethods[popupName] !== "function") return;

        params.popupName = popupName;
        this.callMethods[popupName](params);
    }
}
// с помощью методов класса можно вызвать новые попапы, удалить созданные. Новый попап можно создать, передав параметры содержимого в него (текст, кнопки и др.)
const popupsMethods = new Popups();

// data-popup-call="name:popupName", где popupName используется в callPopup(popupName)
class PopupCall {
    constructor(node) {
        this.onClick = this.onClick.bind(this);

        this.rootElem = node;
        this.callingParams = getParams(this, "popupCall");

        this.rootElem.addEventListener("click", this.onClick);
    }
    onClick() {
        this.callPopup(this.callingParams.name);
    }
    callPopup(popupName, params = {}) {
        const cm = popupsMethods.callMethods;
        if (typeof cm[popupName] === "function") cm[popupName](params);
    }
}
// ================================= ПОПАПЫ - конец ================================= //

// ================================ МОДАЛЬНЫЕ ОКНА - начало ========================= //
class Modals {
    constructor(node) {
        this.onResize = this.onResize.bind(this);

        this.rootElem = node;
        this.modalsContainer = createElement("div", "modals-container");
        this.calledModals = [];
        this.modalsInContainer = [];

        window.addEventListener("resize", this.onResize);
        this.onResize();
    }
    onResize() {
        setModalContainerHeight.call(this);

        function setModalContainerHeight() {
            const heights = this.modalsInContainer
                .map((modalParams) => modalParams.modal.offsetHeight)
                .sort((height1, height2) => {
                    if (height1 > height2) return -1;
                    if (height1 < height2) return 1;
                    return 0;
                });
            const biggestHeight = heights[0];
            const windowHeight =
                document.documentElement.clientHeight || window.innerHeight;

            // если высота контента меньше высоты окна
            if (biggestHeight + 40 < windowHeight) {
                this.modalsContainer.classList.remove("__scrollable");
            }
            // если высота окна больше высоты контента
            else {
                this.modalsContainer.classList.add("__scrollable");
            }
        }
    }
    createNewModal(
        params = {
            removeOtherModals: false,
            modalName: "",
            refresh: false,
            modalInitParams: {},
        }
    ) {
        /* params:
                removeOtherModals: false|true - удалить ли остальные окна в this.modalsContainer
                modalName: string - название модального окна, по которому будет вызван соответствующий наследник класса Modal
                refresh: false|true - если было уже вызвано окно с этим же modalName, оно будет храниться в this.calledModals, что позволит не реинициализировать его в дальнейшем. В случае, если refresh === true, оно будет удалено оттуда и его придется реиницализировать
            */
        if (!this.modalsContainer.closest("body")) {
            htmlElementMethods.insert(this.modalsContainer, document.body, {
                transitionDur: 200,
            });
            document.body.classList.add("__locked-scroll");
        }

        const modalParams = this.renderModal(params);
        this.calledModals.push(modalParams);
        this.modalsInContainer.push(modalParams);

        htmlElementMethods
            .insert(modalParams.modal, this.modalsContainer, { transitionDur: 500 })
            .then(this.onResize);

        return modalParams;
    }
    renderModal(params = {}) {
        const modalName = params.modalName;
        const refresh = params.refresh;
        // если alwaysRefresh.incldues(modalName), то будет принудительно обновлен, даже если не выставлен refresh
        const alwaysRefresh = ["confirm", "choose-amount"];
        getModalParams = getModalParams.bind(this);

        let modalParams;

        switch (modalName) {
            case "auth":
                modalParams = getModalParams(ModalAuth);
                break;
            case "confirm":
                modalParams = getModalParams(ModalConfirm);
                break;
            case "choose-amount":
                modalParams = getModalParams(ModalChooseAmount);
                break;
        }

        return modalParams;

        function getModalParams(classInstance) {
            const existingParams = this.calledModals.find(
                (inpP) => inpP instanceof classInstance
            );
            if (existingParams) {
                if (refresh || alwaysRefresh.includes(modalName)) {
                    const modalParams = new classInstance(params.modalInitParams);
                    setTimeout(() => this.removeModal(existingParams), 1000);
                    modalParams.modal.addEventListener("close", () =>
                        this.removeModalFromPage(modalParams)
                    );
                    return modalParams;
                } else {
                    const iframe = qs("iframe", existingParams.modal);
                    if (iframe) iframe.src = params.modalInitParams.iframeSrc;
                    return existingParams;
                }
            }

            const modalParams = new classInstance(params.modalInitParams);
            modalParams.modal.addEventListener("close", () =>
                this.removeModalFromPage(modalParams)
            );
            return modalParams;
        }
    }
    removeModalFromPage(modalParams) {
        if (!modalParams.modal) return;

        htmlElementMethods.remove(modalParams.modal, { transitionDur: 300 });
        const index = this.modalsInContainer.findIndex(
            (inpP) => inpP.modal === modalParams.modal
        );
        if (index >= 0) this.modalsInContainer.splice(index, 1);

        if (this.modalsInContainer.length < 1) {
            htmlElementMethods.remove(this.modalsContainer, { transitionDur: 200 });
            document.body.classList.remove("__locked-scroll");
        }
    }
    removeModal(modalParams) {
        if (!modalParams.modal) return;

        this.removeModalFromPage(modalParams);
        const index = this.calledModals.findIndex(
            (inpP) => inpP.modal === modalParams.modal
        );
        if (index >= 0) this.calledModals.splice(index, 1);
    }
    // !ПОСЛЕ вызова этого метода обязательно нужно закрыть тегом "</div>". Метод отрендерит крестик и заголовок, если он передан в title
    getGeneralLayout(title = null) {
        return `
            <div class="modal__close-container">
                <button class="modal__close-button" type="button" aria-label="Закрыть">
                    <span class="modal__close-cross close"></span>
                </button>
            </div>
            <div class="modal__content">
                ${title ? `<h4 class="modal__content-title">${title || ""}</h4>`
                : ""}
        `;
    }
}
/* с помощью методов класса на страницу добавляются новые модальные окна. Создать новое окно: modalsMethods.createNewModal({ modalName: "", 
    refresh: false|true, ОБЯЗАТЕЛЬНО УКАЗАТЬ TRUE, ЕСЛИ НУЖНО, ЧТОБЫ КОНТЕНТ ОБНОВЛЯЛСЯ В СЛЕДУЮЩИЙ РАЗ
    modalInitParams: { 
        title: "", 
        applyButton: { title: "", callback: function(){} },
        declineButton: { title: "", callback: function(){} },
        onClose(isApply){} - выполнится, когда окно будет закрыто. Если окно закрыто через кнопку "Принять", isApply будет выставлено в true
    } 
})
также под "modalName" создать соответствующий вариант в Modals.renderModal().
*/
const modalsMethods = new Modals();

class ModalCall {
    constructor(node) {
        this.onClick = this.onClick.bind(this);

        this.rootElem = node;
        this.callingParams = getParams(this, "modalCall");

        this.rootElem.addEventListener("click", this.onClick);
    }
    onClick() {
        const modalName = this.callingParams.name;
        this.callModal(modalName);
    }
    callModal(modalName) {
        const removeOtherModals =
            this.callingParams.removeOtherModals === "true" ? true : false;
        const refresh = this.callingParams.refresh === "true" ? true : false;
        const modalInitParams = this.callingParams;

        modalsMethods.createNewModal({
            modalName,
            refresh,
            removeOtherModals,
            modalInitParams,
        });
    }
}

class Modal {
    constructor(params = {}) {
        this.onCrossClick = this.onCrossClick.bind(this);
        this.setIframeHandlers = this.setIframeHandlers.bind(this);
        this.onKeyup = this.onKeyup.bind(this);

        this.params = params;
        this.modal = this.renderModal();
        this.closeBtn = this.modal.querySelector(".modal__close-button");
        this.iframe = this.modal.querySelector(".modal__iframe");
        if (this.iframe) this.iframe.onload = this.setIframeHandlers;

        this.closeBtn.addEventListener("click", this.onCrossClick);
        document.addEventListener("keyup", this.onKeyup);
    }
    onCrossClick() {
        this.modal.dispatchEvent(new CustomEvent("close"));
        if (typeof this.params.onClose === "function") {
            this.params.onClose(this.isApply || false);
        }
    }
    onKeyup(event) {
        if (event.key.match(/escape/i)) {
            this.onCrossClick(new CustomEvent("close"));
        }
    }
    setIframeHandlers() {
        setHeight = setHeight.bind(this);
        callHandlers = callHandlers.bind(this);

        callHandlers();
        this.iframe.contentWindow.addEventListener("resize", callHandlers);
        const observer = new MutationObserver(callHandlers);
        observer.observe(this.iframe.contentDocument.querySelector("body"), {
            childList: true,
            subtree: true,
            attributes: true,
        });

        function callHandlers() {
            setHeight();
        }
        function setHeight() {
            if (window.matchMedia("(min-width: 980px)").matches) {
                this.iframe.style.removeProperty("heigh");
                return;
            }

            const bodyChildren =
                this.iframe.contentDocument.body.querySelectorAll("body > *");
            let iframeHeight = 0;
            bodyChildren.forEach((child) => {
                const h = child.offsetHeight || 0;
                iframeHeight += h;
            });
            this.iframe.style.height = `${iframeHeight}px`;
        }
    }
}
class ModalAuth extends Modal {
    constructor(params = {}) {
        super(params);

        this.id = Math.random();
    }
    renderModal() {
        let iframeSrc = this.params.iframeSrc || "";
        if (iframeSrc.match(/undefined/i) || !iframeSrc)
            iframeSrc = "/flowers-club/auth/signup/index.html";

        const modalInner = `
        <div class="auth-modal__close-container modal__close-container">
            <button class="auth-modal__close-button modal__close-button" type="button" aria-label="Закрыть">
                <span class="auth-modal__close-cross modal__close-cross close"></span>
                <span class="auth-modal__close-text modal__close-text">Регистрация</span>
            </button>
        </div>
        <div class="auth-modal__content modal__content">
            <div class="auth-modal__socials">
                <div class="auth-modal__socials-title">
                    Вход через соцсети
                </div>
                <ul class="auth-modal__socials-list">
                    <li class="auth-modal__socials-item">
                        <a href="#">
                            <svg>
                                <use xlink:href="#facebook"></use>
                            </svg>
                        </a>
                    </li>
                    <li class="auth-modal__socials-item">
                        <a href="#">
                            <svg>
                                <use xlink:href="#odnoklassniki"></use>
                            </svg>
                        </a>
                    </li>
                    <li class="auth-modal__socials-item">
                        <a href="#">
                            <svg>
                                <use xlink:href="#vkontakte"></use>
                            </svg>
                        </a>
                    </li>
                </ul>
            </div>
            <iframe class="auth-modal__iframe modal__iframe"
                src="${iframeSrc}" frameborder="0"></iframe>
        </div>

        <svg display="none">
            <symbol id="facebook" viewBox="0 0 50 50" fill="none">
                <rect width="50" height="50" rx="25" fill="#4267B2" />
                <path
                    d="M26.6696 41.6672V26.4622H31.7733L32.5374 20.5366H26.6696V16.7533C26.6696 15.0377 27.146 13.8685 29.6064 13.8685L32.7442 13.867V8.56722C32.2013 8.49527 30.3388 8.33398 28.1719 8.33398C23.6478 8.33398 20.5505 11.0953 20.5505 16.1667V20.5368H15.4336V26.4624H20.5503V41.6673L26.6696 41.6672Z"
                    fill="white" />
            </symbol>
        </svg>
        <svg display="none">
            <symbol id="odnoklassniki" viewBox="0 0 50 50" fill="none">
                <rect width="50" height="50" rx="25" fill="#EE8208" />
                <path
                    d="M25.0009 13.3758C26.9651 13.3758 28.5628 14.9735 28.5628 16.9377C28.5628 18.9003 26.9647 20.498 25.0009 20.498C23.038 20.498 21.4398 18.9003 21.4398 16.9377C21.4394 14.9731 23.0384 13.3758 25.0009 13.3758ZM25.0009 25.5373C29.7455 25.5373 33.6038 21.6802 33.6038 16.9377C33.6038 12.1928 29.7459 8.33398 25.0009 8.33398C20.2568 8.33398 16.398 12.1932 16.398 16.9377C16.398 21.6802 20.2568 25.5373 25.0009 25.5373ZM28.4813 32.5545C30.251 32.1514 31.9399 31.4521 33.4766 30.4861C34.0423 30.1302 34.4435 29.5641 34.5918 28.9124C34.7401 28.2607 34.6235 27.5768 34.2676 27.0111C34.0916 26.7307 33.862 26.4878 33.592 26.2962C33.3221 26.1046 33.0169 25.9681 32.6942 25.8945C32.3714 25.8209 32.0372 25.8117 31.7109 25.8673C31.3845 25.923 31.0724 26.0424 30.7922 26.2188C27.2678 28.4346 22.7316 28.433 19.2101 26.2188C18.93 26.0424 18.6178 25.9229 18.2915 25.8672C17.9651 25.8116 17.631 25.8208 17.3083 25.8944C16.9855 25.968 16.6804 26.1045 16.4105 26.2961C16.1405 26.4877 15.911 26.7307 15.735 27.0111C15.379 27.5767 15.2622 28.2605 15.4103 28.9122C15.5584 29.5638 15.9593 30.13 16.5248 30.4861C18.0614 31.4518 19.7499 32.1511 21.5193 32.5545L16.7101 37.3645C16.2375 37.8373 15.9721 38.4784 15.9722 39.1469C15.9723 39.8154 16.238 40.4565 16.7108 40.9291C17.1835 41.4017 17.8247 41.6671 18.4932 41.667C19.1617 41.6669 19.8027 41.4012 20.2753 40.9284L25.0001 36.2029L29.7278 40.9289C29.9615 41.163 30.2391 41.3487 30.5447 41.4754C30.8503 41.6021 31.1779 41.6673 31.5087 41.6673C31.8395 41.6673 32.1671 41.6021 32.4727 41.4754C32.7783 41.3487 33.0559 41.163 33.2896 40.9289C33.5241 40.6951 33.7101 40.4174 33.837 40.1117C33.9639 39.8059 34.0293 39.4781 34.0293 39.1471C34.0293 38.816 33.9639 38.4882 33.837 38.1825C33.7101 37.8767 33.5241 37.599 33.2896 37.3653L28.4813 32.5545Z"
                    fill="white" />
            </symbol>
        </svg>
        <svg display="none">
            <symbol id="vkontakte" viewBox="0 0 50 50" fill="none">
                <rect width="50" height="50" rx="25" fill="#5181B8" />
                <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M40.9006 17.2232C41.1324 16.4507 40.9006 15.8828 39.7977 15.8828H36.151C35.2237 15.8828 34.7965 16.3733 34.5647 16.9143C34.5647 16.9143 32.7101 21.4344 30.0829 24.3705C29.233 25.2204 28.8467 25.4905 28.3831 25.4905C28.1512 25.4905 27.8157 25.2204 27.8157 24.4478V17.2232C27.8157 16.2959 27.5467 15.8828 26.7738 15.8828H21.0433C20.464 15.8828 20.1155 16.3131 20.1155 16.721C20.1155 17.6001 21.4288 17.8028 21.5643 20.2752V25.6455C21.5643 26.8229 21.3517 27.0365 20.8881 27.0365C19.6519 27.0365 16.6449 22.4958 14.8612 17.3006C14.5116 16.2907 14.161 15.8828 13.229 15.8828H9.58232C8.54041 15.8828 8.33203 16.3733 8.33203 16.9143C8.33203 17.8802 9.56852 22.6709 14.0886 29.0067C17.1023 33.3332 21.3476 35.6791 25.211 35.6791C27.5292 35.6791 27.8157 35.1581 27.8157 34.2608V30.9905C27.8157 29.9486 28.0353 29.7407 28.7691 29.7407C29.3104 29.7407 30.2374 30.0111 32.4012 32.0973C34.8736 34.5695 35.281 35.6791 36.672 35.6791H40.3187C41.3606 35.6791 41.8815 35.1581 41.5809 34.13C41.2522 33.1053 40.0717 31.619 38.5052 29.8566C37.6553 28.852 36.3802 27.7702 35.9942 27.2295C35.4532 26.534 35.6077 26.2251 35.9942 25.6072C35.9942 25.6072 40.4369 19.3485 40.9006 17.2235V17.2232Z"
                    fill="white" />
            </symbol>
        </svg>
        `;
        return createElement("div", "modal auth-modal", modalInner);
    }
}
class ModalConfirm extends Modal {
    constructor(params = {}) {
        super(params);
    }
    renderModal() {
        if (!this.params.applyButton) this.params.applyButton = {};
        if (!this.params.declineButton) this.params.declineButton = {};

        const modalInner = `
        ${modalsMethods.getGeneralLayout(this.params.title)}
            <div class="modal__content-buttons">
                <button class="button" data-modal-apply-button type="button">
                    ${this.params.applyButton.title || "Принять"}
                </button>
                <button class="button button--gray-pink" data-modal-decline-button type="button">
                    ${this.params.declineButton.title || "Отменить"}
                </button>
            </div>
        </div>
        `;

        const modal = createElement("div", "modal confirm-modal", modalInner);
        this.initButtons(modal);
        return modal;
    }
    initButtons(modal) {
        this.onDeclineClick = this.onDeclineClick.bind(this);
        this.onApplyClick = this.onApplyClick.bind(this);

        const applyButton = qs("[data-modal-apply-button]", modal);
        const declineButton = qs("[data-modal-decline-button]", modal);
        applyButton.removeAttribute("data-modal-apply-button");
        declineButton.removeAttribute("data-modal-decline-button");

        declineButton.addEventListener("click", this.onDeclineClick);
        if (this.params.applyButton.callback)
            applyButton.addEventListener("click", this.onApplyClick);
    }
    onApplyClick() {
        this.isApply = true;

        if (!this.params.applyButton.preventDefault) {
            this.onCrossClick();
        }

        if (typeof this.params.applyButton.callback === "function")
            this.params.applyButton.callback();

        this.isApply = false;
    }
    onDeclineClick() {
        this.onCrossClick();
        if (typeof this.params.declineButton.callback === "function")
            this.params.declineButton.callback();
    }
}
class ModalChooseAmount extends ModalConfirm {
    constructor(params = {}) {
        super(params);
    }
    renderModal() {
        if (!this.params.applyButton) this.params.applyButton = {};
        if (!this.params.declineButton) this.params.declineButton = {};

        const modalInner = `
        ${modalsMethods.getGeneralLayout(this.params.title)}
            <div class="modal__content-change-amount">
                <div class="amount-change" data-params="minValue:1; maxValue:99"></div>
            </div>
            <div class="modal__content-buttons">
                <button class="button" data-modal-apply-button type="button">
                    ${this.params.applyButton.title || "Принять"}
                </button>
                <button class="button button--gray-pink" data-modal-decline-button type="button">
                    ${this.params.declineButton.title || "Отменить"}
                </button>
            </div>
        </div>
        `;

        const modal = createElement("div", "modal", modalInner);
        this.amountParams = this.createAmountParams(modal);
        this.initButtons(modal);
        return modal;
    }
    createAmountParams(modal) {
        const inpParams = initInput(qs(".amount-change", modal), AmountChange);
        const data = bindMethods(this, {
            inpParams,
            amount: 0,

            init() {
                inpParams.input.addEventListener("change", data.onChange);
                inpParams.input.addEventListener("input", data.onChange);
                data.onChange();
            },
            onChange() {
                data.amount = parseInt(inpParams.input.value.replace(/\D/g, ""));
            }
        });
        data.init();

        return data;
    }
    get amount() {
        return parseInt(this.amountParams.amount) || 0;
    }
}
// ================================= МОДАЛЬНЫЕ ОКНА - конец ========================= //

let inittingSelectors = [
    { selector: ".search", classInstance: Search },
    { selector: ".spoiler", classInstance: Spoiler },
    { selector: ".header", classInstance: Header },
    { selector: "[data-dynamic-adaptive]", classInstance: DynamicAdaptive },
    { selector: ".toggle-slider", classInstance: ToggleSlider },
    { selector: ".nav-tile-container", classInstance: NavTile },
    { selector: ".tabs", classInstance: Tabs },
    { selector: ".star-rating", classInstance: StarRating },
    { selector: ".select", classInstance: Select },
    { selector: ".input-buttons-list", classInstance: InputButtonsList },
    { selector: ".amount-change", classInstance: AmountChange },
    { selector: "[data-popup-call]", classInstance: PopupCall },
    { selector: "[data-modal-call]", classInstance: ModalCall },
    { selector: "[data-loadable-feed]", classInstance: LoadableFeed },
    { selector: "[data-animate]", classInstance: AnimateElem, noInit: true },
    { selector: "input[name='avatar']", classInstance: LoadAvatar },
    { selector: "article[id*='post_']", classInstance: Article },
    { selector: "section[id*='post_']", classInstance: ArticlePage },
    { selector: ".product-card", classInstance: Product },
    { selector: ".product-page", classInstance: ProductPage },
];

let isInitting = false;
const inittingInputsBodyObserver = new MutationObserver(() => {
    if (isInitting) return;

    isInitting = true;
    setTimeout(() => {
        initInputs();
        setTimeout(() => {
            isInitting = false;
            document.dispatchEvent(new CustomEvent("initted-inputs"));
        }, 0);
    }, 0);
});
inittingInputsBodyObserver.observe(document.body, {
    childList: true,
    subtree: true,
});
setTimeout(() => initInputs(), 0);
