class ProductFiltersForm extends HTMLElement {
    constructor() {
        super();
        this.filterData = [];
        
        this.debouncedOnSubmit = debounce((event) => {
            this.onSubmitHandler(event);
        }, 500)
        this.querySelector('form').addEventListener('input', this.debouncedOnSubmit.bind(this));
    }

    onSubmitHandler(event) {
        event.preventDefault();
        const formData = new FormData(event.target.closest('form'));
        const formDataArray = [...formData];

        const productFilters = formDataArray.filter(filter => filter.some(element => element.includes('product'))).map(filterArr => filterArr[1]).join();
        const vendorFilters = formDataArray.filter(filter => filter.some(element => element.includes('vendor'))).map(filterArr => filterArr[1]).join();
        const availabilityFilters = formDataArray.filter(filter => filter.some(element => element.includes('availability'))).map(filterArr => filterArr.join("=")).join("&");

        const optionMaterialFilters = formDataArray.filter(filter => filter.some(element => element.includes('option.material'))).map(filterArr => filterArr[1]).join();
        const priceFilters = formDataArray.filter(filter => filter.some(element => element.includes('v.price'))).filter(filter => filter[1].length > 0).map(filterArr => [filterArr.join("=")]);
        const sortFilterURL = formDataArray.filter(filter => filter.some(element => element.includes('sort_by')))[0].join('=');

        const productURL = productFilters.length > 0 ? `filter.p.product_type=${productFilters}` : '';
        const vendorURL = vendorFilters.length > 0 ? `filter.p.vendor=${vendorFilters}` : '';
        const optionMaterialURL = optionMaterialFilters.length > 0 ? `filter.v.option.material=${optionMaterialFilters}` : '';

        let priceFilterURL = "";

        if(priceFilters.length > 0) {
            priceFilterURL = priceFilters.length > 1 ? priceFilters.join('&') : priceFilters[0].toString();
        }

        const parsedParams = [productURL, vendorURL, optionMaterialURL, priceFilterURL, sortFilterURL].filter(element => element.length > 0);
        if(availabilityFilters.length > 0) parsedParams.splice(0, 0, availabilityFilters);

        let searchParams = parsedParams;

        if(parsedParams.length > 0) searchParams = parsedParams.join("&");

        this.renderPage(searchParams, event);
    }

    onActiveFilterClick(e) {
        e.preventDefault();
        this.toggleActiveFacets();
        console.log(e.currentTarget.href);
        this.renderPage(new URL(e.currentTarget.href).searchParams.toString())
    }

    toggleActiveFacets(disabled = true) {
        document.querySelectorAll('.js-facet-remove').forEach(element => {
            element.classList.toggle('disabled', disable);
        })
    }

    renderPage(searchParams, event, updateURLHash = true) {
        const sections = this.getSections();

        document.getElementById('ProductGrid').querySelector('.collection-products').classList.add('loading');
        
        sections.forEach((section) => {
            const url = `${window.location.pathname}?section_id-${section.section}${searchParams && `&${searchParams}`}`;
            const filterDataUrl = element => element.url === url;

            this.filterData.some(filterDataUrl) ? this.renderSectionFromCache(filterDataUrl, event) : this.renderSectionFromFetch(url, event);
        });

        if (updateURLHash) this.updateURLHash(searchParams);
    }

    renderSectionFromFetch(url, event) {
        fetch(url)
            .then(response => response.text())
            .then(responseText => {
                const html = responseText;
                this.filterData = [...this.filterData, { html, url }];
                this.renderFilters(html, event);
                this.renderProductGrid(html);
            });
    }

    renderSectionFromCache(filterDataUrl, event) {
        const html = this.filterData.find(filterDataUrl).html;
        this.renderFilters(html, event);
        this.renderProductGrid(html);
    }

    renderProductGrid(html) {
        const innerHTML = new DOMParser()
            .parseFromString(html, 'text/html')
            .getElementById('ProductGrid').innerHTML;

        document.getElementById('ProductGrid').innerHTML = innerHTML;
    }

    renderFilters(html, event) {
        const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
        const filterDetailsElement = parsedHTML.querySelectorAll('#ProductFiltersForm .js-filter, #ProductFiltersFormMobile .js-filter');
        const matchesIndex = (element) => element.dataset.index === event?.target.closest('.js-filter')?.dataset.index
        
        const filtersToRender = Array.from(filterDetailsElement).filter(element => !matchesIndex(element)); // filters that aren't being selected
        const countsToRender = Array.from(filterDetailsElement).find(matchesIndex);
        filtersToRender.forEach((element) => {
           const jsFilter =  document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`);
           jsFilter.innerHTML = element.innerHTML;
        });

        this.renderActiveFacets(parsedHTML);
        this.renderAdditionalElements(countsToRender, parsedHTML);

        if(countsToRender) this.renderCounts(countsToRender, event.target.closest('.js-filter'));
    }

    renderActiveFacets(html) {
        const activeFacetElementsSelectors = ['active-filters-desktop', 'active-filters-mobile'];

        activeFacetElementsSelectors.forEach((selector) => {
            const activeFacetsElement = html.querySelector(selector);
            if(!activeFacetsElement) return;
            document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
        });

        this.toggleActiveFacets(false);
    }

    renderAdditionalElements(countsToRender, html) {
        const mobileElementSelectors = ['.mobile-filters__open', '.mobile-filters__count']

        mobileElementSelectors.forEach(selector => {
            document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
        });
        
        document.getElementById('ProductFiltersFormMobile').closest('menu-drawer').bindEvents(countsToRender);
    }

    renderCounts(source, target) {
        const countElementSelectors = ['.selection-count', '.filters__selected'];

        countElementSelectors.forEach(selector => {
            const targetElement = target.querySelector(selector);
            const sourceElement = source.querySelector(selector);
            
            if(sourceElement && targetElement) {
                targetElement.outerHTML = sourceElement.outerHTML;
            }
        });
    }


    updateURLHash(searchParams) {
        history.pushState({searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`)
    }

    getSections() {
        return [
            {
                id: "kendama-main-collection-product-grid",
                section: document.getElementById("kendama-main-collection-product-grid").dataset.id
            }
        ]
    }
}

class PriceRange extends HTMLElement {
    constructor() {
        super();
        this.querySelectorAll('input').forEach(input => input.addEventListener('change', this.onRangeChange.bind(this)));

        this.setMinAndMaxValues();
    }

    onRangeChange(event) {
        this.adjustToValidValues(event.currentTarget);
        this.setMinAndMaxValues();
    }

    setMinAndMaxValues() {
        const inputs = this.querySelectorAll('input');
        const minInput = inputs[0];
        const maxInput = inputs[1];
        if (maxInput.value) minInput.setAttribute('max', minInput.value);
        if (minInput.value) maxInput.setAttribute('min', maxInput.value);
        if (minInput.value == "") maxInput.setAttribute('min', maxInput.getAttribute('min', 0));
        if (maxInput.value == "") minInput.setAttribute('max', maxInput.getAttribute('max'));
    }

    adjustToValidValues(input) {
        const value = Number(input.value);
        const min = Number(input.getAttribute('min'));
        const max = Number(input.getAttribute('max'));

        if(value < min) input.value = min;
        if(value > max) input.value = max;
    }
}

class FacetRemove extends HTMLElement {
    constructor() {
        super();
        this.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            console.log("laksjd")
            const form = document.querySelector('product-filters-form');
            console.log(form);
            form.onActiveFilterClick(e);
        })

    }
}


customElements.define('facet-remove', FacetRemove);
customElements.define('product-filters-form', ProductFiltersForm);
customElements.define('price-range', PriceRange);