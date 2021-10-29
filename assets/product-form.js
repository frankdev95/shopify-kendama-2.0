class ProductForm extends HTMLElement {
    constructor() {
        super();

        this.form = this.querySelector('form');
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cartNotification = document.querySelector('cart-notification');
    
    }

    onSubmitHandler(e) {
        e.preventDefault();

        this.cartNotification.setActiveElement(document.activeElement);
        const submitButton = this.querySelector('[type="submit"]');
        submitButton.setAttribute('disabled', true);
        submitButton.classList.add('loading');

        const formFields = JSON.parse(serializeForm(this.form));
        const body = JSON.stringify({
            ...formFields,
            sections: this.cartNotification.getSectionsToRender().map((section) => section.id),
            sections_url: window.location.pathname
        });

        console.log(formFields);

        console.log(body);
        
        fetch(`${routes.cart_add_url}`, {...fetchConfig('javascript'), body})
            .then((response) => response.json())
            .then((parsedState) => {
                this.cartNotification.renderContents(parsedState);
            })
            .catch((e) => {
                console.error(e);
            })
            .finally(() => {
                submitButton.classList.remove('loading');
                submitButton.removeAttribute('disabled');
            })
    }
}

customElements.define('product-form', ProductForm);