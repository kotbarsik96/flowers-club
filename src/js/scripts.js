// функции

// получить длину/ширину элемента или потомка элемента по selector
function getSizes(el, params) {
    // params = { selector: "", setOriginalWidth: false/true, setOriginalHeight: false/true }
    const clone = el.cloneNode(true);
    clone.style.cssText = "position: absolute; left: -100vw; top: -100vh; max-width: unset; max-height: unset;";
    document.body.append(clone);
    let width = 0;
    let height = 0;
    if (params.setOriginalWidth) clone.style.width = `${el.offsetWidth}px`;
    if (params.setOriginalHeight) clone.style.height = `${el.offsetHeight}px`;

    if (params.selector) {
        const child = clone.querySelector(params.selector);
        child.style.cssText = "max-width: unset; max-height: unset;";
        width = child.offsetWidth;
        height = child.offsetHeight;
    } else {
        width = clone.offsetWidth;
        height = clone.offsetHeight;
    }
    clone.remove();

    return { width, height };
}

function fromStringToObject(string = "", params =
    {
        objectToAssign: {},
        stringSeparator: "; ",
        propSeparator: ":"
    }
) {
    if (typeof string !== "string") return {};

    const properties = string.split(params.stringSeparator);
    const paramsObj = {};
    properties.forEach(prop => {
        const split = prop.split(params.propSeparator);
        const key = split[0];
        let value = split[1];
        if (!value) return;

        if (value[value.length - 1] === ";") {
            const w = value.split("");
            w[value.length - 1] = "";
            value = w.join("");
        }
        paramsObj[key] = value;
    });

    return Object.assign(params.objectToAssign, paramsObj);
}

function getTextContent(node) {
    return node.textContent
        ? node.textContent.trim()
        : node.innerText.trim();
}
function setTextContent(node, text) {
    text = text.trim();
    if (node.textContent) node.textContent = text;
    else node.innerText = text;
}

function getMaxHeight(node) {
    const clone = node.cloneNode(true);
    clone.style.removeProperty("max-height");
    const width = node.offsetWidth;
    clone.style.cssText = `position: absolute; top: 0; left: 0; transition: none; width: ${width}px;`;
    document.body.append(clone);
    const height = clone.offsetHeight;
    clone.remove();
    return height;
}

class HtmlElementCustoms {
    constructor() { }
    remove(element, params = {}) {
        /* params:
            transitionDur: 0 (в мс)
        */
        setDefaultParams();
        return new Promise(resolve => {
            element.style.cssText = `
            opacity: 0; 
            transition: all ${params.transitionDur / 1000}s ease;
        `;
            setTimeout(() => {
                element.remove();
                element.style.removeProperty("transition");
                resolve();
            }, params.transitionDur);
        });

        function setDefaultParams() {
            if (!parseInt(params.transitionDur)) params.transitionDur = 0;
            else params.transitionDur = parseInt(params.transitionDur);
        }
    }
    insert(element, parentNode, params = {}) {
        /* params:
            transitionDur: 0 (в мс)
            insertType: "prepend"|"append"
        */
        setDefaultParams();

        element.style.cssText = `
            opacity: 0; 
            transition: all ${params.transitionDur / 1000}s ease;
        `;
        parentNode[params.insertType](element);

        setTimeout(() => {
            element.style.opacity = "1";
        }, 0);
        setTimeout(() => {
            element.style.removeProperty("transition");
        }, params.transitionDur);

        function setDefaultParams() {
            if (!parseInt(params.transitionDur))
                params.transitionDur = 0;
            if (params.insertType !== "prepend" && params.insertType !== "append")
                params.insertType = "prepend";
        }
    }
}
const htmlElementMethods = new HtmlElementCustoms();

function findClosest(relative, selector) {
    let closest = relative.querySelector(selector);
    let parent = relative.parentNode;
    while (!closest && parent !== document) {
        closest = parent.querySelector(selector);
        parent = parent.parentNode;
    }
    return closest;
}

