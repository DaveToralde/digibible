export const uiMixin = {
    methods: {
        makeOtherRefEditable(hoverRef, ref) {
            this.frameText(ref, false)
            hoverRef.addEventListener('mouseover', () => {
                this.frameText(ref)
            })
            hoverRef.addEventListener('mouseout', () => {
                if (!this.isTextEditable(ref)) {
                    this.frameText(ref, false)
                }
            })
        },
        makeEditable(ref) {
            this.frameText(ref, false)
            ref.addEventListener('mouseover', () => {
                this.frameText(ref)
            })
            ref.addEventListener('mouseout', () => {
                if (!this.isTextEditable(ref)) {
                    this.frameText(ref, false)
                }
            })
        },
        setEditMode(targetRef, isEditMode) {
            if (isEditMode) {
                targetRef.focus(); // Optional: focus the element for immediate editing

                if (!this.isTextEditable(targetRef)) {
                    this.makeTextEditable(targetRef)
                }
            } else {
                this.frameText(targetRef, false)
                this.makeTextEditable(targetRef, false)
            }
        },
        isTextEditable(ref) {
            while (ref) {
                if (ref.contentEditable === "true") {
                    return true
                } else if (ref.contentEditable === "false") {
                    return false
                }
                ref = ref.parentElement
            }
            // Returns false if none of the parents explicitly set contentEditable to true
            return false;
        },
        makeTextEditable(ref, isEditable = true) {
            if (isEditable) {
                ref.setAttribute('contenteditable', 'true');

                // Wait for the next tick to ensure the content is editable and focused
                this.$nextTick(() => {
                    const range = document.createRange();
                    range.selectNodeContents(ref);

                    const selection = window.getSelection();
                    selection.removeAllRanges(); // Clear any existing selections
                    selection.addRange(range); // Select all text within the element
                });

                this.frameText(ref)
            } else {
                ref.setAttribute('contenteditable', 'false');
            }

        },
        frameText(elementRef, isEditable = true) {
            if (isEditable) {
                elementRef.style.cssText = `
                outline: 2px solid rgba(255, 255, 255, 0.7);
                outline-offset: 3px 6px;
                border-radius: 10px;
                background-color: rgba(0, 0, 0, 0.3);
                padding: 5px 10px;
                margin: clamp(0.1rem, 0.3vw + 0.6vh, 0.4rem) -10px;
              `
            } else {
                elementRef.style.cssText = ''
            }
        },
    }
}
