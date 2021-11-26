/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function(selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function(target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
};

Shopify.postLink = function(path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
  this.countryEl         = document.getElementById(country_domid);
  this.provinceEl        = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function() {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function() {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function(e) {
    var opt       = this.countryEl.options[this.countryEl.selectedIndex];
    var raw       = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function(selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};


function debounce (fn, delay) {
  let timeoutID;

  return (...args) => {
      if(timeoutID) clearTimeout(timeoutID);

      timeoutID = setTimeout(() => {
          fn(...args);
      }, delay)
  }
}

function throttle (fn , delay) {
  let last = 0;
  
  return function(...args) {
      const now = new Date().getTime(); 
      
      if(now - last < delay) { 
          return;
      }

      last = now; 

      fn(...args);
  }
}

function animationHandler (totalTime, fn) {
  let animationStart;
  
  return function handleAnimation(time) {
      if(!animationStart) animationStart = time; 

      const elapsedTime = time - animationStart;

      if(elapsedTime < totalTime) {
          requestAnimationFrame(handleAnimation);
      } else {
          fn();
      }
  }
}

const serializeForm = form => {
  const obj = {};
  const formData = new FormData(form);
  for (const key of formData.keys()) {
    obj[key] = formData.get(key);
  }

  return JSON.stringify(obj);
};

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
}


// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(":focus-visible");
} catch {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if(navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener('focus', () => {
    if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

    if (mouseClick) return;

    currentFocusedElement = document.activeElement;
    currentFocusedElement.classList.add('focused');

  }, true);
}


function removeTrapFocus(elementToFocus = null) {
    document.removeEventListener('focusin', trapFocusHandlers.focusin);
    document.removeEventListener('focusout', trapFocusHandlers.focusout);
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  
    if (elementToFocus) elementToFocus.focus();
  }

  function onKeyUpEscape(event) {
    if (event.code.toUpperCase() !== 'ESCAPE') return;
  
    const openDetailsElement = event.target.closest('details[open]');
    if (!openDetailsElement) return;
  
    const summaryElement = openDetailsElement.querySelector('summary');
    openDetailsElement.removeAttribute('open');
    summaryElement.setAttribute('aria-expanded', false);
    summaryElement.focus();
  }

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');
    const summaryElements = this.querySelectorAll('summary');
    this.addAccessibilityAttributes(summaryElements);

    if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    this.querySelectorAll('button').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }

  addAccessibilityAttributes(summaryElements) {
    summaryElements.forEach(element => {
      element.setAttribute('role', 'button');
      element.setAttribute('aria-expanded', false);
      element.setAttribute('aria-controls', element.nextElementSibling.id);
    });
  }

  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if(!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const isOpen = detailsElement.hasAttribute('open');

    if (detailsElement === this.mainDetailsToggle) {
      if(isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(summaryElement) : this.openMenuDrawer(summaryElement);
    } else {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));

      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
      });
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event !== undefined) {
      this.mainDetailsToggle.classList.remove('menu-opening');
      this.mainDetailsToggle.querySelectorAll('details').forEach(details =>  {
        details.removeAttribute('open');
        details.classList.remove('menu-opening');
      });
      this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', false);
      document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
      removeTrapFocus(elementToFocus);
      this.closeAnimation(this.mainDetailsToggle);
    }
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    detailsElement.classList.remove('menu-opening');
    removeTrapFocus();
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    }

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.getElementById('shopify-section-header');
    this.borderOffset = this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
    document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });

    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }
}

customElements.define('header-drawer', HeaderDrawer);

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('ul');
    this.sliderItems = this.slider.querySelectorAll('li');
    this.pageCount = this.querySelector('.slider-counter--current'); // get current slide - always starts at one
    this.pageTotal = this.querySelector('.slider-counter--total'); // get slide amount
    this.prevButton = this.querySelector('button[name="previous"]');
    this.nextButton = this.querySelector('button[name="next"]');
    if (!this.slider || !this.nextButton) return;

    const resizeObserver = new ResizeObserver(entries => this.initPages());
    resizeObserver.observe(this.slider);

    this.isAutomated = this.dataset.automated;
    this.automationSpeed = +this.dataset.slideSpeed * 1000;
    this.currentDirection = 'next';
    if(this.isAutomated === 'true') this.automationInterval = setInterval(this.automate.bind(this), this.automationSpeed);

    this.addListeners();
    
  }

  initPages() {
    if (!this.sliderItems.length === 0) return;
    this.slidesPerPage = Math.floor(this.slider.getBoundingClientRect().width / this.sliderItems[0].getBoundingClientRect().width);
    this.totalPages = this.sliderItems.length;

    if(this.slidesPerPage > 1) {
      const currentSlide = this.currentPage - this.slidesPerPage;
      this.slider.scrollLeft = parseFloat(this.sliderItems[0].getBoundingClientRect().width * currentSlide);
    }
    
    this.update();
  }

  addListeners() {
    this.slider.addEventListener('scroll', this.update.bind(this));
    this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
    this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
  }

  get currentPage() {
    return Math.round(this.slider.scrollLeft / this.sliderItems[0].getBoundingClientRect().width) + this.slidesPerPage; 
  }

  update() {
    this.currentPage === this.slidesPerPage ? this.prevButton.setAttribute('disabled', true) : this.prevButton.removeAttribute('disabled');
    this.currentPage === this.totalPages ? this.nextButton.setAttribute('disabled', true) : this.nextButton.removeAttribute('disabled');

    if (!this.pageCount || !this.pageTotal) return;

    this.pageCount.textContent = this.currentPage;
    this.pageTotal.textContent = this.totalPages;
  }

  onButtonClick(event) {
    event.preventDefault();

    if(this.isAutomated === 'true') {
      clearInterval(this.automationInterval);
      this.restartAutomationHandler()
    };

    this.moveSlide(event);
  }

  moveSlide(event, dir = null) {
    const direction = dir ? dir : event.currentTarget.name;
    const slideScrollPosition = direction === 'next' ? parseFloat(this.slider.scrollLeft + this.sliderItems[0].getBoundingClientRect().width) : parseFloat(this.slider.scrollLeft - this.sliderItems[0].getBoundingClientRect().width);
    this.slider.scrollTo({
      left: slideScrollPosition
    });
  }

  automate() {
    if(this.currentPage === this.slidesPerPage) this.currentDirection = 'next'
    if(this.currentPage === this.totalPages) this.currentDirection = 'previous';    
    this.moveSlide(null, this.currentDirection);
  }

  restartAutomationHandler = debounce(() => {
    this.automationInterval = setInterval(this.automate.bind(this), this.automationSpeed);
  }, 3000);
}

