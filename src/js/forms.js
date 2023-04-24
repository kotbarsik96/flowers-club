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
    }
    onChange(event) { }
    onInput(event) {
        this.maskParams.matchMask(event);
        if (this.params.numbersOnly !== "false") typeNumberOnly.call(this);

        function typeNumberOnly() {
            if (event.inputType) {
                if (event.inputType.match(/deletecontent/i)) return;
            }

            const exceptions = this.params.numbersOnly;
            const regexp = exceptions === "true"
                ? new RegExp(`\\D\\S`, "g")
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

class Form {
    constructor(node) {
        this.rootElem = node;

    }
}


const formsSelectors = [
    { selector: ".text-input--standard", classInstance: TextInput },
];
inittingSelectors = inittingSelectors.concat(formsSelectors);