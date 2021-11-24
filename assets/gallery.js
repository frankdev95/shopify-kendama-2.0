(function() {
    const isAnimated = !!document.querySelector('[data-animation]');
    console.log('working');
    if(isAnimated) new AnimationHandler(document.querySelectorAll('[data-animation]'));
})()
