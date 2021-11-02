class VariantSelects extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('change', this.onVariantChange);
    }

    onVariantChange() {
        this.updateOptions();
        this.updateMasterId();
        this.toggleAddButton();

        if(!this.currentVariant) return this.setUnavailable();

        this.updateMedia();
        this.updateUrl();
        this.updateVariantInput();
        this.renderProductInfo();
        

    }

    updateOptions() {
        this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
    }

    updateMasterId() {
        this.currentVariant = this.getVariantData().find(variant => !variant.options.map((option, index) => this.options[index] === option).includes(false));
    }

    updateMedia() {
        if(!this.currentVariant?.featured_media) return;
    }

    updateUrl() {
        window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`)
    }

    updateVariantInput() {
        const productForm = document.getElementById(`kendama-product-form-${this.dataset.section}`);
        console.log(this.dataset.section);
        const input = productForm.querySelector('input[name=id]');
        input.value = this.currentVariant.id;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(this.currentVariant);

    }

    renderProductInfo() {
        fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.section}`)
            .then((response) => response.text())
            .then((responseText) => {
                const id = `price-${this.dataset.section}`;
                const html = new DOMParser().parseFromString(responseText, 'text/html');
                const destination = document.getElementById(id);
                const source = html.getElementById(id);

                if(destination && source) destination.innerHTML = source.innerHTML;
                document.getElementById(id)?.classList.remove('visibility-hidden');
                this.toggleAddButton(window.variantStrings.soldOut, !this.currentVariant.available);
            })
    }

    toggleAddButton(text = '', disabled = true) {
        this.addButton = document.getElementById(`kendama-product-form-${this.dataset.section}`)?.querySelector('[name="add"');
        console.log(disabled);
        if(!this.addButton) return;

        if(disabled) {
            this.addButton.setAttribute('disabled', 'true');
            if (text) this.addButton.textContent = text;
        } else {
            this.addButton.removeAttribute('disabled');
            this.addButton.textContent = window.variantStrings.addToCart;
        }
    }

    setUnavailable() {
        if(!this.addButton) return;
        this.addButton.textContent = window.variantStrings.unavailable;
        document.getElementById(`price-${this.dataset.section}`)?.classList.add('visibility-hidden');

    }

    getVariantData() {
        this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
        return this.variantData;
    }
}

customElements.define('variant-selects', VariantSelects);