customElements.define('slider-component', SliderComponent);

class ProductBoxSlider extends SliderComponent {
  constructor() {
    super();
    this.thumbnailSlider = this.querySelector('ul.product-box__thumbnails');
    this.thumbnailSliderItems = this.thumbnailSlider.querySelectorAll('li');
    if(!this.thumbnailSlider) return;

    this.currentSlide = 0;
    this.thumbnailSliderItems[0].classList.add('active');

    const resizeObserver = new ResizeObserver(entires => this.initThumbnails());
    resizeObserver.observe(this.thumbnailSlider);
  }

  initThumbnails() {
    const sliderItemsToShow = Array.from(this.thumbnailSliderItems).filter(element => element.clientWidth > 0);
    this.thumbnailSliderLastItem = sliderItemsToShow[sliderItemsToShow.length - 1];
    if(sliderItemsToShow.length === 0) return;

    this.thumbnailsPerPage = Math.floor(this.thumbnailSlider.clientWidth / sliderItemsToShow[0].clientWidth);
  }

  moveSlide(event, dir = null) {
    const direction = dir ? dir : event.currentTarget.name;
    super.moveSlide(event, dir);

    this.moveThumbnailSlide(direction);
  }

  moveThumbnailSlide(direction) {;
    const slideScrollPosition = direction === 'next' ? parseFloat(this.thumbnailSlider.scrollLeft + this.thumbnailSliderItems[0].clientWidth) : parseFloat(this.thumbnailSlider.scrollLeft - this.thumbnailSliderItems[0].clientWidth);
    this.thumbnailSlider.scrollTo({
      left: slideScrollPosition
    });
    this.changeActiveClass(direction);
  }

  changeActiveClass(direction) {
    this.thumbnailSliderItems[this.currentSlide].classList.remove('active');
    this.currentSlide = direction === 'next' ? this.currentSlide + 1 : this.currentSlide - 1
    this.thumbnailSliderItems[this.currentSlide].classList.add('active');
  }

}

customElements.define('product-box-slider', ProductBoxSlider);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this)
    );
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) this.hide();
      });
    } else {
      this.addEventListener('click', (event) => {
        if (event.target.nodeName === 'MODAL-DIALOG') this.hide();
      });
    }
  }

  show(opener) {
    this.openedBy = opener;
    if(opener.hasAttribute('aria-expanded')) opener.setAttribute('aria-expanded', 'true');
    const popup = this.querySelector('.template-popup');
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    console.log(this);
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }

  hide() {
    if(this.openedBy.hasAttribute('aria-expanded')) this.openedBy.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('overflow-hidden');
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}

customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');
    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}

customElements.define('modal-opener', ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent() {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      this.appendChild(content.querySelector('video, model-viewer, iframe')).focus();
    }
  }
}

customElements.define('deferred-media', DeferredMedia);

