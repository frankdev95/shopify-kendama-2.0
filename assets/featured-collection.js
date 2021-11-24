class FeaturedCollection extends HTMLElement {
    constructor() {
        super();
        this.scrollWrap = this.querySelector('.overflow-scroller');
        this.scrollWrap.scroll({
            left: 0,
            behavior: 'smooth'
        })
        this.arrowBtns = this.querySelectorAll('.btn');
        this.gridWidth = this.querySelector('.overflow-scroller__product').getBoundingClientRect().width;
        this.amountToMove = 1;
        this.moveAmount = this.gridWidth * this.amountToMove;

        this.arrowBtns.forEach(btn => btn.addEventListener('click', this.moveScroll.bind(this)));
    }

    moveScroll(event) {
        console.log(event);
        let currentScroll = this.scrollWrap.scrollLeft;

        this.scrollWrap.scroll({
            left: event.target.classList.contains('arrow--right') ? currentScroll += this.moveAmount : currentScroll -= this.moveAmount,
            behavior: 'smooth'
        })
    }

}

customElements.define('featured-collection', FeaturedCollection)