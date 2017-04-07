/* eslint-disable max-len */
const getDisplayItemTemplate = () => {
  const uniqueId = `display-item-${Date.now()}`;
  return `<div class="mdl-grid mdl-grid--no-spacing display-item-wrapper">
    <div class="mdl-cell mdl-cell--6-col">
      <div class="needs-mdl-upgrade mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
        <input class="mdl-textfield__input display-item-label" type="text" id="${uniqueId}-label" value="">
        <label class="mdl-textfield__label" for="${uniqueId}-label">Label</label>
      </div>
    </div>
    <div class="mdl-cell mdl-cell--4-col">
      <div class="needs-mdl-upgrade mdl-textfield mdl-js-textfield  mdl-textfield--floating-label">
        <input class="mdl-textfield__input display-item-amount" type="text" pattern="-?[0-9]*(\.[0-9]+)?" id="${uniqueId}-amount" value="">
        <label class="mdl-textfield__label" for="${uniqueId}-amount">Amount</label>
        <span class="mdl-textfield__error">The value must be a number.</span>
      </div>
    </div>
    <div class="mdl-cell mdl-cell--2-col">
      <div class="needs-mdl-upgrade mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
        <input class="mdl-textfield__input display-item-currency" type="text" id="${uniqueId}-currency" value="USD">
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

    const displayItemsFromUI = [];
    const displayItemElements =
      document.querySelectorAll('.display-item-wrapper');
    displayItemElements.forEach((displayItemElement) => {
      const labelValue =
        displayItemElement.querySelector('.display-item-label').value;
      const amountValue =
        displayItemElement.querySelector('.display-item-amount').value;
      const currencyValue =
        displayItemElement.querySelector('.display-item-currency').value;

      if (!labelValue || labelValue.length === 0 ||
        !amountValue || amountValue.length === 0) {
        console.warn('Found a display item without a label and / ' +
          'or amount value so excluding it from the results.');
        return;
      }

      displayItemsFromUI.push({
        label: labelValue,
        amount: {
          currency: currencyValue,
          value: amountValue,
        },
      });
    });

    const totalLabelValue =
      document.querySelector('.summary-label').value;
    const totalCurrencyValue =
      document.querySelector('.summary-currency').value;
    const totalAmountValue =
      document.querySelector('.summary-amount').value;

    const totalFromUI = {
      label: totalLabelValue,
      amount: {
        currency: totalCurrencyValue,
        value: totalAmountValue,
      },
    };

    /**
    // Checkout details
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
      shippingOptions: shipping_options,
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
    const options = {
      requestPayerName: false,
      requestPayerPhone: false,
      requestPayerEmail: false,
      requestShipping: false,
    };

    if (document.querySelector('#checkbox-buyer-name').checked) {
      options.requestPayerName = true;
    }

    if (document.querySelector('#checkbox-buyer-phone').checked) {
      options.requestPayerPhone = true;
    }

    if (document.querySelector('#checkbox-buyer-email').checked) {
      options.requestPayerEmail = true;
    }

    if (document.querySelector('#checkbox-shipping').checked) {
      options.requestShipping = true;
    }

    // Why is this an array of an object with supportedMethods?
    const supportedInstruments = [{
      supportedMethods: supportedPaymentMethods,
    }];
    const details = {
      displayItems: displayItemsFromUI,
      // Excluding total will result in an error - it's a required field.
      total: totalFromUI,
    };

    const paymentRequest = new PaymentRequest(
      supportedInstruments,
      details,
      options);

    paymentRequest.addEventListener(
      'shippingaddresschange', this.onShippingAddressChange);

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
      console.group(
        'The promise from `paymentRequest.show()` rejected.');
      console.warn('This is normally due to the user closing or cancelling ' +
        'the payment request UI.');
      console.warn(`The error message received was: '${err.message}'`);
      console.error(err);
      console.groupEnd();
    });
  }

  onShippingAddressChange(event) {
  // TODO: This needs a big rewrite to actuall be useful
  // or demonstrate a "relatively" normal use case.

  const paymentRequest = event.target;

  console.log(`New shipping address is: `, paymentRequest.shippingAddress);

  /** const newAddress = paymentRequest.shippingAddress;
  if (newAddress.country === 'US') {
    const shippingOption = {
      id: '',
      label: '',
      amount: {currency: 'USD', value: '0.00'},
      selected: true,
    };

    if (newAddress.region === 'US') {
      shippingOption.id = 'us';
      shippingOption.label = 'Standard shipping in US';
      shippingOption.amount.value = '0.00';
      details.total.amount.value = '55.00';
    } else {
      shippingOption.id = 'others';
      shippingOption.label = 'International shipping';
      shippingOption.amount.value = '10.00';
      details.total.amount.value = '65.00';
    }

    if (details.displayItems.length === 2) {
      details.displayItems.splice(1, 0, shippingOption);
    } else {
      details.displayItems.splice(1, 1, shippingOption);
    }

    details.shippingOptions = [shippingOption];
  } else {
    details.shippingOptions = [];
  }**/


  // This leads to a bug.
  const promise = Promise.resolve({
    total: {
      label: 'Haro',
      amount: {
        currency: 'GBP',
        value: '1',
      },
    },
    shippingOptions: [{
      id: 'us',
      label: 'shipping label',
      selected: true,
      amount: {
        currency: 'USD',
        value: '0.00',
      },
    }],
  });

  event.updateWith(promise);
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
