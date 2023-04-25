class TextInput {
    constructor(node) {
        this.onChange = this.onChange.bind(this);
        this.onInput = this.onInput.bind(this);
        this.onFocus = this.onFocus.bind(this);

        this.rootElem = node;
        this.input = this.rootElem.querySelector(".text-input__input");
        const paramsString = this.rootElem.dataset.params;
        this.params = fromStringToObject(paramsString);

        this.maskParams = this.maskMethods();
        this.input.addEventListener("change", this.onChange);
        this.input.addEventListener("input", this.onInput);
        this.input.addEventListener("focus", this.onFocus);

        if (this.input.type === "password") initPasswordInput.call(this);

        function initPasswordInput() {
            const input = this.input;
            const icon = this.rootElem.querySelector(".text-input__password-see");
            if (!icon) return;

            icon.addEventListener("click", togglePasswordVisibility);

            function togglePasswordVisibility() {

                icon.classList.contains("__shown")
                    ? hide() : show();

                function show() {
                    icon.classList.add("__shown");
                    input.setAttribute("type", "text");
                }
                function hide() {
                    icon.classList.remove("__shown");
                    input.setAttribute("type", "password");
                }
            }
        }
    }
    onChange(event) { }
    onInput(event) {
        this.maskParams.matchMask(event);
        if (this.params.numbersOnly && this.params.numbersOnly !== "false")
            typeNumberOnly.call(this);

        function typeNumberOnly() {
            if (event.inputType) {
                if (event.inputType.match(/deletecontent/i)) return;
            }

            const exceptions = this.params.numbersOnly;
            const regexp = exceptions === "true"
                ? /[^0-9\s]/g
                : new RegExp(`[^${exceptions}0-9]`, "g");
            this.input.value = this.input.value.replace(regexp, "");
        }
    }
    onFocus() {
        setTimeout(() => {
            this.input.selectionStart = this.input.value.length;
        }, 0);
    }
    maskMethods() {
        matchMask = matchMask.bind(this);
        const mask = this.params.mask;
        if (!mask) return { matchMask: function () { } };

        const unshieldedMask = mask.replace(/\\s/g, " ").replace(/\\/g, "").trim();
        this.input.setAttribute("maxlength", unshieldedMask.length);

        return { matchMask };

        function matchMask(event = {}) {
            if (event.inputType && event.inputType.match(/deletecontent/i)) return;
            if (!mask || mask == "false") return;

            const value = this.input.value;
            const position = this.input.selectionStart;
            const slice = unshieldedMask.slice(0, position);
            if (!slice) return;

            const sliceToRegexp = slice.replace(/\+/g, "\\+")
                .replace(/\(/g, "\\(")
                .replace(/\)/g, "\\)")
                .replace(/\-/g, "\\-");
            const regexp = new RegExp(sliceToRegexp);

            if (!value.match(regexp)) {
                const dotsReplaces = [];
                value.split("").forEach((substr, i) => {
                    if (unshieldedMask[i] === ".") dotsReplaces.push(substr);
                });

                let str = "";
                let closestDotIndex = unshieldedMask.slice(0, position).lastIndexOf(".");
                if (closestDotIndex < 0) closestDotIndex = unshieldedMask.indexOf(".");

                if (closestDotIndex <= position) {
                    let i = position;
                    do {
                        i++;
                        closestDotIndex = unshieldedMask.slice(0, i).lastIndexOf(".");
                    } while (closestDotIndex <= position)

                }
                unshieldedMask.slice(0, closestDotIndex).split("").forEach(substr => {
                    if (substr === "." && dotsReplaces[0]) {
                        str += dotsReplaces[0];
                        dotsReplaces.shift();
                    }
                    else str += substr;
                });

                const valEnd = value.slice(position - 1);
                this.input.value = `${str}${valEnd}`;
            }
        }
    }
}

class SMSCode {
    constructor(node) {
        this.onInput = this.onInput.bind(this);
        this.onKeydown = this.onKeydown.bind(this);

        this.rootElem = node;
        this.inputs = createInputs.call(this);
        this.inputs.forEach(input => {
            input.addEventListener("input", this.onInput);
            input.addEventListener("keydown", this.onKeydown);

            const obs = new MutationObserver(setAttr);
            obs.observe(input, { attributes: true });
            setAttr();

            function setAttr() {
                if(input.getAttribute("maxlength") == "1") return;
                input.setAttribute("maxlength", "1");
            }
        });

        function createInputs() {
            const inputs = [];
            for (let i = 0; i < 4; i++) {
                const input = createElement("input", "sms-code__input");
                input.setAttribute("type", "number");
                this.rootElem.append(input);
                inputs.push(input);
            }
            return inputs;
        }
    }
    onInput(event){
        const input = event.target;
        const currentIndex = this.inputs.findIndex(inp => inp === input);

        input.value = input.value.replace(/\D/g, "");
        if (input.value.length > 0) {
            input.value = input.value.slice(0, 1);
            const nextInput = this.inputs[currentIndex + 1];
            if(nextInput) nextInput.focus();
        }
    }
    onKeydown(event) {
        const input = event.target;
        const currentIndex = this.inputs.findIndex(inp => inp === input);

        if(event.code === "ArrowRight") {
            const nextInput = this.inputs[currentIndex + 1];
            if(nextInput) nextInput.focus();
        }
        if(event.code === "ArrowLeft") {
            const prevInput = this.inputs[currentIndex - 1];
            if(prevInput) prevInput.focus();
        }
    }
}

class Form {
    constructor(node) {
        this.getInputsParams = this.getInputsParams.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.rootElem = node;
        this.inputsParams = [];
        setTimeout(this.getInputsParams, 100);
        setObserver.call(this);

        this.rootElem.addEventListener("submit", this.onSubmit);

        function setObserver() {
            const observer = new MutationObserver(this.getInputsParams);
            observer.observe(this.rootElem, { childList: true, subtree: true });
        }
    }
    getInputsParams() {
        const newInputsParams = inittedInputs.filter(inpParams => {
            const isInArr = this.inputsParams.find(ip => ip.rootElem === inpParams.rootElem);
            if (isInArr) return false;

            const isChild = inpParams.rootElem.closest("form") === this.rootElem;
            return isChild;
        });
        this.inputsParams = this.inputsParams.concat(newInputsParams);
    }
    onSubmit() {
        this.checkCompletion();
    }
    checkCompletion() {
        const requiredInputs = this.inputsParams.filter(inpParams => inpParams.isRequired);
        const uncompletedInputs = [];
        requiredInputs.forEach(inpParams => {
            const isCompleted = inpParams.checkCompletion();
            if (isCompleted) return;

            uncompletedInputs.push(inpParams);
            inpParams.rootElem.classList.add("__uncompleted");
        });

        this.isAllCompleted = uncompletedInputs.length < 1;
    }
}

class LoginForm extends Form {
    constructor(node) {
        super(node);
    }
}

class SignupForm extends Form {
    constructor(node) {
        super(node);
    }
}

const formsSelectors = [
    { selector: ".text-input--standard", classInstance: TextInput },
    { selector: ".sms-code", classInstance: SMSCode },
    { selector: "form.login-form", classInstance: LoginForm },
    { selector: "form.signup-form", classInstance: SignupForm },
];
inittingSelectors = inittingSelectors.concat(formsSelectors);