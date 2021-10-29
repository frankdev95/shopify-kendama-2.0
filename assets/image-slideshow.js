class ImageSlideshow extends HTMLElement {
    constructor() {
        super();
        this.slider = this.querySelector('.image-slideshow__wrapper');
        this.sliderItems = this.slider.querySelectorAll('.slide');
        this.sliderIndicators = this.querySelectorAll('.image-slideshow__indicator');
        this.prevButton = this.querySelector('.arrow[data-name="previous"]');
        this.nextButton = this.querySelector('.arrow[data-name="next');
        this.playButton = this.querySelector('.play-btn');
        this.pauseButton = this.querySelector('.pause-btn');

        const resizeObserver = new ResizeObserver(entries => this.controlElementHeight());
        resizeObserver.observe(this.slider);

        this.sliderItems[0].classList.add('show');

        if(!this.slider || !this.nextButton || !this.sliderItems.length > 1) return
        

        this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
        this.nextButton.addEventListener('click', this.onButtonClick.bind(this));

        this.sliderIndicators.forEach(indicator => indicator.addEventListener('click', this.onIndicatorClick.bind(this)));

        this.playButton.addEventListener('click', this.onPlayHandler.bind(this));
        this.pauseButton.addEventListener('click', this.onPauseHandler.bind(this));

        this.setAccessibility();
        this.init();
        
    }

    setAccessibility() {
        this.sliderItems.forEach(element => {
            element.setAttribute('aria-hidden', 'true');
        });
    }

    controlElementHeight() {
        const sliderHeight = window.innerWidth / 2 - (window.innerHeight / 10);
        this.slider.style.height = `${sliderHeight}px`;
    }

    init() {
        this.currentSlide = 0;
        this.slideDirection = 1;

        this.sliderItems[this.currentSlide].setAttribute('aria-hidden', 'false');

        this.stopSlideShow();
        this.startSlideshow();
    }

    moveSlide(slide = null) {
        this.changeActiveClasses(this.currentSlide, slide);
        this.currentSlide = slide;;
    }

    changeActiveClasses(currentSlide, nextSlide) {
        this.sliderIndicators[currentSlide].classList.remove('active');
        this.sliderItems[currentSlide].classList.remove('show');
        this.sliderItems[currentSlide].setAttribute('aria-hidden', 'true')

        this.sliderIndicators[nextSlide].classList.add('active');
        this.sliderItems[nextSlide].classList.add('show');
        this.sliderItems[nextSlide].setAttribute('aria-hidden', 'false');
    }

    onButtonClick(e) {
        this.restartSlideshow();

        const directionToMove = e.currentTarget.dataset.name === 'previous' ? -1 : 1;
        const nextSlide = this.currentSlide + directionToMove;
        
        this.handleSlideMovement(nextSlide);
    }

    onIndicatorClick(e) {
        this.restartSlideshow();

        const slideIndex = e.currentTarget.dataset.index;
        this.moveSlide(parseInt(slideIndex));
    }

    handleSlideMovement(nextSlide) {
        if (nextSlide === this.sliderItems.length) {
            this.moveSlide(0);
        } else if(nextSlide === -1) {
            this.moveSlide(this.sliderItems.length -1);
        } else {
            this.moveSlide(nextSlide);
        }
    }

    onPlayHandler() {
        this.startSlideshow();
        this.handleControlButtonVisibility();
    }

    onPauseHandler() {
        this.stopSlideShow();
        this.handleControlButtonVisibility();
    }

    handleControlButtonVisibility() {
        this.pauseButton.classList.toggle('hide');
        this.playButton.classList.toggle('hide');
    }

    restartSlideshow() {
        this.stopSlideShow();
        clearTimeout(this.restartInterval);
        this.restartInterval = setTimeout(this.startSlideshow.bind(this), 3000);
    }

    stopSlideShow() {
        clearInterval(this.slideshowInterval);
        this.slideshowInterval = null;
    }

    startSlideshow() {
        this.slideshowInterval = setInterval(() => {
            this.handleSlideMovement(this.currentSlide + 1);
        }, 3000);
    }

}

customElements.define('image-slideshow', ImageSlideshow);