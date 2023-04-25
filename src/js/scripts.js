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
        function setDefaultParams() {
            if (!parseInt(params.transitionDur)) params.transitionDur = 0;
            else params.transitionDur = parseInt(params.transitionDur);
        }
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
    }
    insert(element, parentNode, params = {}) {
        /* params:
            transitionDur: 0 (в мс)
            insertType: "prepend"|"append"
        */
        function setDefaultParams() {
            if (!parseInt(params.transitionDur))
                params.transitionDur = 0;
            if (params.insertType !== "prepend" && params.insertType !== "append")
                params.insertType = "prepend";
        }
        setDefaultParams();

        return new Promise(resolve => {
            element.style.cssText = `
            opacity: 0; 
            transition: all ${params.transitionDur / 1000}s ease;
        `;
            parentNode[params.insertType](element);

            setTimeout(() => {
                element.style.opacity = "1";
                resolve();
            }, 0);
            setTimeout(() => {
                element.style.removeProperty("transition");
            }, params.transitionDur);
        });
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

function getScrollWidth() {
    const block = createElement("div");
    block.style.cssText = `position: absolute; top: -100vh, right: -100vw; z-index: -999; opacity: 0; width: 100px; height: 100px; overflow: scroll`;
    const blockInner = createElement("div");
    blockInner.style.cssText = `width: 100%; height: 200px`;
    block.append(blockInner);

    document.body.append(block);
    const width = block.offsetWidth - block.clientWidth;
    block.remove();
    return width;
}

function setLockScrollObserver() {
    const observer = new MutationObserver(callback);
    observer.observe(document.body, { attributes: true, attributeOldValue: true });

    function callback() {
        const scrollWidth = getScrollWidth();
        const wrapper = document.querySelector(".wrapper");
        const currentPadding = parseInt(getComputedStyle(wrapper).paddingRight.replace(/\D/g, "").trim());

        if (document.body.classList.contains("__locked-scroll")) {
            wrapper.style.paddingRight = `${currentPadding + scrollWidth}px`;
        } else {
            wrapper.style.paddingRight = `${currentPadding - scrollWidth}px`;
        }
    }
}
setLockScrollObserver();

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
        this.popups = [];
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
        this.popups.push(popup);
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
        const bodyInner = contentParams.body
            ? contentParams.body
            : ` 
                <div class="popup__close-container">
                    <button class="popup__close close" type="button"></button>
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
        const index = this.popups.indexOf(popup);
        this.popups.splice(index, 1);
    }
}
// с помощью методов класса можно вызвать новые попапы, удалить созданные. Новый попап можно создать, передав параметры содержимого в него (текст, кнопки и др.)
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
                .map(modalParams => modalParams.modal.offsetHeight)
                .sort((height1, height2) => {
                    if (height1 > height2) return -1;
                    if (height1 < height2) return 1;
                    return 0;
                });
            const biggestHeight = heights[0];
            const windowHeight = document.documentElement.clientHeight || window.innerHeight;

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
    createNewModal(params = {
        removeOtherModals: false, modalName: "", refresh: false, modalInitParams: {}
    }) {
        /* params:
            removeOtherModals: false|true - удалить ли остальные окна в this.modalsContainer
            modalName: string - название модального окна, по которому будет вызван соответствующий наследник класса Modal
            refresh: false|true - если было уже вызвано окно с этим же modalName, оно будет храниться в this.calledModals, что позволит не реинициализировать его в дальнейшем. В случае, если refresh === true, оно будет удалено оттуда и его придется реиницализировать
        */
        if (!this.modalsContainer.closest("body")) {
            htmlElementMethods.insert(this.modalsContainer, document.body, { transitionDur: 200 });
            document.body.classList.add("__locked-scroll");
        }

        const modalParams = this.renderModal(params);
        this.calledModals.push(modalParams);
        this.modalsInContainer.push(modalParams);

        htmlElementMethods.insert(modalParams.modal, this.modalsContainer, { transitionDur: 500 })
            .then(this.onResize);
        modalParams.modal.addEventListener("close", () => this.removeModalFromPage(modalParams));
    }
    renderModal(params = {}) {
        const modalName = params.modalName;
        const refresh = params.refresh;
        getModalParams = getModalParams.bind(this);

        let modalParams;

        switch (modalName) {
            case "auth": modalParams = getModalParams(ModalAuth);
                break;
        }

        return modalParams;

        function getModalParams(classInstance) {
            const existingParams = this.calledModals.find(inpP => inpP instanceof classInstance);
            if (existingParams) {
                if (refresh) {
                    const modalParams = new classInstance(params.modalInitParams);
                    setTimeout(() => this.removeModal(existingParams), 1000);
                    return modalParams;
                } else return existingParams;
            }

            return new classInstance(params.modalInitParams);
        }
    }
    removeModalFromPage(modalParams) {
        if (!modalParams.modal) return;

        htmlElementMethods.remove(modalParams.modal, { transitionDur: 300 });
        const index = this.modalsInContainer.findIndex(inpP => inpP.modal === modalParams.modal);
        if (index >= 0) this.modalsInContainer.splice(index, 1);

        if (this.modalsInContainer.length < 1) {
            htmlElementMethods.remove(this.modalsContainer, { transitionDur: 200 });
            document.body.classList.remove("__locked-scroll");
        }
    }
    removeModal(modalParams) {
        if (!modalParams.modal) return;

        this.removeModalFromPage(modalParams);
        const index = this.calledModals.findIndex(inpP => inpP.modal === modalParams.modal);
        if (index >= 0) this.calledModals.splice(index, 1);
    }
}
// с помощью методов класса на страницу добавляются новые модальные окна. В отличии от попапов, чтобы создать новое окно, нужно полностью 
const modalsMethods = new Modals();

class ModalCall {
    constructor(node) {
        this.onClick = this.onClick.bind(this);

        this.rootElem = node;
        this.callingParams = fromStringToObject(this.rootElem.dataset.modalCall);

        this.rootElem.addEventListener("click", this.onClick);
    }
    onClick() {
        const modalName = this.callingParams.name;
        this.callModal(modalName);
    }
    callModal(modalName) {
        const removeOtherModals = this.callingParams.removeOtherModals === "true"
            ? true : false;
        const refresh = this.callingParams.refresh === "true" ? true : false;
        const modalInitParams = this.callingParams;

        modalsMethods.createNewModal({
            modalName,
            refresh,
            removeOtherModals,
            modalInitParams
        });
    }
}

class Modal {
    constructor(params = {}) {
        this.onCrossClick = this.onCrossClick.bind(this);

        this.params = params;
        this.modal = this.renderModal();
        this.closeBtn = this.modal.querySelector(".modal__close-button");

        this.closeBtn.addEventListener("click", this.onCrossClick);
    }
    onCrossClick() {
        this.modal.dispatchEvent(new CustomEvent("close"));
    }
}
class ModalAuth extends Modal {
    constructor(params = {}) {
        super(params);

        this.id = Math.random();
    }
    renderModal() {
        let iframeSrc = this.params.iframeSrc || "";
        if (iframeSrc.match(/undefined/i) || !iframeSrc) iframeSrc = "/flowers-club/auth/signup/index.html";

        const modalInner = `
        <div class="auth-modal__close-container modal__close-container">
            <button class="auth-modal__close-button modal__close-button" type="button">
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
        const modal = createElement("div", "modal auth-modal", modalInner);

        return modal;
    }
}
// ================================= МОДАЛЬНЫЕ ОКНА - конец ========================= //

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
    { selector: "[data-modal-call]", classInstance: ModalCall },
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