class AuthCodeController {
    // нужно, чтобы у блока el был хотя бы какой-нибудь класс
    constructor(el) {
        this.onPopstate = this.onPopstate.bind(this);
        this.onConfirm = this.onConfirm.bind(this);

        this.el = el;
        this.oldBlocks = [];
        this.authCodeParams = null;
        this.options = {};
        this.nonce = "";
    }
    async show(validationType, optionsToPOST = {}, options = {}) {
        /* optionsToPOST: { 
            text: '' 
        } 
            options: {
                onConfirm: function(){}, - callback, вызываемый, когда код будет введен (неважно, правильный он или нет, т.е. нужно делать также проверку)
                onConfirmArgs: []
            }
        */
        let elClassName = this.el.className.split(" ")[0];
        if (elClassName) elClassName = elClassName.trim();
        if (!elClassName) return;

        // сохранит старое содержимое блока el
        this.oldBlocks = qsAll(`.${elClassName} > *`, this.el);
        optionsToPOST.validationType = validationType;
        const res = await ajaxQuery("get_validation_code_layout", optionsToPOST, "json");
        const layout = res.layout;
        this.el.innerHTML = layout;
        this.authCodeParams = initInput(qs(".auth-code", this.el), AuthCode);
        this.options = options;
        this.nonce = res.nonce;

        // если в options передать функцию onConfirmArgs, будет вызвана она. Все проверки в таком случае должны выполняться в этой самой функции, т.к. "confirm-code" означает только, что код был введен, но еще не проверен
        this.authCodeParams.rootElem.addEventListener("confirm-code", this.onConfirm);

        history.pushState({}, "");
        window.addEventListener("popstate", this.onPopstate);
    }
    nullify() {
        this.authCodeParams.rootElem.removeEventListener("confirm-code", this.onConfirm);
        this.oldBlocks = [];
        this.authCodeParams = null;
        this.options = {};
        this.nonce = "";
    }
    onPopstate() {
        window.removeEventListener("popstate", this.onPopstate);
        this.el.innerHTML = "";
        this.oldBlocks.forEach(block => this.el.append(block));

        this.nullify();
    }
    async onConfirm(event = {}) {
        // в event.detail.code находится введенный код
        if (typeof this.options.onConfirm === "function") {
            const args = Array.isArray(this.options.onConfirmArgs)
                ? this.options.onConfirmArgs
                : [];
            this.options.onConfirm(event, ...args);
            return;
        }

        const detail = event && event.detail ? event.detail : null;
        if (!detail) return;

        const code = detail.code;
        const postData = {
            userNonce: wpAjaxData.userNonce,
            nonce: this.nonce
        };
        const res = await ajaxQuery("verify_code", postData, "json");
        if (res.success) {
            document.dispatchEvent(new CustomEvent("code-confirmed"));
            this.nullify();
        }
    }
    onIncorrectCode() {
        const ciParams = this.authCodeParams.codeInputsParams;
        ciParams.inputs.forEach(input => input.value = "");
        ciParams.inputs[0].focus();
        ciParams.container.classList.add("__uncompleted");
    }
}

