class CartNotification extends HTMLElement {
    constructor() {
        super();

        this.notifcation = document.getElementById('cart-notification');
        console.log(this.notifcation);
        this.header = document.querySelector('header');
        this.onBodyClick = this.handleBodyClick.bind(this);

        this.notifcation.addEventListener('keyup', (e) => e.code === 'Escape' && this.close());
        this.querySelectorAll('button[type=button]').forEach(closeButton => closeButton.addEventListener('click', this.close.bind(this)));
    }

    open() {
        this.notifcation.classList.add('animate', 'active');

        this.notifcation.addEventListener('transitionend', () => {
            this.notifcation.focus();
            trapFocus(this.notifcation);
        }, { once: true })
        
        document.body.addEventListener('click', this.onBodyClick);
    }

    close() {
        this.notifcation.classList.remove('active');
        document.body.removeEventListener('click', this.onBodyClick);
        removeTrapFocus(this.activeElement);
    }

    renderContents(parsedState) {
        this.productdId = parsedState.id;

        this.getSectionsToRender().forEach(section => {
            console.log(parsedState.sections);
            document.getElementById(section.id).innerHTML =
                this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
        })

        this.open();
    }

    getSectionInnerHTML(html, selector = '.shopify-section') {
        return new DOMParser()
            .parseFromString(html, 'text/html')
            .querySelector(selector).innerHTML;
    }

    getSectionsToRender() {
        return [
            {
                id: 'cart-notification-product',
                selector: `#cart-notification-product-${this.productdId}`
            },
            {
                id: 'cart-notification-button'
            },
            {
                id: 'cart-icon-bubble'
            }
        ]
    }

    handleBodyClick(e) {
        const { target } = e;
        if(target !== this.notifcation && !target.closest('cart-notification')) {
            this.close();
        }
    }

    setActiveElement(element) {
        this.activeElement = element;
    }
}

customElements.define('cart-notification', CartNotification);