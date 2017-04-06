/* eslint-disable max-len */
const getDisplayItemTemplate = () => {
  const uniqueId = `display-item-${Date.now()}`;
  return `<div class="mdl-grid mdl-grid--no-spacing">
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
};

const getShippingOptionTemplate = () => {
  const uniqueId = `shipping-opt-${Date.now()}`;
  return `<div class="mdl-grid mdl-grid--no-spacing">
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
        <input type="checkbox" id="${uniqueId}-selected" class="mdl-checkbox__input">
        <span class="mdl-checkbox__label">Selected</span>
      </label>
    </div>
  </div>`;
};
/* eslint-enable max-len */

class DemoController {
  constructor() {
    this._shippingId = 0;

    const addDisplayItemBtn = document.querySelector('.add-display-item');
    addDisplayItemBtn.addEventListener('click', () => this.addDisplayItem());

    const addShippingOptBtn = document.querySelector('.add-shipping-opt');
    addShippingOptBtn.addEventListener('click', () => this.addShippingOpt());

    const buyNowBtn = document.querySelector('.buy-now-btn');
    buyNowBtn.addEventListener('click', () => this.buyNowClick());
  }

  addDisplayItem() {
    const templateString = getDisplayItemTemplate();
    const documentHack = document.createElement('div');
    documentHack.innerHTML = templateString;
    const newDisplayItem = documentHack.firstChild;

    const mdlElements = newDisplayItem.querySelectorAll(`.needs-mdl-upgrade`);
    mdlElements.forEach((mdlElement) => {
      window.componentHandler.upgradeElement(mdlElement);
    });

    const itemsContainer = document.querySelector('.display-items-container');
    itemsContainer.appendChild(newDisplayItem);
  }

  addShippingOpt() {
    this._shippingId++;
    const templateString = getShippingOptionTemplate();

    const documentHack = document.createElement('div');
    documentHack.innerHTML = templateString;
    const newDisplayItem = documentHack.firstChild;

    const mdlElements = newDisplayItem.querySelectorAll(`.needs-mdl-upgrade`);
    mdlElements.forEach((mdlElement) => {
      window.componentHandler.upgradeElement(mdlElement);
    });

    const itemsContainer = document.querySelector('.shipping-opts-container');
    itemsContainer.appendChild(newDisplayItem);
  }

  buyNowClick() {
    // Supported payment methods
    const supportedPaymentMethods = [];
    const basicCardCheckboxes = document.querySelectorAll(
      '.basic-card-payment-methods input[type=\'checkbox\']');
    basicCardCheckboxes.forEach((basicCardCheckbox) => {
      if (basicCardCheckbox.checked &&
        basicCardCheckbox.dataset.paymentmethod) {
        supportedPaymentMethods.push(basicCardCheckbox.dataset.paymentmethod);
      }
    });

    /**
    // Checkout details
    var di = [];
    $("#order_items").children('#display-item').each(function(idx) {
      var v = $(this).find("#value").val();
      if (v === undefined) return;
      di.push({
          label: $(this).find("#label").val(),
          amount: { currency: $(this).find("#currency").val(), value: v}});
    });
    var shipping_options = [];
    $("#shipping-options").children(".shipping-option").each(function(idx) {
      var option_id = $(this).find(".shipping-option-id").val();
      var option_label = $(this).find(".shipping-option-label").val();
      var option_amount = $(this).find(".shipping-option-amount").val();
      var option_selected = $(this).find("button").hasClass("button-primary");
      shipping_options.push({
        id: option_id,
        label: option_label,
        amount: {
          currency: $("#currency").val(), value: option_amount
        },
        selected: option_selected
      })
    });
    var details = {
      displayItems: di,
      shippingOptions: shipping_options,
      total: {
        label: $("#total_item").find("#label").val(),
        amount: { currency: $("#total_item").find("#currency").val(),
                  value : $("#total_item").find("#value").val() }
      }
    };
    var shipping_type = document.getElementById("shipping-type");
    var options = {
      shippingType: shipping_type.options[shipping_type.selectedIndex].value
    };
    $("#options .options-request button.button-primary").each(function(idx) {
      var option_text = $(this).text();
      if (option_text == "Name")
        options.requestPayerName = true;
      if (option_text == "Phone")
        options.requestPayerPhone = true;
      if (option_text == "Email")
        options.requestPayerEmail = true;
      if (option_text == "Shipping")
        options.requestShipping = true;
    });
    **/

    // Why is this an array of an object with supportedMethods?
    const supportedInstruments = [{
      supportedMethods: supportedPaymentMethods,
    }];
    const details = {
      // Excluding total will result in an error - it's a required field.
      total: {
        label: 'Example Total Label',
        amount: {
          // Setting an invalid currency will result in an error
          // must be ISO 4217
          currency: 'USD',
          value: '123',
        },
      },
    };
    const options = {};

    const paymentRequest = new PaymentRequest(
      supportedInstruments,
      details,
      options);
    paymentRequest.show()
    .then((result) => {
      // Process the payment
      const data = {};
      data.methodName = result.methodName;
      data.details = result.details;

      // $("#result").text(JSON.stringify(data, null, 2));
      return result.complete('success');
    })
    .catch((err) => {
      console.error('An error was thrown by paymentRequest.show().', err);
    });
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
