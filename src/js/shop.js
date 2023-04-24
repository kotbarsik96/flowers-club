class Catalog {
    constructor(node) {
        this.toggle = this.toggle.bind(this);

        this.rootElem = node;
        this.button = this.rootElem.querySelector(".catalog__button");
        const header = document.querySelector(".header");


        if (!this.rootElem.parentNode.classList.contains("header__icons"))
            header.prepend(this.rootElem);
        this.button.addEventListener("click", () => this.toggle());
        correctDynamicAdaptive.call(this);

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
}

class Filter {
    constructor(node) {
        this.toggle = this.toggle.bind(this);

        this.rootElem = node;
        this.button = this.rootElem.querySelector(".filter__button");
        this.closeButton = this.rootElem.querySelector(".filter__close-button");
        this.inputsParams = [];

        getInputsParams.call(this);
        this.button.addEventListener("click", this.toggle);
        if(this.closeButton) this.closeButton.addEventListener("click", this.toggle(true).hide);
        function getInputsParams() {
            onInittedInputs = onInittedInputs.bind(this);
            document.addEventListener("initted-inputs", onInittedInputs);

            function onInittedInputs() {
                const newInputs = inittedInputs.filter(inpParams => {
                    const isFilterItself = inpParams instanceof Filter;
                    const isNotNew = Boolean(this.inputsParams.find(ip => ip === inpParams));
                    if (isNotNew || isFilterItself) return;

                    const isChild = inpParams.rootElem
                        && inpParams.rootElem.closest(".filter") === this.rootElem;
                    return isChild;
                });
                this.inputsParams = this.inputsParams.concat(newInputs);
            }
        }
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
            document.body.classList.add("__locked-scroll");
        }
        function hide() {
            this.rootElem.classList.remove("__shown");
            document.body.classList.remove("__locked-scroll");
        }
    }
}

class Range {
    constructor(node) {
        this.onPointerdown = this.onPointerdown.bind(this);
        this.onInputChange = this.onInputChange.bind(this);

        this.rootElem = node;
        this.scale = this.rootElem.querySelector(".range__scale");
        this.bar = this.rootElem.querySelector(".range__bar");
        this.params = fromStringToObject(this.rootElem.dataset.params || "");
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
        const regExp = this.params.ignoreMinusSign === "true"
            ? /[^.0-9]/g
            : /[^-.0-9]/g;
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

const shopSelectors = [
    { selector: ".catalog", classInstance: Catalog },
    { selector: ".filter", classInstance: Filter },
    { selector: ".range--single", classInstance: RangeSingle },
    { selector: ".range--double", classInstance: RangeDouble },
];
inittingSelectors = inittingSelectors.concat(shopSelectors);