class TextInput {
    constructor(node) {
        this.rootElem = node;
        this.input = this.rootElem.querySelector(".text-input__input");
        this.params = getParams(this);
        this.isRequired = isRequired(this);
        this.isDate = this.params.isDate;
        this.errorBlock = qs(".error", this.rootElem);
        if (this.errorBlock)
            this.errorDefaultMessage = this.errorBlock.textContent.trim();
        if (this.isDate) {
            this.params.completionMask = "../../....";
            this.params.isStrictCompletionMask = true;
            this.params.typeOnly = "/";
            this.params.numbersOnly = true;

            const currentYear = new Date().getFullYear();
            this.minYear = getMinmaxYear(this.params.minYear);
            this.maxYear = getMinmaxYear(this.params.maxYear);

            function getMinmaxYear(value) {
                if (value === "currentYear") return currentYear;
                if (value.startsWith("-")) {
                    const coef = parseInt(value.replace(/\D/g, "")) || 0;
                    if (coef > currentYear) return currentYear;
                    return currentYear - coef;
                }
                if (value.startsWith("+")) {
                    const coef = parseInt(value.replace(/\D/g, "")) || 0;
                    return currentYear + coef;
                }

                return parseInt(value.replace(/\D/g, "")) || currentYear;
            }
        }

        this.initInput();
        if (this.input.type === "password") initPasswordInput.call(this);
        if (this.params.completionMask) this.completionMaskParams = this.initCompletionMask();

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
    initInput() {
        const methods = bindMethods(this, {
            typeOnly() {
                const regexp = new RegExp(`[^${this.params.typeOnly}]`);
                this.input.value = this.input.value.replace(regexp, "");
            },
            onInput() {
                if (!this.isCompleted)
                    this.checkCompletion();
            },
            onChange() {

            },
        });

        if (this.params.numbersOnly) {
            if (this.params.typeOnly) this.params.typeOnly = `0-9${this.params.typeOnly}`;
            else this.params.typeOnly = "0-9";
        }
        if (this.params.typeOnly) this.input.addEventListener("input", methods.typeOnly);

        this.input.addEventListener("input", methods.onInput);
        this.input.addEventListener("change", methods.onChange);
    }
    initCompletionMask() {
        if (!this.params.completionMask) return null;

        switch (this.params.completionMask) {
            case "email": this.params.completionMask = "[0-9a-zA-Z]+@[0-9a-zA-Z]{2,}\.[0-9a-zA-Z]+";
                break;
            case "phone": this.params.completionMask = "\\+7 \\(...\\) ...\\-..\\-..";
                break;
        }
        const data = bindMethods(this, {
            mask: this.params.completionMask.replace(/\\/g, ""),
            regExp: new RegExp(this.params.completionMask),
            placeholder: this.params.completionMaskPlaceholder || ".",

            init() {
                if (this.params.isStrictCompletionMask) {
                    this.input.addEventListener("input", data.onInput);
                }
            },
            onInput(event) {
                if (event.inputType.match(/delete/)) {
                    if (this.input.selectionStart < this.input.value.length) {
                        this.input.value = "";
                        return;
                    } else return;
                }

                let modifyingValue = data.mask;
                const clearValue = data.getClearValue();
                clearValue.split("").forEach(substr => {
                    modifyingValue = modifyingValue.replace(data.placeholder, substr);
                });
                let placeholderIndex = modifyingValue.indexOf(data.placeholder);
                if (placeholderIndex < 0) placeholderIndex = modifyingValue.length;
                this.input.value = modifyingValue.slice(0, placeholderIndex);

                if (this.isDate) this.input.value = data.validateDate();
            },
            getClearValue() {
                const placeholderIndex = data.mask.indexOf(data.placeholder);
                if (this.input.value.length < placeholderIndex) return this.input.value;

                return this.input.value
                    .split("")
                    .filter((s, index) => data.mask[index] === data.placeholder)
                    .join("");
            },
            validate() {
                return Boolean(this.input.value.match(data.regExp));
            },
            validateDate() {
                const split = this.input.value.split("/");
                if (split.length < 1) return this.input.value;
                if (split[0].length < 2) return this.input.value;

                let monthDay = parseInt(split[0]);
                let month = parseInt(split[1]);
                let year = parseInt(split[2]);

                if (year && year.toString().length === 4) {
                    if (year < this.minYear) year = this.minYear;
                    if (year > this.maxYear) year = this.maxYear;
                }

                if (!month || month < 1) month = 1;
                if (month > 12) month = 12;

                const maxDay = dateMethods.getMaxMonthDay(month, year);
                if (monthDay < 1) monthDay = 1;
                if (monthDay > maxDay) monthDay = maxDay;

                return split.map((v, index) => {
                    // день
                    if (index === 0) {
                        if (v.length < 2) return v;

                        const md = monthDay.toString();
                        return md.length < 2 ? `0${md}` : md;
                    }
                    // месяц
                    if (index === 1) {
                        if (v.length < 2) return v;

                        const m = month.toString();
                        return m.length < 2 ? `0${m}` : m;
                    }
                    // год
                    if (index === 2) {
                        if (!year) return v;

                        return year.toString();
                    }
                }).join("/");
            }
        });
        data.init();

        return data;
    }
    checkCompletion() {
        this.isCompleted = Boolean(this.input.value.trim());
        if (this.completionMaskParams) this.isCompleted = this.completionMaskParams.validate();
        if (this.input.type === "password") this.isCompleted = checkPassword.call(this);

        if (this.isCompleted) {
            this.rootElem.classList.remove("__uncompleted");
        }

        return this.isCompleted;

        function checkPassword() {
            const regexps = [
                /[a-z]/,
                /[A-Z]/,
                /[0-9]/,
                /[-#$!%^&*;.@]/
            ];
            const minlength = 8;
            const maxlength = 50;

            if (this.input.value.length < minlength || this.input.value.length > maxlength) return false;
            for (let regexp of regexps) {
                if (!this.input.value.match(regexp)) return false;
            }
            return true;
        }
    }
    setErrorMessage(message = null) {
        if (!this.errorBlock) return;

        if (!message && typeof message !== "string") {
            this.errorBlock.textContent = this.errorDefaultMessage;
            return;
        }

        this.errorBlock.textContent = message;
    }
}

class AuthCode {
    constructor(node) {
        this.confirm = this.confirm.bind(this);
        this.onBackButtonClick = this.onBackButtonClick.bind(this);

        this.rootElem = node;
        this.codeInputsParams = this.createCodeInputs();
        this.confirmButton = qs(".auth-code__confirm", this.rootElem);
        this.backButton = qs(".auth-modal__offer-back", this.rootElem);

        if (this.confirmButton) this.confirmButton.addEventListener("click", this.confirm);
        if (this.backButton) this.backButton.addEventListener("click", this.onBackButtonClick);
    }
    onBackButtonClick() {
        history.back();
    }
    createCodeInputs() {
        const data = bindMethods(this, {
            container: qs(".auth-code__inputs", this.rootElem),
            inputs: [],

            init() {
                for (let i = 0; i < 4; i++) {
                    const input = createElement("input", "auth-code__input", null, { type: "number" });
                    data.container.append(input);
                    data.inputs.push(input);
                }

                data.inputs.forEach(input => {
                    input.addEventListener("input", data.onInput);
                    input.addEventListener("keydown", data.onKeydown);
                    input.addEventListener("paste", data.onPaste);

                    const obs = new MutationObserver(setAttr);
                    obs.observe(input, { attributes: true });
                    setAttr();

                    function setAttr() {
                        if (input.getAttribute("maxlength") == "1") return;
                        input.setAttribute("maxlength", "1");
                    }
                });
            },
            onInput(event) {
                data.container.classList.remove("__uncompleted");

                const input = event.target;
                const currentIndex = data.inputs.findIndex(inp => inp === input);

                input.value = input.value.replace(/\D/g, "");
                if (input.value.length > 0) {
                    input.value = input.value.slice(0, 1);
                    const nextInput = data.inputs[currentIndex + 1];
                    if (nextInput) nextInput.focus();
                }

                const isCompleted = data.inputs.filter(inp => inp.value.length < 1).length < 1;
                if (isCompleted) this.confirm();
            },
            onKeydown(event) {
                const input = event.target;
                const currentIndex = data.inputs.findIndex(inp => inp === input);

                if (event.code === "ArrowRight") {
                    const nextInput = data.inputs[currentIndex + 1];
                    if (nextInput) nextInput.focus();
                }
                if (event.code === "ArrowLeft" || event.key.match(/backspace/i)) {
                    const prevInput = data.inputs[currentIndex - 1];
                    if (prevInput) prevInput.focus();
                }
            },
            onPaste(event) {
                event.preventDefault();
                const clipboardData = event.clipboardData.getData("text").replace(/\D/g, "");
                if (clipboardData.length < data.inputs.length) return;

                data.inputs.forEach((input, index) => input.value = clipboardData[index]);
                const last = data.inputs[data.inputs.length - 1];
                last.focus();
                last.dispatchEvent(new Event("input"));
            }
        });
        data.init();

        return data;
    }
    confirm() {
        const code = this.codeInputsParams.inputs.map(input => input.value).join("");
        if (code.length < 4) return;

        this.rootElem.dispatchEvent(new CustomEvent("confirm-code", { detail: { code } }));
    }
}

class Form {
    constructor(node) {
        this.getInputsParams = this.getInputsParams.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.rootElem = node;
        this.params = getParams(this);
        this.isInsideIframe = window.parent.window !== window;
        this.inputsParams = [];
        this.loadingStateContoller = new LoadingState(this.rootElem);
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
    onSubmit(event) {
        event.preventDefault();
        this.checkCompletion();
    }
    checkCompletion() {
        const requiredInputs = this.inputsParams.filter(inpParams => {
            return inpParams.isRequired
                && inpParams.rootElem
                && inpParams.rootElem.closest("form") === this.rootElem;
        });
        const uncompletedInputs = [];
        requiredInputs.forEach(inpParams => {
            const isCompleted = inpParams.checkCompletion();
            if (isCompleted) return;

            uncompletedInputs.push(inpParams);
            inpParams.rootElem.classList.add("__uncompleted");
        });

        this.isAllCompleted = uncompletedInputs.length < 1;

        if (uncompletedInputs[0]) {
            this.failValidatePopupCall();
            const unc = uncompletedInputs[0].rootElem;
            const windowHeight = document.documentElement.clientHeight || window.innerHeight;
            let top = getCoords(unc).top - (windowHeight - windowHeight * 0.75);
            window.scrollTo({
                top,
                behavior: "smooth"
            });
        }
    }
    failValidatePopupCall(message) {
        if (!this.params.failValidatePopup) return;

        if (!message) message = "Пожалуйста, заполните все необходимые поля";
        popupsMethods.callPopup("error", {
            "error_text": message,
            destroyTimeout: 3000,
            isOnce: true
        });
    }
}

class LoginForm extends Form {
    constructor(node) {
        super(node);
    }
    async onSubmit(event) {
        event.preventDefault();

        const loginInput = qs('[name="login"]', this.rootElem);
        const passwordInput = qs('[name="password"]', this.rootElem);

        this.loginData = {
            login: loginInput ? loginInput.value : null,
            password: passwordInput ? passwordInput.value : null,
        }

        passwordInput.closest(".text-input--standard").classList.remove("__uncompleted");
        this.loadingStateContoller.setLoadingState();
        const validatedData = await ajaxQuery("validate_login", this.loginData, "json");

        if (validatedData.success) {
            this.rootElem.insertAdjacentHTML("afterend", validatedData.data.content);
            this.rootElem.remove();
            doReloadPage();
        } else {
            passwordInput.closest(".text-input--standard").classList.add("__uncompleted");
        }

        this.loadingStateContoller.unsetLoadingState();
    }
}

class SignupForm extends Form {
    constructor(node) {
        super(node);

        this.onConfirmCode = this.onConfirmCode.bind(this);
        const emailInput = qs("[name='email']", this.rootElem);
        this.emailErrorTextDefault = qs(".error", emailInput.closest(".text-input--standard")).textContent.trim();
    }
    async onSubmit(event) {
        super.onSubmit(event);
        if (!this.isAllCompleted) return;

        this.loadingStateContoller.setLoadingState();
        const nameInput = qs("[name='user_name']", this.rootElem);
        const emailInput = qs("[name='email']", this.rootElem);
        const passwordInput = qs("[name='password']", this.rootElem);
        const emailInputContainer = emailInput.closest(".text-input--standard");

        this.signupData = {
            user_name: nameInput ? nameInput.value : null,
            email: emailInput ? emailInput.value : null,
            password: passwordInput ? passwordInput.value : null
        };
        const validatedData = await ajaxQuery("validate_signup", this.signupData, "json");
        if (validatedData.isValid) {
            this.authCodeController = new AuthCodeController(this.rootElem);
            await this.authCodeController.show(
                'signup',
                {
                    email: this.signupData.email
                },
                { onConfirm: this.onConfirmCode }
            );
            this.authCode = this.authCodeController.authCodeParams;
            this.nonce = this.authCodeController.nonce;
        } else if (validatedData.email_exists) {
            qs(".error", emailInputContainer).textContent = "Пользователь с таким Email уже существует";
            emailInputContainer.classList.add("__uncompleted");
        } else {
            qs(".error", emailInputContainer).textContent = this.emailErrorTextDefault;

            if (validatedData.user_name && nameInput)
                nameInput.closest(".text-input--standard").classList.add("__uncompleted");
            if (validatedData.email && emailInput)
                emailInput.closest(".text-input--standard").classList.add("__uncompleted");
            if (validatedData.password && passwordInput)
                passwordInput.closest(".text-input--standard").classList.add("__uncompleted");
        }

        this.loadingStateContoller.unsetLoadingState();
    }
    async onConfirmCode(event) {
        if (this.isConfirming) return;

        this.loadingStateContoller.setLoadingState();
        this.isConfirming = true;
        const detail = event && event.detail ? event.detail : null;
        if (!detail) return;

        const data = Object.assign(this.signupData, {
            nonce: this.nonce,
            code: detail.code,
            authType: 'signup'
        });
        const validatedData = await ajaxQuery("confirm_signup_code", data, "json");
        if (validatedData && validatedData.success) {
            this.rootElem.insertAdjacentHTML("afterend", validatedData.data.content);
            this.rootElem.remove();
            doReloadPage();
        } else {
            this.authCodeController.onIncorrectCode();
        }

        this.loadingStateContoller.unsetLoadingState();
        setTimeout(() => {
            this.isConfirming = false;
        }, 1000);
    }
}

class PasswordChangeForm extends Form {
    constructor(node) {
        super(node);

        this.currentPasswordInput = qs("input[name='current-password']");
        this.newPasswordInput = qs("input[name='new-password']");
        this.newPasswordRepeatInput = qs("input[name='new-password-repeat']");

        this.currentPasswordParams = findInittedInputByEl(this.currentPasswordInput, TextInput);
        this.newPasswordParams = findInittedInputByEl(this.newPasswordInput, TextInput);
        this.newPasswordRepeatParams = findInittedInputByEl(this.newPasswordRepeatInput, TextInput);
    }
    async onSubmit(event) {
        event.preventDefault();

        this.currentPasswordParams.rootElem.classList.remove("__uncompleted");
        this.newPasswordParams.rootElem.classList.remove("__uncompleted");
        this.newPasswordRepeatParams.rootElem.classList.remove("__uncompleted");

        const isCorrectPassword = await this.checkCurrentPassword();
        if (!isCorrectPassword) {
            this.currentPasswordParams.rootElem.classList.add("__uncompleted");
            return false;
        }

        // проделать первую проверку на фронтенде
        const isCompleted = this.doChecks();
        if (!isCompleted) return;

        const postData = {
            userNonce: wpAjaxData.userNonce,
            password: this.newPasswordInput.value,
            passwordRepeat: this.newPasswordRepeatInput.value
        };
        const res = await ajaxQuery("change_password", postData, "json");

        // изменение пароля удалось
        if (res.success) {
            popupsMethods.callPopup("success", {
                destroyTimeout: 3000,
                message: "Пароль успешно изменен"
            });
            this.currentPasswordInput.value = "";
            this.newPasswordInput.value = "";
            this.newPasswordRepeatInput.value = "";
        }
        // изменение пароля провалилось
        else {
            // на основе полученных данных от сервера выставить надписи ошибок
            this.doChecks(res.data);
        }
    }
    doChecks(data = {}) {
        const isCompletedNewPassword = this.newPasswordParams.checkCompletion();
        if (!isCompletedNewPassword || data.invalid_password) {
            this.newPasswordParams.rootElem.classList.add("__uncompleted");
            this.newPasswordParams.setErrorMessage();
            return false;
        }

        const isRepeatCorrect = this.newPasswordRepeatInput.value === this.newPasswordInput.value;
        if (!isRepeatCorrect || data.no_repeat_passwords) {
            this.newPasswordRepeatParams.rootElem.classList.add("__uncompleted");
            return false;
        }

        const isNewPasswordRepeatsCurrent = this.newPasswordInput.value === this.currentPasswordInput.value;
        if (isNewPasswordRepeatsCurrent || data.repeats_current) {
            this.newPasswordParams.setErrorMessage("Новый пароль повторяет текущий");
            this.newPasswordParams.rootElem.classList.add("__uncompleted");
            return false;
        }

        return true;
    }
    async checkCurrentPassword() {
        const postData = {
            userNonce: wpAjaxData.userNonce,
            password: this.currentPasswordInput.value
        };
        const res = await ajaxQuery("check_password", postData, "json");

        if (res.success) return true;
        return false;
    }
}

class PasswordRecoveryForm extends Form {
    constructor(node) {
        super(node);
        this.onConfirmCode = this.onConfirmCode.bind(this);

        this.emailInput = qs("input[name='email']", this.rootElem);
        this.emailInputParams = findInittedInputByEl(this.emailInput, TextInput);
        this.loadingStateContoller = new LoadingState(this.rootElem);
    }
    async onSubmit(event) {
        event.preventDefault();

        this.loadingStateContoller.setLoadingState();
        this.emailInputParams.rootElem.classList.remove("__uncompleted");
        // проверить, корректно ли введен email
        const isCompletedEmail = this.emailInputParams.checkCompletion();
        if (!isCompletedEmail) {
            this.emailInputParams.setErrorMessage();
            this.emailInputParams.rootElem.classList.add("__uncompleted");
            this.loadingStateContoller.unsetLoadingState();
            return;
        }

        // проверить, существует ли пользователь с таким email
        const emailExistsRes = await ajaxQuery(
            "check_email_exists",
            { email: this.emailInput.value },
            "json"
        );
        if (!emailExistsRes.success) {
            this.emailInputParams.setErrorMessage("Пользователь с таким email не найден");
            this.emailInputParams.rootElem.classList.add("__uncompleted");
            this.loadingStateContoller.unsetLoadingState();
            return;
        }

        // вывести поле для ввода кода подтверждения, который придет на почту, чтобы подтвердить, что почта принадлежит тому, кто восстанавливает пароль
        this.email = this.emailInput.value;
        this.authCodeController = new AuthCodeController(this.rootElem);
        await this.authCodeController.show(
            "password-recovery",
            {
                text: "На ваш email отправили код подтверждения, введите его ниже, чтобы сбросить пароль",
                email: this.email
            },
            {
                onConfirm: this.onConfirmCode
            }
        );
        this.loadingStateContoller.unsetLoadingState();
    }
    async onConfirmCode(event) {
        const detail = event && event.detail ? event.detail : null;
        if (!detail) return;

        this.loadingStateContoller.setLoadingState();
        const postData = {
            nonce: this.authCodeController.nonce,
            code: event.detail.code,
            email: this.email
        };
        const res = await ajaxQuery("recovery_password", postData, "json");
        this.loadingStateContoller.unsetLoadingState();

        if (res.success) {
            this.rootElem.innerHTML = res.data.innerhtml;
        } else if (res.data.error === "incorrect_code") {
            this.authCodeController.onIncorrectCode();
        }
    }
}

class SettingsForm extends Form {
    constructor(node) {
        super(node);
    }
    async onSubmit(event, ajaxQueryAction = "") {
        super.onSubmit(event);
        if (!this.isAllCompleted) return;

        this.loadingStateContoller.setLoadingState();

        const data = getInputsData(qsAll("input, textarea", this.rootElem));
        data.push({ name: "userNonce", value: wpAjaxData.userNonce });

        const res = await ajaxQuery(ajaxQueryAction, data, "json");
        this.loadingStateContoller.unsetLoadingState();

        if (res.success) {
            popupsMethods.callPopup("success", {
                message: "Данные обновлены",
                destroyTimeout: 3000,
            });
        }
        else if (res.data.failed_validation) {
            const arr = res.data.failed_validation;
            let message = "";
            if (arr.length === 1) message = `Пожалуйста, укажите обязательное поле: ${arr[0]}`;
            else message = `Пожалуйста, укажите обязательные поля: ${arr.join(", ")}`;
            this.failValidatePopupCall(message);
        }
    }
}

class AccountSettingsForm extends SettingsForm {
    constructor(node) {
        super(node);
    }
    onSubmit(event) {
        super.onSubmit(event, "apply_profile_settings");
    }
}

class UserShipmentAddressSettings extends SettingsForm {
    constructor(node) {
        super(node);
    }
    onSubmit(event) {
        super.onSubmit(event, "apply_user_shipment_address");
    }
}

class Comments {
    constructor(node) {
        this.onNewComment = this.onNewComment.bind(this);
        this.getNewComments = this.getNewComments.bind(this);
        this.scrollToWriteComment = this.scrollToWriteComment.bind(this);

        this.rootElem = node;
        this.params = getParams(this);
        this.toCommentsButton = qs(".to-comments", this.rootElem);
        setDefaultParams.call(this);
        this.commentsListBlock = qs(".comments__list", this.rootElem);
        this.commentsList = [];
        const writeCommentForm = qs("form.comments__write", this.rootElem);
        if (writeCommentForm) {
            this.writeComment = initInput(writeCommentForm, WriteComment);
            this.writeComment.rootElem.addEventListener("new-comment", this.onNewComment);
            if (this.toCommentsButton)
                this.toCommentsButton.addEventListener("click", this.scrollToWriteComment);
        }

        this.getNewComments();
        document.addEventListener("init-inputs", this.getNewComments);
    }
    onNewComment(event = {}) {
        const detail = event && event.detail ? event.detail : null;
        if (!detail) return;

        const layout = detail.layout;
        if (layout && this.commentsListBlock) {
            this.commentsListBlock.insertAdjacentHTML("beforeend", layout);
            const emptyLi = qs(".comments__empty");
            if (emptyLi) emptyLi.remove();
        }
    }
    getNewComments() {
        const newComments = qsAll(".comment", this.rootElem)
            .filter(node => !this.commentsList.find(inpParams => inpParams.rootElem === node))
            .map(node => {
                return initInput(node, SingleComment, { noArray: true });
            });

        this.commentsList = this.commentsList.concat(newComments);
    }
    scrollToWriteComment() {
        if (!this.writeComment) return;

        const coords = getCoords(this.writeComment.rootElem);
        const windowHeight = document.documentElement.clientHeight || window.innerHeight;
        const top = coords.top - (windowHeight - (windowHeight * .5));
        window.scrollTo({
            top,
            behavior: "smooth"
        });
    }
}

class SingleComment {
    constructor(node) {
        this.rootElem = node;
        this.params = getParams(this);
        this.container = qs(".comment__container", this.rootElem);
        const idAttr = this.rootElem.getAttribute("id");
        if (idAttr) this.commentId = idAttr.replace(/comment_/, "");
        setDefaultParams.call(this);
        this.maxlength = parseInt(this.params.maxlength) || 150;
        this.contentBlock = qs(".comment__content", this.rootElem);
        this.contentText = qs(".comment__content-text", this.contentBlock).textContent;
        this.contentTextBlock = qs("p", this.contentBlock);
        this.commentData = getCommentData.call(this);
        this.attachedImagesBlock = qs(".comment__attached-images-list", this.rootElem);
        this.attachedImages = this.getAttachedImages.call(this);
        this.loadingStateContoller = new LoadingState(this.rootElem);

        if (qs(".comment__controls", this.rootElem)) this.controls = this.initControls();
        if (this.contentText.length > this.maxlength) this.cutCommentContent();

        function setDefaultParams() {
            if (!this.params.showMoreText) this.params.showMoreText = "Показать ещё";
            if (!this.params.hideMoreText) this.params.hideMoreText = "Скрыть";
        }
        function getCommentData() {
            const userlink = qs(".comment__profile-name", this.rootElem).getAttribute("href");
            const userAvatar = qs(".comment__avatar-img", this.rootElem).getAttribute("src");

            return { userlink, userAvatar };
        }
    }
    getAttachedImages() {
        return qsAll(".comment__attached-image-container", this.rootElem)
            .map(node => {
                const img = qs("img", node);
                return { node, img };
            });
    }
    cutCommentContent() {
        const button = createElement("button", "link comment__show-more", this.params.showMoreText, { type: "button" });
        const self = this;
        button.addEventListener("click", toggle);
        this.contentBlock.append(button);
        hide();
        window.addEventListener("resize", onResize);

        function toggle() {
            if (self.shownMore) hide();
            else showMore();
        }
        function showMore() {
            self.contentTextBlock.textContent = self.contentText;
            self.contentTextBlock.style.transition = "all .5s ease";
            self.contentTextBlock.style.overflow = "hidden";
            self.contentTextBlock.style.maxHeight = `${getHeight(self.contentTextBlock)}px`;
            button.textContent = self.params.hideMoreText;
            self.shownMore = true;

            setTimeout(() => {
                self.contentTextBlock.style.removeProperty("transition");
                self.contentTextBlock.style.removeProperty("overflow");
            }, 500);
        }
        function hide() {
            if (!self.contentTextCut)
                self.contentTextCut = cutText(self.contentText, self.maxlength) + "...";

            const height = getHeight(
                createElement("div", self.contentTextBlock.className, self.contentTextCut),
                { width: self.contentTextBlock.offsetWidth }
            );

            self.contentTextBlock.style.transition = "all .5s ease";
            self.contentTextBlock.style.maxHeight = `${height}px`;
            self.contentTextBlock.style.overflow = "hidden";
            setTimeout(() => {
                self.contentTextBlock.textContent = self.contentTextCut;
                button.textContent = self.params.showMoreText;
                self.contentTextBlock.style.removeProperty("transition");
                self.contentTextBlock.style.removeProperty("overflow");
            }, 500);

            self.shownMore = false;
        }
        function onResize() {
            if (self.shownMore) showMore();
            else hide();
        }
    }
    initControls() {
        if (!this.commentId) return false;

        const container = qs(".comment__controls", this.rootElem);
        const data = bindMethods(this, {
            container,
            editButton: qs(".comment__control-edit", container),
            deleteButton: qs(".comment__control-delete", container),
            isEditing: false,

            init() {
                data.editButton.addEventListener("click", data.startEditComment);
                data.deleteButton.addEventListener("click", data.showDeleteConfirm);
            },
            // удаление
            showDeleteConfirm() {
                modalsMethods.createNewModal({
                    modalName: "confirm",
                    refresh: true,
                    modalInitParams: {
                        title: "Удалить комментарий?",
                        applyButton: {
                            title: "Удалить",
                            callback: data.deleteComment
                        },
                    }
                });
            },
            async deleteComment() {
                this.loadingStateContoller.setLoadingState();
                const data = {
                    userNonce: wpAjaxData.userNonce,
                    commentId: this.commentId
                };
                const res = await ajaxQuery("delete_comment", data, "json");
                if (res.success) {
                    this.rootElem.remove();

                    popupsMethods.callPopup("success", {
                        message: "Комментарий удалён",
                        destroyTimeout: 1500
                    });
                } else {
                    popupsMethods.callPopup("error", {
                        "error_text": "Произошла ошибка при удалении комментария"
                    });
                }

                this.loadingStateContoller.unsetLoadingState();
            },
            // редактирование
            updateEditingFormEl() {
                if (!data.editingFormParams) {
                    const innerhtml = `
                    <a href="${this.commentData.userlink}">
                        <img src="${this.commentData.userAvatar}" alt="Аватар" class="comments__write-avatar">
                    </a>
                    <div class="comments__write-input-wrapper">
                        <textarea class="comments__write-input" name="comment_text" placeholder="Написать комментарий">${this.contentTextBlock.textContent.trim()}</textarea>
                        <div class="comments__write-thumbnails"></div>
                        <div class="comments__write-upload">
                            <label class="comments__write-icon icon-camera">
                                <input type="file" accept="image/*" multiple="">
                            </label>
                        </div>
                    </div>
                    <div class="comments__write-button-container">
                        <button class="button comments__write-button-save" type="submit">
                            Сохранить
                        </button>
                        <button class="button button--gray-pink comments__write-button-decline" type="button">
                            Отменить
                        </button>
                    </div>
                    `;
                    data.editingFormEl = createElement("form", "comments__write", innerhtml);
                    data.editingFormParams = initInput(data.editingFormEl, EditComment, { noArray: true });
                    data.editingFormParams.rootElem.addEventListener("edit-submit", data.doEditComment);

                    const declineButton = qs(".comments__write-button-decline", data.editingFormEl);
                    declineButton.addEventListener("click", data.returnComment);
                }

                data.editingFormParams.setInputValue(this.contentTextBlock.textContent);
                this.attachedImages = this.getAttachedImages();
                const thumbContainers = this.attachedImages.map(obj => obj.node);
                data.editingFormParams.setImages(thumbContainers);

                return data.editingFormEl;
            },
            startEditComment() {
                if (data.isEditing) return;

                data.isEditing = true;
                const editingFormEl = data.updateEditingFormEl();
                this.container.replaceWith(editingFormEl);
            },
            returnComment() {
                data.editingFormEl.replaceWith(this.container);
                this.attachedImages.forEach(obj => {
                    this.attachedImagesBlock.append(obj.node);
                });
                data.isEditing = false;
                this.attachedImages = this.getAttachedImages();
            },
            async doEditComment() {
                this.loadingStateContoller.setLoadingState();

                data.editingFormEl.replaceWith(this.container);
                const attachedImages = data.editingFormParams.attachedImages.map(obj => obj.file);
                const editingAttachments = data.editingFormParams.thumbnailsEditing
                    .map(obj => obj.img.getAttribute("data-attachment-id"));
                const ajaxData = {
                    commentId: this.commentId,
                    "comment_post_id": getPostId(),
                    "comment_content": data.editingFormParams.commentInput.value,
                    "userNonce": wpAjaxData.userNonce,
                    editingAttachments,
                    attachedImages
                };
                const res = await ajaxQuery("edit_comment", ajaxData, "json");

                this.attachedImages.forEach(obj => {
                    this.attachedImagesBlock.append(obj.node);
                });
                data.isEditing = false;

                this.loadingStateContoller.unsetLoadingState();

                if (res.success) {
                    this.contentTextBlock.textContent = res.data.comment_content;
                    this.attachedImagesBlock.innerHTML = res.data.comment_attached_images_layout;
                    this.attachedImages = this.getAttachedImages();
                    data.editingFormParams.setImages([]);
                    data.editingFormParams.removeAllAttached();
                }
            }
        });
        data.init();

        return data;
    }
}

class WriteComment {
    // максимально допустимый размер изображения в мегабайтах
    maxsizeBytes = 5;

    constructor(node) {
        this.onSubmit = this.onSubmit.bind(this);
        this.onImageLoad = this.onImageLoad.bind(this);
        this.onInput = this.onInput.bind(this);

        this.rootElem = node;
        this.post = this.rootElem.closest("[id*='post_']")
            || this.rootElem.closest(".product-page[id*='product_']");
        this.postId = getPostId(this.post);
        this.commentInput = qs(".comments__write-input", this.rootElem);
        this.imageInput = qs(".comments__write-upload input[type='file']", this.rootElem);
        this.thumbnailsContainer = qs(".comments__write-thumbnails", this.rootElem);
        this.loadingStateContoller = new LoadingState(this.rootElem);

        this.commentInput.addEventListener("input", this.onInput);

        this.rootElem.addEventListener("submit", this.onSubmit);
        if (this.imageInput) {
            this.imageInput.addEventListener("change", this.onImageLoad);
            if (!this.thumbnailsContainer)
                this.thumbnailsContainer = createElement("div", "comments__write-thumbnails");
            this.attachedImages = [];
        }
    }
    onInput() {
        const height = this.commentInput.scrollHeight;
        const maxHeight = parseInt(getComputedStyle(this.commentInput).maxHeight);
        this.commentInput.style.height = height > maxHeight
            ? `${maxHeight}px`
            : `${height}px`;
    }
    async onSubmit(event) {
        event.preventDefault();

        if (!this.postId) return;
        const value = this.commentInput.value.trim();
        if (!value) return;

        const attachedImages = this.attachedImages.map(obj => obj.file);
        const data = {
            "comment_post_id": this.postId,
            "comment_content": this.commentInput.value.trim(),
            "userNonce": wpAjaxData.userNonce,
            attachedImages
        };
        this.loadingStateContoller.setLoadingState();
        const res = await ajaxQuery("add_comment", data, "json");
        this.loadingStateContoller.unsetLoadingState();

        if (res.success) {
            this.commentInput.value = "";
            this.removeAllAttached();
            if (res.data.comment_layout) {
                const detail = { layout: res.data.comment_layout };
                this.rootElem.dispatchEvent(new CustomEvent("new-comment", { detail }));
            }
        }
    }
    onImageLoad() {
        const maxsize = this.maxsizeBytes * 1024 * 1024;
        let aboveLimitFiles = 0;
        const files = Array.from(this.imageInput.files).filter(file => {
            const isUnderLimit = file.size < maxsize;
            if (!isUnderLimit) aboveLimitFiles++;
            return isUnderLimit;
        });
        const images = createThumbnails(files).map((img, index) => {
            const container = createElement("div", "comment__attached-image-container");
            const background = createElement("div", "comment__attached-image-background");
            const removeButton = createElement("button", "close", null, { type: "button" });
            container.append(img, background, removeButton);

            if (!this.thumbnailsContainer.closest("body"))
                this.commentInput.after(this.thumbnailsContainer);

            this.thumbnailsContainer.append(container);
            container.addEventListener("click", () => this.removeImage(img));

            const file = files[index];
            return { container, img, file };
        });

        this.attachedImages = this.attachedImages.concat(images);

        if (aboveLimitFiles > 0) {
            popupsMethods.callPopup("error", {
                "error_text": `Неудачная загрузка изображений (${aboveLimitFiles} шт.). Максимально допустимый размер изображения: ${this.maxsizeBytes} мегабайт`
            });
        }
    }
    removeImage(imgOrIndex) {
        let index = parseInt(imgOrIndex);

        if (index && index >= 0) {
            const obj = this.attachedImages[index];
            if (!obj) return;

            const container = obj.container;
            container.remove();
            this.attachedImages.splice(index, 1);
        } else {
            const img = imgOrIndex;
            if (!img) return;

            const index = this.attachedImages.findIndex(obj => obj.img === img);
            if (index < 0) return;

            const obj = this.attachedImages[index];
            if (!obj) return;

            const container = obj.container;
            container.remove();
            this.attachedImages.splice(index, 1);
        }

        if (this.attachedImages.length < 1) {
            if (this.thumbnailsEditing && this.thumbnailsEditing.length > 0) return;

            this.thumbnailsContainer.remove();
        }
    }
    removeAllAttached() {
        this.attachedImages = [];
        this.thumbnailsContainer.innerHTML = "";
        this.thumbnailsContainer.remove();
    }
}

class EditComment extends WriteComment {
    constructor(node) {
        super(node);
        this.onThumbsClick = this.onThumbsClick.bind(this);

        this.thumbnailsEditing = [];

        this.thumbnailsContainer.addEventListener("click", this.onThumbsClick);
    }
    onThumbsClick(event) {
        const targ = event.target;
        if (!targ.classList.contains("close")) return;

        const container = targ.closest(".comment__attached-image-container");
        if (!container) return;

        const index = this.thumbnailsEditing.findIndex(obj => obj.container === container);
        if (index < 0) return;

        const obj = this.thumbnailsEditing[index];
        obj.container.remove();
        this.thumbnailsEditing.splice(index, 1);
    }
    onSubmit(event) {
        event.preventDefault();
        this.rootElem.dispatchEvent(new CustomEvent("edit-submit"));
    }
    // вставить текст
    setInputValue(value) {
        if (!value || typeof value !== "string") return;

        value = value.trim();
        this.commentInput.value = value;
        this.commentInput.textContent = value;
    }
    // вставить превью уже загруженных изображений. Передаются либо контейнеры изображений, либо url'ы, на основе которых будут созданы изображения. Если передать пустой массив или false-значение, просто будет очищен массив this.thumbnailsEditing и убран html в thumbnailsContainer
    setImages(array = []) {
        if (!Array.isArray(array)) array = [];
        this.thumbnailsEditing = [];

        array.forEach(imgContainerOrSrc => {
            let data = {};
            if (typeof imgContainerOrSrc === "string") {
                const src = imgContainerOrSrc;
                const container = createElement("div", "comment__attached-image-background");
                const img = createElement("img", "", null, { src });
                container.append(
                    img,
                    createElement("div", "comment__attached-image-background"),
                    createElement("button", "close", null, { type: "button" })
                );
                data = { container, img }
            } else if (imgContainerOrSrc) {
                const container = imgContainerOrSrc;
                if (!container) return;

                const img = qs("img", container);
                data = { container, img };
            }
            this.thumbnailsEditing.push(data);
        });

        this.thumbnailsContainer.innerHTML = "";
        this.thumbnailsEditing.forEach(obj => this.thumbnailsContainer.append(obj.container));
        if (!this.thumbnailsContainer.closest("body"))
            this.commentInput.after(this.thumbnailsContainer);
    }
}

const formsSelectors = [
    { selector: ".text-input--standard", classInstance: TextInput },
    { selector: ".auth-code", classInstance: AuthCode },
    { selector: "form.login-form", classInstance: LoginForm },
    { selector: "form.signup-form", classInstance: SignupForm },
    { selector: "form.password-change-form", classInstance: PasswordChangeForm },
    { selector: "form.password-recovery-form", classInstance: PasswordRecoveryForm },
    { selector: "form.account-settings-form", classInstance: AccountSettingsForm },
    { selector: "form.user-shipment-address-settings", classInstance: UserShipmentAddressSettings },
    { selector: ".comments", classInstance: Comments },
    { selector: "form.comments__write", classInstance: WriteComment },
];
inittingSelectors = inittingSelectors.concat(formsSelectors);