function getCoords(el) {
    const box = el.getBoundingClientRect();
    return {
        top: box.top + window.pageYOffset,
        left: box.left + window.pageXOffset,
        right: box.right + window.pageXOffset,
        bottom: box.bottom + window.pageYOffset
    }
}

function createElement(tagName, className, insertingHTML) {
    let element = document.createElement(tagName);
    if (className) element.className = className;
    if (insertingHTML) element.insertAdjacentHTML("afterbegin", insertingHTML);
    return element;
}

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
const inittedInputs = [];
function initInputs() {
    inittingSelectors.forEach(selectorData => {
        const selector = selectorData.selector;
        const classInstance = selectorData.classInstance;
        const notInittedNodes = Array.from(document.querySelectorAll(selector))
            .filter(node => {
                let isInitted = Boolean(
                    inittedInputs.find(inpClass => {
                        return inpClass.rootElem === node
                            && inpClass instanceof selectorData.classInstance
                    })
                );
                return isInitted ? false : true;
            });

        notInittedNodes.forEach(inittingNode => {
            inittedInputs.push(new classInstance(inittingNode));
        });
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
        this.searchIcon = this.rootElem.querySelector(".search-wrapper__icon");
        this.input = this.rootElem.querySelector(".search-wrapper__input");
        const disableToggleMedia = this.rootElem.dataset.disableToggle;

        this.searchIcon.addEventListener("click", this.toggle);
        if (disableToggleMedia) {
            this.disableToggleMedia = window.matchMedia(disableToggleMedia);
            this.disableToggleMedia.addEventListener("change", this.onMediaChange);
            this.rootElem.removeAttribute("data-disable-toggle");
            this.onMediaChange();
        }
        this.rootElem.classList.contains("__shown")
            ? this.show()
            : this.hide();
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
        this.rootElem.classList.contains("__shown")
            ? this.hide()
            : this.show();
    }
    hide() {
        this.rootElem.classList.remove("__shown");
        this.input.style.maxWidth = "0px";
    }
    show() {
        this.rootElem.classList.add("__shown");
        const width = getSizes(this.rootElem, {
            selector: ".search-wrapper__input"
        }).width || 50;
        this.input.style.maxWidth = `${width}px`;
    }
}

class Spoiler {
    constructor(node) {
        this.toggle = this.toggle.bind(this);

        this.rootElem = node;
        this.spoilerContent = this.rootElem.querySelector(".spoiler__content");
        this.spoilerButton = this.rootElem.querySelector(".spoiler__button");

        this.rootElem.classList.contains("__shown")
            ? this.show()
            : this.hide();
        this.spoilerButton.addEventListener("click", this.toggle);
    }
    toggle() {
        this.rootElem.classList.contains("__shown")
            ? this.hide()
            : this.show();
    }
    hide() {
        this.rootElem.classList.remove("__shown");
        this.spoilerContent.style.cssText = "max-height: 0px; padding: 0; marign: 0;";
    }
    show() {
        this.rootElem.classList.add("__shown");
        const height = getSizes(this.spoilerContent, {
            setOriginalWidth: true
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
        const isNotShownOrActive = !this.menuButton.classList.contains("__active")
            && !this.siteMenu.classList.contains("__shown");
        if (isNotShownOrActive) return;

        if (event.target !== this.rootElem
            && !event.target.closest(".site-menu")
            && !event.target.closest(".header__menu-button")
            && event.target !== this.menuButton
        ) this.hideMenu();
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
            isReplace: dataset[2] && dataset[2] != "false" ? true : false
        };
        if (this.params.isReplace)
            this.replaceNode = findClosest(this.rootElem, `${this.params.selector}`);
        else this.destinationNode = findClosest(this.rootElem, `${this.params.selector}`);

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
        this.params = fromStringToObject(this.rootElem.dataset.params);
        this.rootElem.removeAttribute("data-params");

        this.getSliderMedia();
    }
    getSliderMedia() {
        if (!this.params.sliderMedia) return;
        onMediaChange = onMediaChange.bind(this);
        enableSlider = enableSlider.bind(this);
        disableSlider = disableSlider.bind(this);

        const widthMedia = this.params.widthMedia === "min" || this.params.widthMedia === "max"
            ? this.params.widthMedia
            : "max";
        const mediaValue = this.params.sliderMedia;
        this.sliderMedia = window.matchMedia(`(${widthMedia}-width: ${mediaValue.replace(/\D/g, "")}px)`);

        this.sliderMedia.addEventListener("change", onMediaChange);
        onMediaChange();

        function onMediaChange() {
            if (this.sliderMedia.matches) enableSlider();
            else disableSlider();
        }
        function enableSlider() {
            this.sliderParams = new Swiper(this.rootElem, {
                wrapperClass: this.params.wrapperClass || "swiper-wrapper",
                slideClass: this.params.slideClass || "swiper-slide",
                slidesPerView: parseFloat(this.params.slidesPerView) || "auto",
                spaceBetween: parseFloat(this.params.spaceBetween) || 10
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
        this.mobileHiddenToggle = this.rootElem.querySelector(".nav-tile__item--mobile-toggle");

        if (this.mobileHiddenToggle)
            this.mobileHiddenToggle.addEventListener("click", this.toggleMobileHidden);
    }
    toggleMobileHidden(cancelToggle = false) {
        show = show.bind(this);
        hide = hide.bind(this);
        if (cancelToggle === true) return { show, hide };

        this.mobileHiddenToggle.classList.contains("__active")
            ? hide()
            : show();

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
        this.params = fromStringToObject(this.rootElem.dataset.params);
        this.buttonsListContainer = this.rootElem.querySelector(".tabs__buttons-list");
        this.contentContainer = this.rootElem.querySelector(".tabs__content");
        this.buttons = [];
        this.contentItems = [];
        this.line = createElement("div", "tabs__buttons-line");
        const dependenciesBlocks = Array.from(this.rootElem.querySelectorAll(".tabs__dependencies"));
        this.dependenciesBlocks = dependenciesBlocks.map(parentNode => {
            const dependencies = Array.from(parentNode.querySelectorAll(".tabs__dependency-item"));
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
        const newButtons = Array.from(this.buttonsListContainer.querySelectorAll(".tabs__button"))
            .filter(btn => !this.buttons.includes(btn));
        this.buttons = this.buttons.concat(newButtons);
        newButtons.forEach(btn => {
            btn.addEventListener("click", this.onBtnClick);
        });

        const newContentItems = Array.from(this.rootElem.querySelectorAll(".tabs__content-item"))
            .filter(i => !this.contentItems.includes(i));
        const newContentItemsClone = newContentItems.map(i => i);
        newContentItemsClone.forEach((itemNode, index) => {
            const replaceIndex = parseInt(itemNode.dataset.tabContentReplace);
            if (!replaceIndex && replaceIndex !== 0) return;

            if (this.contentItems[replaceIndex]) this.contentItems[replaceIndex] = itemNode;
            else this.contentItems.push(itemNode);
            newContentItems.splice(index, 1);
        });
        this.contentItems = this.contentItems.concat(newContentItems);
        newContentItemsClone.forEach(item => item.remove());
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

        const otherItems = this.contentItems.filter(ci => {
            return ci.closest("body") && ci !== item;
        });
        this.currentItemIndex = index;

        const button = this.buttons[index];
        const otherButtons = this.buttons.filter(b => b !== button);
        button.classList.add("__active");
        otherButtons.forEach(b => b.classList.remove("__active"));

        const transitionDur = this.params.transitionDur;
        const insertParams = { transitionDur, insertType: "prepend" };

        removeDependencies();

        if (otherItems.length < 1)
            insertItem();
        else otherItems.forEach((otherItem, i, arr) => {
            if (i === arr.length - 1) {
                htmlElementMethods.remove(otherItem, { transitionDur }).then(insertItem);
            } else htmlElementMethods.remove(otherItem, { transitionDur });
        });

        function insertItem() {
            htmlElementMethods.insert(item, this.contentContainer, insertParams);
            this.setLinePosition();
            this.dependenciesBlocks.forEach(obj => {
                const el = obj.dependencies[index];
                const parentNode = obj.parentNode;
                htmlElementMethods.insert(el, parentNode, insertParams);
            });
        }
        function removeDependencies() {
            this.dependenciesBlocks.forEach(obj => {
                obj.dependencies.forEach((node, i) => {
                    if (i === index) return;

                    htmlElementMethods.remove(node, { transitionDur });
                });
            });
        }
    }
    setLinePosition() {
        const activeButton = this.buttons.find(btn => btn.classList.contains("__active"));
        if (!activeButton) return;

        const width = activeButton.offsetWidth;
        const left = getCoords(activeButton).left - getCoords(this.buttonsListContainer).left;

        this.line.style.width = `${width}px`;
        this.line.style.left = `${left}px`;

        if (!this.isInRow) {
            const activeButtonBottom = activeButton.getBoundingClientRect().bottom;
            const buttonsListBottom = this.buttonsListContainer.getBoundingClientRect().bottom;
            const bottom = buttonsListBottom - activeButtonBottom;
            this.line.style.bottom = `${bottom}px`;
            this.buttons.forEach(btn => btn.style.paddingBottom = "10px");
        } else {
            this.line.style.removeProperty("bottom");
            this.buttons.forEach(btn => btn.style.removeProperty("padding-bottom"));
        }
    }
}

class StarRating {
    constructor(node) {
        this.rootElem = node;
        this.fullStars = {
            container: createElement("div", "star-rating__fullstars"),
            stars: []
        }
        this.emptyStars = {
            container: createElement("div", "star-rating__empty-stars"),
            stars: []
        }
        const params = this.rootElem.dataset.params || "";
        this.params = fromStringToObject(params);
        setDefaultParams.call(this);

        this.rootElem.append(this.fullStars.container);
        this.rootElem.append(this.emptyStars.container);
        this.createStars();
        this.rootElem.removeAttribute("data-params");

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
            const fullStar = createElement("span", "star-rating__star icon-star-colored");
            const emptyStar = createElement("span", "star-rating__star icon-star");

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
    setValue(starIndex) {
        this.currentStarIndex = parseInt(starIndex);
        this.setWidth(starIndex);
    }
    setWidth(starIndex) {
        const starNumber = starIndex + 1;
        const percent = starNumber / (this.params.starsAmount / 100);
        this.fullStars.container.style.width = `${percent}%`;
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
            const ariaSelectedObj = this.options.find(obj => obj.li.hasAttribute("aria-selected"))
                || this.options[0];
            this.setValue(ariaSelectedObj.value);
        }
        function addToggleListHandlers() {
            this.valueNode.addEventListener("click", () => this.toggleList());

            document.addEventListener("click", (event) => {
                const exception = event.target.classList.contains("select")
                    || event.target.closest(".select") === this.rootElem;
                if (exception) return;

                this.toggleList(true).hide();
            });
        }
    }
    getOptions() {
        if (!this.options) this.options = [];

        const newOptions = Array.from(this.rootElem.querySelectorAll(".select__option"))
            .filter(li => !this.options.find(obj => obj.li === li))
            .map(li => {
                const value = getTextContent(li);
                return { li, value }
            });
        newOptions.forEach(obj => obj.li.addEventListener("click", this.onOptionClick));

        this.options = this.options.concat(newOptions);
    }
    onOptionClick(event) {
        const li = event.target;
        const optionObj = this.options.find(obj => obj.li === li);
        this.setValue(optionObj.value);
    }
    setValue(value) {
        const existsInOptions = this.options.find(obj => obj.value === value);
        if (!existsInOptions) {
            const newOption = `<li class="select__option" role="option">${value.trim()}</li>`;
            this.rootElem.insertAdjacentHTML("beforeend", newOption);
            this.getOptions();
        }
        setTextContent(this.valueNode, value);
        this.options.forEach(obj => {
            if (obj.value === value) obj.li.classList.add("__active");
            else obj.li.classList.remove("__active");
        });
        this.toggleList(true).hide();
    }
    toggleList(boolean) {
        show = show.bind(this);
        hide = hide.bind(this);

        if (boolean) return { show, hide };

        this.rootElem.classList.contains("__shown")
            ? hide()
            : show();

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

class AmountChange {
    constructor(node) {
        this.onInputChange = this.onInputChange.bind(this);
        this.onInput = this.onInput.bind(this);
        this.doPlus = this.doPlus.bind(this);
        this.doMinus = this.doMinus.bind(this);

        this.rootElem = node;
        this.buttonPlus = this.rootElem.querySelector(".amount-change__button--plus");
        this.buttonMinus = this.rootElem.querySelector(".amount-change__button--minus");
        this.input = this.rootElem.querySelector(".amount-change__input");
        this.params = fromStringToObject(this.rootElem.dataset.params || "");

        setHandlers.call(this);
        setDefaultValues.call(this);

        this.input.value = this.params.defaultValue;
        this.input.dispatchEvent(new Event("change"));

        function setDefaultValues() {
            const defaultParams = {
                minValue: { value: 0, type: "number" },
                maxValue: { value: 99, type: "number" }
            };
            setDefaultParams.call(this, defaultParams)
            if (this.params.minValue < 0) this.params.minValue = 0;
            if (this.params.minValue > this.params.maxValue)
                this.params.minValue = this.params.maxValue;

            if (!this.params.defaultValue || typeof this.params.defaultValue !== "string")
                this.params.defaultValue = this.params.minValue;
        }
        function setHandlers() {
            this.input.addEventListener("change", this.onInputChange);
            this.input.addEventListener("input", this.onInput);
            this.buttonPlus.addEventListener("click", this.doPlus);
            this.buttonMinus.addEventListener("click", this.doMinus);
        }
    }
    onInputChange() {
        const value = this.input.value.trim();
        if (value.length > 1 && value.startsWith("0")) this.input.value = this.input.value.slice(1);
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
        const width = value.length > 0
            ? value.length / 1.5
            : .5;
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

// ================================= ПОПАПЫ - начало ================================= //
class Popups {
    constructor(node) {
        this.rootElem = node;
        this.popupsContainer = createElement("div", "popups-container");
    }
    createNewPopup(params = {}) {
        /* params:
            destroyTimeout: number || "infinite" (в мс),
            contentParams: все то, что пойдет в this.renderBody
        */
        if (!this.popupsContainer.closest("body")) document.body.append(this.popupsContainer);

        const popup = this.renderBody(params.contentParams);
        htmlElementMethods.insert(popup, this.popupsContainer, {
            transitionDur: 300,
        });
        const destroyTimeout = parseInt(params.destroyTimeout);
        if (destroyTimeout) {
            setTimeout(() => this.removePopup(popup), destroyTimeout);
        }
    }
    renderBody(contentParams = {}) {
        /* contentParams:
            title: HTMLString,
            applyButton: { 
                callback: function(){}, title: HTMLString, className: string,rewriteClassName: boolean
            },
            cancelButton: { 
                callback: function(){}, title: HTMLString, className: string, rewriteClassName: boolean
            }
            body: HTMLString (полная замена того, что будет в переменной body),
            bodyContent: HTMLString (заменяет только часть того, что будет в переменной body. Не сработает, если в этом же объекте передано body)
        */
        setDefaultContentParams.call(this);

        const applyBtn = contentParams.applyButton;
        const cancelBtn = contentParams.cancelButton;
        const bodyInner = contentParams.body
            ? contentParams.body
            : ` 
                <div class="popup__close-container">
                    <button class="popup__close menu-button __active" type="button"></button>
                </div>
                <div class="popup__body">
                    <div class="popup__content">
                        ${contentParams.bodyContent}
                    </div>
                    <div class="popup__buttons">
                        ${applyBtn
                ? `<button class="button popup__button--apply ${applyBtn.className}" type="button">
                                    ${applyBtn.title}
                                </button>`
                : ""
            }
                        ${cancelBtn
                ? `<button class="button popup__button--cancel ${cancelBtn.className}" type="button">${cancelBtn.title}</button>`
                : ""
            }
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
        if (closeBtn) closeBtn.addEventListener("click", () => this.removePopup(body));
        return body;

        function setDefaultContentParams() {
            if (!contentParams.title || typeof contentParams.title !== "string")
                contentParams.title = "Уведомление";
            if (!contentParams.applyButton) contentParams.applyButton = {};
            if (!contentParams.cancelButton) contentParams.cancelButton = {};

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
            if (typeof contentParams.bodyContent !== "string") contentParams.bodyContent = "";
        }
    }
    removePopup(popup) {
        htmlElementMethods.remove(popup, { transitionDur: 300 });
    }
}
// с помощью методов класса можно вызвать новые попапы, удалить созданные
const popupsMethods = new Popups();

// data-popup-call="name:popupName", где popupName используется в callPopup(popupName)
class PopupCall {
    constructor(node) {
        this.onClick = this.onClick.bind(this);

        this.rootElem = node;
        this.callingParams = fromStringToObject(this.rootElem.dataset.popupCall);

        this.rootElem.addEventListener("click", this.onClick);
        this.callMethods = this.createCallMethods();
    }
    onClick() {
        this.callPopup(this.callingParams.name);
    }
    createCallMethods() {
        const methods = {
            cartAddedCall() {
                const contentParams = {
                    bodyContent: "<p>Товар был добавлен в корзину. Товаров в Вашей корзине: 1</p>",
                    applyButton: {
                        title: "Перейти в корзину",
                        callback: applyCallback
                    },
                    cancelButton: {
                        title: "Вернуться к просмотру товаров",
                        className: "button--gray-pink"
                    }
                }
                popupsMethods.createNewPopup({
                    destroyTimeout: 5000,
                    contentParams
                });

                function applyCallback() {
                    const link = createElement("a", "none");
                    link.setAttribute("href", "/flowers-club/cart/");
                    link.click();
                }
            }
        }
        for (let key in methods) methods[key] = methods[key].bind(this);

        return methods;
    }
    callPopup(popupName) {
        if (popupName === "cart-added") this.callMethods.cartAddedCall();
    }
}
// ================================= ПОПАПЫ - конец ================================= //

let inittingSelectors = [
    { selector: ".search-wrapper", classInstance: Search },
    { selector: ".spoiler", classInstance: Spoiler },
    { selector: ".header", classInstance: Header },
    { selector: "[data-dynamic-adaptive]", classInstance: DynamicAdaptive },
    { selector: ".toggle-slider", classInstance: ToggleSlider },
    { selector: ".nav-tile-container", classInstance: NavTile },
    { selector: ".tabs", classInstance: Tabs },
    { selector: ".star-rating", classInstance: StarRating },
    { selector: ".select", classInstance: Select },
    { selector: ".amount-change", classInstance: AmountChange },
    { selector: "[data-popup-call]", classInstance: PopupCall },
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
inittingInputsBodyObserver.observe(document.body, { childList: true, subtree: true });
setTimeout(() => initInputs(), 0);