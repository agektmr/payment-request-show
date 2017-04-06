class DemoController {
  constructor() {
    this._shippingId = 0;

    const addDisplayItemBtn = document.querySelector('.add-display-item');
    addDisplayItemBtn.addEventListener('click', () => this.addDisplayItem());

    const addShippingOptBtn = document.querySelector('.add-shipping-opt');
    addShippingOptBtn.addEventListener('click', () => this.addShippingOpt());
  }

  addDisplayItem() {
    const uniqueId = `display-item-${Date.now()}`;
    const templateString = `<div class="mdl-grid mdl-grid--no-spacing">
      <div class="mdl-cell mdl-cell--6-col">
        <div class="needs-mdl-upgrade mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
          <input class="mdl-textfield__input" type="text" id="${uniqueId}-label" value="">
          <label class="mdl-textfield__label" for="${uniqueId}-label">Label</label>
        </div>
      </div>
      <div class="mdl-cell mdl-cell--4-col">
        <div class="needs-mdl-upgrade mdl-textfield mdl-js-textfield  mdl-textfield--floating-label">
          <input class="mdl-textfield__input" type="text" pattern="-?[0-9]*(\.[0-9]+)?" id="${uniqueId}-amount" value="">
          <label class="mdl-textfield__label" for="${uniqueId}-amount">Amount</label>
          <span class="mdl-textfield__error">The value must be a number.</span>
        </div>
      </div>
      <div class="mdl-cell mdl-cell--2-col">
        <div class="needs-mdl-upgrade mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
          <input class="mdl-textfield__input" type="text" id="${uniqueId}-currency" value="USD">
          <label class="mdl-textfield__label" for="${uniqueId}-currency">Currency</label>
        </div>
      </div>
    </div>`;
    const documentHack = document.createElement('div');
    documentHack.innerHTML = templateString;
    const newDisplayItem = documentHack.firstChild;

    const mdlElements = newDisplayItem.querySelectorAll(`.needs-mdl-upgrade`);
    mdlElements.forEach((mdlElement) => {
      componentHandler.upgradeElement(mdlElement);
    });

    const itemsContainer = document.querySelector('.display-items-container');
    itemsContainer.appendChild(newDisplayItem);
  }

  addShippingOpt() {
    this._shippingId++;
    const uniqueId = `shipping-opt-${Date.now()}`;

    const templateString = `<div class="mdl-grid mdl-grid--no-spacing">
    <div class="mdl-cell mdl-cell--2-col">
      <div class="needs-mdl-upgrade mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
        <input class="mdl-textfield__input" type="text" id="${uniqueId}-id" value="${this._shippingId}">
        <label class="mdl-textfield__label" for="${uniqueId}-id">ID</label>
      </div>
    </div>
      <div class="mdl-cell mdl-cell--5-col">
        <div class="needs-mdl-upgrade mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
          <input class="mdl-textfield__input" type="text" id="${uniqueId}-label" value="">
          <label class="mdl-textfield__label" for="${uniqueId}-label">Label</label>
        </div>
      </div>
      <div class="mdl-cell mdl-cell--3-col">
        <div class="needs-mdl-upgrade mdl-textfield mdl-js-textfield  mdl-textfield--floating-label">
          <input class="mdl-textfield__input" type="text" pattern="-?[0-9]*(\.[0-9]+)?" id="${uniqueId}-amount" value="">
          <label class="mdl-textfield__label" for="${uniqueId}-amount">Amount</label>
          <span class="mdl-textfield__error">The value must be a number.</span>
        </div>
      </div>
      <div class="mdl-cell mdl-cell--2-col center-selected">
        <label class="needs-mdl-upgrade mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="${uniqueId}-selected">
          <input type="checkbox" id="${uniqueId}-selected" class="mdl-checkbox__input" checked>
          <span class="mdl-checkbox__label">Selected</span>
        </label>
      </div>
    </div>`;
    const documentHack = document.createElement('div');
    documentHack.innerHTML = templateString;
    const newDisplayItem = documentHack.firstChild;

    const mdlElements = newDisplayItem.querySelectorAll(`.needs-mdl-upgrade`);
    mdlElements.forEach((mdlElement) => {
      componentHandler.upgradeElement(mdlElement);
    });

    const itemsContainer = document.querySelector('.shipping-opts-container');
    itemsContainer.appendChild(newDisplayItem);
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