class ImageSlideshow extends HTMLElement {
  constructor() {
      super();
      this.slider = this.querySelector('.image-slideshow__wrapper');
      this.sliderItems = this.querySelectorAll('.slide');
      this.sliderIndicators = this.querySelectorAll('.image-slideshow__indicator');
      this.prevButton = this.querySelector('.arrow[data-name="previous"]');
      this.nextButton = this.querySelector('.arrow[data-name="next');
      this.playButton = this.querySelector('.play-btn');
      this.pauseButton = this.querySelector('.pause-btn');

      if(this.sliderItems.length === 0) return;

      this.sliderItems[0].classList.add('show');

      if(!this.slider || !this.nextButton || !this.sliderItems.length > 1) return
      
      this.restartSlideShowHandler = debounce(() => {
          this.restartInterval = setTimeout(this.startSlideshow.bind(this), 3000);
      }, 3000)

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


  init() {
      this.currentSlide = 0;
      this.slideDirection = 1;

      this.sliderItems[this.currentSlide].setAttribute('aria-hidden', 'false');

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
      if(!this.isStopped) this.restartSlideshow();

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
      this.restartSlideShowHandler();
  }

  stopSlideShow() {
      this.isStopped = true;
      clearInterval(this.slideshowInterval);
  }

  startSlideshow() {
      this.slideshowInterval = setInterval(() => {
          this.handleSlideMovement(this.currentSlide + 1);
      }, 3000);
  }

}

customElements.define('image-slideshow', ImageSlideshow);

class AnimatedSection extends HTMLElement {
  constructor() {
    this.initObservers(document.querySelectorAll('*[data-animation]'));
    console.log("constructed");
  }

  initObservers(animatedElements) {
    this.intersectionObserver = new IntersectionObserver(this.intersectionHandler.bind(this), this.getObserverOptions());
    animatedElements.forEach(element => this.intersectionObserver.observe(element));
  }

  intersectionHandler(entries) {
      entries.forEach((entry) => {
        console.log(entry);
        if(!entry.isIntersecting) return;
        entry.target.classList.add(entry.target.dataset.animation);
        this.intersectionObserver.unobserve(entry.target);
      });
  }

  getObserverOptions = (threshold = 0.25, rootMargin = "0px", root = null) => ({
    root: root,
    rootMargin: rootMargin,
    threshold: threshold
  });
}


class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.updatePickupAvailability();
    this.removeErrorMessage();

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
    }
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;
    const newMedia = document.querySelector(
      `[data-media-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`
    );

    if (!newMedia) return;
    const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
    const newMediaModal = modalContent.querySelector( `[data-media-id="${this.currentVariant.featured_media.id}"]`);
    const parent = newMedia.parentElement;
    if (parent.firstChild == newMedia) return;
    modalContent.prepend(newMediaModal);
    parent.prepend(newMedia);
    this.stickyHeader = this.stickyHeader || document.querySelector('sticky-header');
    if(this.stickyHeader) {
      this.stickyHeader.dispatchEvent(new Event('preventHeaderReveal'));
    }
    window.setTimeout(() => {
      parent.scrollLeft = 0;
      parent.querySelector('li.product__media-item').scrollIntoView({behavior: 'smooth'});
    });
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateShareUrl() {
    const shareButton = document.getElementById(`Share-${this.dataset.section}`);
    if (!shareButton) return;
    shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
        const id = `price-${this.dataset.section}`;
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const destination = document.getElementById(id);
        const source = html.getElementById(id);

        if (source && destination) destination.innerHTML = source.innerHTML;

        const price = document.getElementById(`price-${this.dataset.section}`);

        if (price) price.classList.remove('visibility-hidden');
        this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');

    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(`product-form-${this.dataset.section}`);
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add('visibility-hidden');
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}

customElements.define('variant-selects', VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }
}

customElements.define('variant-radios', VariantRadios);

class ProductSlider extends HTMLElement {
  constructor() {
    super();
    this.imageCount = +this.dataset.imageCount;
    if(this.imageCount === 1) return;

    this.imageElements = this.querySelectorAll('.product-slide');
    this.progressBar = this.querySelector('.progress-bar');
    this.progressTracker = this.progressBar.firstElementChild;

    this.imageElements[0].classList.add('active');

    this.querySelector('.product-slider').addEventListener('mouseover', this.onHover.bind(this));
    this.querySelector('.product-slider').addEventListener('mouseleave', this.onLeave.bind(this));

  }

  onHover() {
    this.progressBar.style.backgroundColor = 'rgba(0, 0, 0, .2)';
    let startTime = performance.now();
    const interval = 1000;
    this.counter = 0;
    let startWidth = 0;

    const animationHandler = () => {
      const deltaTime = performance.now() - startTime;
      const accumalatedWidth = 100 / (this.imageCount * interval) * deltaTime;
      const totalWidth = startWidth + accumalatedWidth;
      this.progressTracker.style.width = `${totalWidth}%`;

      if(deltaTime > interval) {
        this.imageElements[this.counter].classList.remove('active');

        this.counter++;
        startWidth += Math.floor(accumalatedWidth);
        startTime = performance.now();
  
        if(this.counter === this.imageCount) {
          startWidth = 0;
          this.counter = 0;

          this.imageElements[0].classList.add('active');
        } else {
          this.imageElements[this.counter].classList.add('active');
        }
      };

      this.animationFrame = window.requestAnimationFrame(animationHandler);
    }

    this.animationFrame = window.requestAnimationFrame(animationHandler);
  }

  onLeave() {
    this.progressBar.style.backgroundColor = 'transparent';
    this.progressTracker.style.width = 0;

    if(this.counter !== 0) {
      this.imageElements[this.counter].classList.remove('active');
      this.imageElements[0].classList.add('active');
    }

    window.cancelAnimationFrame(this.animationFrame)
  }
}

customElements.define('product-slider', ProductSlider);