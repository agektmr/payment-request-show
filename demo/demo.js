class DemoController {
  constructor() {
    const addDisplayItemBtn = document.querySelector('.add-display-item');
    addDisplayItemBtn.addEventListener('click', () => this.addDisplayItem());

    const addShippingOptBtn = document.querySelector('.add-shipping-opt');
    addShippingOptBtn.addEventListener('click', () => this.addShippingOpt());
  }

  addDisplayItem() {
    console.log('TODO: Add Display Item.');
  }

  addShippingOpt() {
    console.log('TODO: Add Shipping Option.');
  }
}

window.addEventListener('load', function() {
  const demoContainer = document.querySelector('.demo-container');
  demoContainer.classList.remove('is-not-supported');
  if ('PaymentRequest' in window) {
    // Enable the demo
    // demoContainer.classList.remove('is-not-supported');
  } else {
    demoContainer.classList.remove('hide');
  }

  new DemoController();
});
