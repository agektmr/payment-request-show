class DemoController {
  constructor() {
    const addDisplayItemBtn = document.querySelector('.add-display-item');
    addDisplayItemBtn.addEventListener('click', () => this.addDisplayItem());

    const addShippingOptBtn = document.querySelector('.add-shipping-opt');
    addShippingOptBtn.addEventListener('click', () => this.addShippingOpt());
  }

  addDisplayItem() {
    const templateString = `<div class="mdl-grid mdl-grid--no-spacing">
      <div class="mdl-cell mdl-cell--6-col">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
          <input class="mdl-textfield__input" type="text" id="summary-text" value="">
          <label class="mdl-textfield__label" for="summary-text">Label</label>
        </div>
      </div>
      <div class="mdl-cell mdl-cell--4-col">
        <div class="mdl-textfield mdl-js-textfield  mdl-textfield--floating-label">
          <input class="mdl-textfield__input" type="text" pattern="-?[0-9]*(\.[0-9]+)?" id="summary-amount" value="">
          <label class="mdl-textfield__label" for="summary-amount">Amount</label>
          <span class="mdl-textfield__error">The value must be a number.</span>
        </div>
      </div>
      <div class="mdl-cell mdl-cell--2-col">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
          <input class="mdl-textfield__input" type="text" id="summary-currency" value="USD">
          <label class="mdl-textfield__label" for="summary-currency">Currency</label>
        </div>
      </div>
    </div>`;
    const documentHack = document.createElement('div');
    documentHack.innerHTML = templateString;

    const newDisplayItem = documentHack.firstChild;
    const itemsContainer = document.querySelector('.display-items-container');

    // TODO: Upgrade elements.
    // componentHandler.upgradeElement(newDisplayItem);

    itemsContainer.appendChild(newDisplayItem);
  }

  addShippingOpt() {
    console.log('TODO: Add Shipping Option.');
  }
}

window.addEventListener('load', function() {
  if ('PaymentRequest' in window) {
    // Enable the demo
    const demoContainer = document.querySelector('.demo-container');
    demoContainer.classList.remove('is-not-supported');
    new DemoController();
  } else {
    document.querySelector('.supported-warning').classList.remove('hide');
  }
});
