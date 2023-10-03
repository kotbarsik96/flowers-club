function isSelector(string = "") {
    if (typeof string !== "string") return false;

    if (string.match(/\[.+\]/)) return true;
    if (string.match(/^[#.].+$/)) return true;
    return false;
}

function qs(selector, relative = document) {
    return relative.querySelector(selector);
}

function qsAll(selector, relative = document) {
    return Array.from(relative.querySelectorAll(selector));
}

function capitalizeFirstLetter(str) {
    return str.split("").map((substr, index) => index === 0 ? substr.toUpperCase() : substr).join("");
}

function camelCaseToKebab(str) {
    return str.split("").map((substr, index) => {
        if (index === 0) return substr;
        if (substr.match(/[A-Z]/)) return `-${substr.toLowerCase()}`;
        return substr;
    }).join("");
}

function getParams(ctx, datasetName = "params", propertiesDelimeter = "; ", valueDelimeter = ":") {
    const paramsString = ctx.rootElem.dataset[datasetName];
    ctx.rootElem.removeAttribute(camelCaseToKebab(`data${capitalizeFirstLetter(datasetName)}`));
    if (!paramsString) return {};

    return parseStringToObj(paramsString, propertiesDelimeter, valueDelimeter);
}

/* input: "hello:world; somevalue:test; url:''http://localhost/''"; 
    output: { hello: "world", somevalue: "test", url: "http://localhost/" } 
    ВАЖНО: если в передаваемый параметр нужно передать propertiesDelimeter или valueDelimeter, такой параметр оборачивается двойным символом одинарной кавычки ( ''value'' ) и дальнейший код эти символы заменит на время, чтобы они не участвовали в методе .split()
    Например, когда нужно передать двоеточие или точку с запятой, пишется так: key:''http://localhost''
*/
function parseStringToObj(string, propertiesDelimeter = "; ", valueDelimeter = ":") {
    // заменить в значении, находящемся в кавычках, символы, отвечающие за propertiesDelimeter и valueDelimeter на нейтральные
    const propertiesDelPlaceholder = "__p__";
    const valueDelPlaceholder = "__v__";
    string = replaceDelimetersToPlaceholders(string);

    const array = trimLastPunctMark(string).split(propertiesDelimeter);
    const obj = {};
    array.forEach(property => {
        const split = property.split(valueDelimeter);
        const key = split[0];
        let value = split[1];

        // здесь возрващаются символы propertiesDelimeter и valueDelimeter, а строка очищается от кавычек "'"
        if (value && value.match(/('').+('')/)) value = replacePlaceholdersToDelimeters(value);

        if (value === "true") value = true;
        if (value === "false") value = false;
        obj[key] = value;
    });

    return obj;

    function replaceDelimetersToPlaceholders(string) {
        const p = new RegExp(propertiesDelimeter, "g");
        const v = new RegExp(valueDelimeter, "g");

        const matches = string.match(/('').+?('')/g);
        if (!matches) return string;

        matches.forEach(match => {
            const newSubstring = match
                .replace(p, propertiesDelPlaceholder)
                .replace(v, valueDelPlaceholder);
            string = string.replace(match, newSubstring);
        });
        return string;
    }
    function replacePlaceholdersToDelimeters(string) {
        const pReverse = new RegExp(propertiesDelPlaceholder, "g");
        const vReverse = new RegExp(valueDelPlaceholder, "g");

        return string
            .replace(pReverse, propertiesDelimeter)
            .replace(vReverse, valueDelimeter)
            .replace(/('')/g, "");
    }
}

function trimLastPunctMark(str) {
    str = str.trim();
    if (str.match(/[.;,]$/)) {
        return str.slice(0, str.length - 1);
    }
    return str;
}

// в случае, когда нужно отправить массив через dataToPost, надо делать так: [{ name: "", value: []|{}|"" }]
function ajaxQuery(action = "", dataToPOST = {}, parseMethod = "") {
    if (!action || !dataToPOST || typeof dataToPOST !== "object") return null;

    return new Promise(async (resolve, reject) => {
        try {
            let fileCount = 1;
            const body = new FormData();
            body.append("action", action);
            body.append("userNonce", wpAjaxData.userNonce || "");
            if (Array.isArray(dataToPOST)) {
                dataToPOST.forEach(obj => {
                    if (!obj.value) return;
                    body.append(obj.name, obj.value);
                });
            } else {
                for (let key in dataToPOST) {
                    const value = dataToPOST[key];
                    if (key === "action" || !value) continue;

                    if (Array.isArray(value)) {
                        value.forEach(item => {
                            if (item instanceof File) {
                                body.append(`file_${fileCount}`, item);
                                fileCount++;
                            } else {
                                body.append(`${key}[]`, item);
                            }
                        });
                        continue;
                    }
                    body.append(key, value);
                }
            }

            const response = await fetch(wpAjaxData.url, {
                method: "POST",
                body
            });
            let result = parseMethod && response[parseMethod]
                ? response[parseMethod]()
                : response;
            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
}

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

function setLoadingState(elOrArray, params = {}) {
    const timeout = parseInt(params.timeout) || 500;
    const timeoutSeconds = timeout / 1000;
    if (Array.isArray(elOrArray)) elOrArray.forEach(el => doSet(el));
    else doSet(elOrArray);

    function doSet(el) {
        el.classList.add("__loading-state");
        el.style.transition = `all ${timeoutSeconds}s`;
    }
}

function unsetLoadingState(elOrArray, params = {}) {
    const timeout = parseInt(params.timeout) || 500;

    if (Array.isArray(elOrArray)) elOrArray.forEach(el => doUnset(el));
    else doUnset(elOrArray);

    function doUnset(el) {
        el.classList.remove("__loading-state");
        setTimeout(() => {
            el.style.removeProperty("transition");
        }, timeout);
    }
}

class LoadingState {
    constructor(el, params = {
        timeout: 500
    }) {
        this.el = el;
        this.params = params;
        this.loadingClassName = "__loading-state";

        setDefaultParams.call(this);

        function setDefaultParams() {
            const timeout = parseInt(this.params.timeout);
            if (!timeout) this.params.timeout = 500;
            this.timeoutSeconds = this.params.timeout / 1000;
        }
    }
    setLoadingState() {
        this.el.classList.add(this.loadingClassName);
        this.el.style.transition = `all ${this.timeoutSeconds}s`
    }
    unsetLoadingState() {
        this.el.classList.remove(this.loadingClassName);
        setTimeout(() => {
            this.el.style.removeProperty("transition");
        }, this.params.timeout);
    }
}

// loadingState на всю страницу
class BodyLoadingState extends LoadingState {
    constructor(params = { timeout: 500 }) {
        super(document.body, params);

        this.overlay = createElement("div", "loading-overlay", `
            <span class="loading-overlay__dot" style="--i: 0;"></span>
            <span class="loading-overlay__dot" style="--i: 1;"></span>
            <span class="loading-overlay__dot" style="--i: 2;"></span>
        `);
    }
    setLoadingState() {
        this.overlay.style.paddingLeft = `${getScrollWidth()}px`;
        document.body.append(this.overlay);
        document.body.classList.add(this.loadingClassName);
    }
    unsetLoadingState() {
        this.overlay.remove();
        document.body.classList.remove(this.loadingClassName);
    }
}
const bodyLoadingState = new BodyLoadingState({ timeout: 1000 });
// loadingState на всю страницу - конец

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

function getHeight(el, opts = {}) {
    let clone = el.cloneNode(true);
    clone.style.cssText = `
        width: ${opts.width || el.offsetWidth}px; 
        z-index: 100; 
        position: absolute; 
        top: 0; 
        left: 0;
        z-index: -999;
    `;
    document.body.append(clone);
    const height = clone.offsetHeight;
    clone.remove();
    clone = null;

    return height;
}

function createElement(tagName, className = "", insertingHTML = "", attributes = {}) {
    let element = document.createElement(tagName);
    if (className) element.className = className;
    if (insertingHTML) element.insertAdjacentHTML("afterbegin", insertingHTML);
    if (attributes) {
        for (let key in attributes) {
            const value = attributes[key];
            element.setAttribute(key, value);
        }
    }
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
    const parentDocument = window.parent.document;
    const isInIframe = parentDocument !== document;
    if (isInIframe) return;

    const observer = new MutationObserver(callback);
    observer.observe(document.body, { attributes: true, attributeOldValue: true });

    function callback(mutations) {
        const oldVal = mutations.find(mut => mut.oldValue === "__locked-scroll");
        if (oldVal && document.body.classList.contains("__locked-scroll")) return;
        if (!oldVal && !document.body.classList.contains("__locked-scroll")) return;

        const scrollWidth = getScrollWidth();
        const wrapper = document.querySelector(".wrapper");
        if (!wrapper) return;

        const currentPadding = parseInt(getComputedStyle(wrapper).paddingRight.replace(/\D/g, "").trim());

        if (document.body.classList.contains("__locked-scroll")) {
            wrapper.style.paddingRight = `${currentPadding + scrollWidth}px`;
        } else {
            wrapper.style.paddingRight = `${currentPadding - scrollWidth}px`;
        }
    }
}
setLockScrollObserver();

function getSlugFromURL(url) {
    if (typeof url !== "string") return "";

    const urlSplit = url.split("/").filter(s => s && s.length > 0);
    let slug = urlSplit[urlSplit.length - 1];
    return slug;
}

function replaceSlugInURL(url = "", newSlug = "") {
    if (typeof url !== "string" || typeof newSlug !== "string") return "";
    let split = url.split(/\/{1}/).filter(s => s);
    if (split.length < 1) return "";

    if (split[0].match(/http/)) split[0] = split[0] + "/";
    split[split.length - 1] = newSlug;
    return split.join("/");
}

function isRequired(ctx) {
    if (!ctx) return;

    if (ctx.rootElem && ctx.rootElem.hasAttribute("data-required")) return true;
    if (ctx.input && ctx.input.hasAttribute("data-required")) return true;
    return false;
}

function bindMethods(ctx, methods = {}) {
    for (let key in methods) {
        const f = methods[key];
        if (typeof f !== "function") continue;
        methods[key] = f.bind(ctx);
    }

    return methods;
}

class DateMethods {
    constructor() {
        this.months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
        this.monthsGenitive = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];
        this.zodiacSigns = [
            { name: "Водолей", start: { month: 1, day: 21 }, end: { month: 2, day: 19 }, iconName: "aquarius" },
            { name: "Рыбы", start: { month: 2, day: 20 }, end: { month: 3, day: 20 }, iconName: "pisces" },
            { name: "Овен", start: { month: 3, day: 21 }, end: { month: 4, day: 20 }, iconName: "aries" },
            { name: "Телец", start: { month: 4, day: 21 }, end: { month: 5, day: 21 }, iconName: "taurus" },
            { name: "Близнецы", start: { month: 5, day: 22 }, end: { month: 6, day: 21 }, iconName: "gemini" },
            { name: "Рак", start: { month: 6, day: 22 }, end: { month: 7, day: 22 }, iconName: "cancer" },
            { name: "Лев", start: { month: 7, day: 23 }, end: { month: 8, day: 21 }, iconName: "leo" },
            { name: "Дева", start: { month: 8, day: 22 }, end: { month: 9, day: 23 }, iconName: "virgo" },
            { name: "Весы", start: { month: 9, day: 24 }, end: { month: 10, day: 23 }, iconName: "libra" },
            { name: "Скорпион", start: { month: 10, day: 24 }, end: { month: 11, day: 22 }, iconName: "scorpio" },
            { name: "Стрелец", start: { month: 11, day: 23 }, end: { month: 12, day: 22 }, iconName: "sagittarius" },
            { name: "Козерог", start: { month: 12, day: 23 }, end: { month: 1, day: 20 }, iconName: "capicorn" },
        ];
    }
    getMaxMonthDay(month, year = null) {
        month = parseInt(month);
        year = parseInt(year) || null;
        if (!month) return 31;

        const highest = [1, 3, 5, 7, 8, 10, 12];
        if (highest.includes(month)) return 31;
        else if (month === 2) {
            const isLeap = year && year % 4 === 0;
            if (!year || isLeap) return 29;
            return 28;
        }

        return 30;
    }
    compare(dateStr1 = "01.01.2000", dateStr2 = "01.01.2000") {
        // format: dd.mm.yyyy
        const split1 = dateStr1.split(".");
        const split2 = dateStr2.split(".");
        const date1 = new Date(`${split1[2]}-${split1[1]}-${split1[0]}`);
        const date2 = new Date(`${split2[2]}-${split2[1]}-${split2[0]}`);

        const isEquals = date1.getFullYear() == date2.getFullYear()
            && date1.getMonth() === date2.getMonth()
            && date1.getDate() === date2.getDate();
        const isCorrectRange = date1 < date2 || isEquals;
        const hasIncorrectDate = !date1.getFullYear() || !date2.getFullYear();

        // isCorrectRange === true значит, что date1 меньше date2
        return { isEquals, isCorrectRange, hasIncorrectDate };
    }
    isInDateRange(dateStartStr, dateEndStr, dateBetweenStr = "") {
        // format: dd.mm.yyyy
        if (!dateStartStr) dateStartStr = "1900-01-01";
        if (!dateEndStr) dateEndStr = `${new Date().getFullYear()}-31-12`;
        const splitStart = dateStartStr.split(".");
        const splitEnd = dateEndStr.split(".");
        const splitBetween = dateBetweenStr.split(".");
        const dateStart = new Date(`${splitStart[2]}-${splitStart[1]}-${splitStart[0]}`);
        const dateEnd = new Date(`${splitEnd[2]}-${splitEnd[1]}-${splitEnd[0]}`);
        const dateBetween = new Date(`${splitBetween[2]}-${splitBetween[1]}-${splitBetween[0]}`);

        const hasIncorrectDate = !dateStart.getFullYear()
            || !dateEnd.getFullYear()
            || !dateBetween.getFullYear();
        const isInDateRange = dateStart <= dateBetween && dateBetween <= dateEnd;

        return { hasIncorrectDate, isInDateRange };
    }
}
const dateMethods = new DateMethods();

function getInputsData(inputsArray = []) {
    if (!Array.isArray(inputsArray)) return false;

    const arrays = {};
    const data = inputsArray
        .filter(input => {
            const type = input.tagName.match(/textarea/i)
                ? "textarea" : input.getAttribute("type");
            if (!type.match(/checkbox|radio/))
                return input.value.trim();
            return input.checked;
        })
        .map((input) => {
            const name = input.name;
            const value = input.value;
            if (name.match(/.+\[.*\]/)) {
                const arrayKey = name.match(/.+(?=\[.*\])/)[0];
                const value = name.match(/\['?.*'?\]/)[0].replace(/\[|'|\]/g, "").trim();
                if (!Array.isArray(arrays[arrayKey])) arrays[arrayKey] = [];
                arrays[arrayKey].push(value);
                return null;
            } else return { name, value };
        }).filter(i => i);

    for (let name in arrays) data.push({ name, value: arrays[name] });
    return data;
}

function canBeStringified(item) {
    try {
        JSON.stringify(item);
    } catch (err) {
        return false;
    }
    return true;
}

function getPostId(relative = null) {
    let postNode;
    if (relative) postNode = relative.closest("[id*='post_']")
        || relative.closest(".product-page[id*='product_']");
    else postNode = qs("[id*='post_']")
        || qs(".product-page[id*='product_']");

    if (!postNode) return null;

    return postNode.getAttribute("id").replace(/post_|product_/, "").trim();
}

function cutText(text = "", maxlength = 50, params = { addEllipsis: false }) {
    if (!parseInt(maxlength)) return text;
    text = text.trim();

    if (text.length < maxlength) return text;
    let cut = text.slice(0, maxlength).trim();
    const match = cut.match(/.+\S(?=\s.+$)/);
    if (match && match[0]) cut = match[0];

    if (params.addEllipsis && cut.length < text.length)
        cut += "...";

    return cut;
}

function createThumbnails(filesArray = []) {
    filesArray = Array.from(filesArray);

    const imagesArray = filesArray.map(file => {
        if (!file.type.startsWith("image/")) return false;
        const img = createElement("img");

        const blob = new Blob([file], { type: file.type });
        const url = URL.createObjectURL(blob);
        img.src = url;
        return img;
    }).filter(img => img);


    return imagesArray;
}

function findInittedInputByEl(el, inst = null) {
    return inittedInputs.find(inpP => {
        if (inst && inpP instanceof inst == false) return false;

        if (inpP.rootElem === el) return true;
        if (inpP.input && inpP.input === el) return true;
        return false;
    });
}

function delay(timeout = null) {
    if (!parseInt(timeout)) timeout = 0;

    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}