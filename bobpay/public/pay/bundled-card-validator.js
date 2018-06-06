(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * @fileoverview Browserified version of the braintree credit card validator
 * library (https://github.com/braintree/card-validator)
 */
let cardValidator = require('card-validator');
let paymentRequestClient;
let methodData;

function formatCardNumber(number) {
  var validationResult = cardValidator.number(number);

  var formattedNumber = number;
  if (validationResult.isPotentiallyValid && !!(validationResult.card.gaps)) {
    var numberWithoutGaps = number.replace(/ /g, "");
    var slices = [];
    var lastGap = 0;
    validationResult.card.gaps.forEach(gap => {
      if (gap <= numberWithoutGaps.length) {
        slices.push(numberWithoutGaps.substring(lastGap, gap));
        lastGap = gap;
      }
    });
    slices.push(numberWithoutGaps.substring(lastGap));

    formattedNumber = slices.join(" ");
  }

  return formattedNumber;
}

function readCardsFromLocalStorage() {
  var localCardsString = window.localStorage.getItem("local_cards");
  if (!!localCardsString) {
    return JSON.parse(localCardsString);
  }
  return [];
}

function addToInstrumentList(content, clickHandler) {
  var linkedContainer = document.createElement("a");
  linkedContainer.className = "list-group-item";
  linkedContainer.setAttribute("href", "#");
  linkedContainer.appendChild(content);
  linkedContainer.addEventListener("click", function() { clickHandler() });
  document.getElementById("payment-instrument-list").appendChild(linkedContainer);
}

function populatePaymentInstrumentsList() {
  // First, remove everything from the list. We won't bother with doing anything fancier.
  var listNode = document.getElementById("payment-instrument-list");
  while(listNode.lastChild) {
    listNode.removeChild(listNode.lastChild);
  }

  if (methodData.some(method => method["supportedMethods"].includes("https://bobpay.xyz/pay"))) {
    // This merchant supports bobpay, offer bobpay balance as an option
    var label = document.createElement("h4");
    label.innerHTML = "Pay with BobPay balance ($50.00)";
    addToInstrumentList(label, payWithBobPayBalance);
  }

  if (methodData.some(method => method["supportedMethods"].includes("basic-card"))) {
    // This merchant supports basic-card, add the local cards and the add card button

    var localCards = readCardsFromLocalStorage();
    localCards.forEach(card => {
      var validationResult = cardValidator.number(card.cardNumber);
      if (!!validationResult && validationResult.isValid) {
        var content = document.createElement("div");
        var cardIcon = document.createElement("i");
        switch (validationResult.card.type) {
          case "visa":
            cardIcon.className = "cc-icons fab fa-cc-visa";
            break;
          case "master-card":
            cardIcon.className = "cc-icons fab fa-cc-mastercard";
            break;
          case "american-express":
            cardIcon.className = "cc-icons fab fa-cc-amex";
            break;
          default:
            cardIcon.className = "cc-icons fa fa-credit-card";
            break;
        }
        var numberContainer = document.createElement("h4");
        numberContainer.className = "cc-numbers";
        numberContainer.innerHTML = "**** " + card.cardNumber.substring(card.cardNumber.length - 4);

        content.appendChild(cardIcon);
        content.appendChild(numberContainer);

        addToInstrumentList(
          content,
          function() {
            requestUnmaskCard(card);
          });
      }
    });

    var label = document.createElement("h4");
    label.innerHTML = "+ Add Card";
    addToInstrumentList(label, addCardClicked);
  }
}

function addCardClicked() {
  document.getElementById("full-name").value = "";
  document.getElementById("cc-number").value = "";
  document.getElementById("exp-date").value = "";
  document.getElementById("add-card-confirm-button").disabled = true;
  $("#add-card-modal").modal();
}

function confirmAddCardClicked(event) {
  var name = document.getElementById("full-name").value;
  var expDate = document.getElementById("exp-date").value;
  var expMonth = expDate.substring(5);
  var expYear = expDate.substring(0, 4);
  var number = document.getElementById("cc-number").value;

  var validationResult = cardValidator.number(number);
  var expDateValidation = cardValidator.expirationDate({ month: expMonth , year: expYear });

  addCardConfirmed(name, number, expMonth, expYear);
  $("#add-card-modal").modal("toggle");
}

function addCardConfirmed(name, number, expiryMonth, expiryYear) {
  var localCards = readCardsFromLocalStorage();
  localCards.push({
    cardNumber: number,
    cardholderName: name,
    expiryMonth: expiryMonth,
    expiryYear: expiryYear,
  });

  window.localStorage.setItem("local_cards", JSON.stringify(localCards));
  populatePaymentInstrumentsList();
}

function payWithBobPayBalance() {
  if(!paymentRequestClient) return;

  var paymentAppResponse = {
    methodName: "https://bobpay.xyz/pay",
    details: {
      bobpay_token_id: "ABCDEADBEEF",
      message: "Thanks for using BobPay!"
    }
  };

  paymentRequestClient.postMessage(paymentAppResponse);
  window.close();
}

function payWithCreditCard(card, cvc) {
  if(!paymentRequestClient) return;

  var paymentAppResponse = {
    methodName: "basic-card",
    details: {
      cardNumber: card.cardNumber,
      cardholderName: card.cardholderName,
      cardSecurityCode: cvc,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      billingAddress: null,
    }
  };

  paymentRequestClient.postMessage(paymentAppResponse);
  window.close();
}

function requestUnmaskCard(card) {
  document.getElementById("cvc-confirm-button").onclick = function() {
    var cvc = document.getElementById("cvc-confirm-field").value;
    payWithCreditCard(card, cvc);
  };

  $("#cvc-confirm-modal").modal();
}

navigator.serviceWorker.addEventListener('message', e => {
  paymentRequestClient = e.source;
  methodData = e.data["methodData"];
  document.getElementById('details').innerHTML = JSON.stringify(e.data, undefined, 2);

  populatePaymentInstrumentsList();
});
navigator.serviceWorker.controller.postMessage('payment_app_window_ready');

function cancel() {
  if(!paymentRequestClient) return;

  paymentRequestClient.postMessage("The payment request is cancelled by user");
  window.close();
}

function cardInfoUpdated(event) {
  var name = document.getElementById("full-name").value;
  var expDate = document.getElementById("exp-date").value;
  var number = document.getElementById("cc-number").value;

  var validationResult = cardValidator.number(number);
  var expDateValidation = cardValidator.expirationDate({ month: expDate.substring(5) , year: expDate.substring(0, 4) });

  var readyToSave = validationResult.isValid && expDateValidation.isValid && name.length > 0;
  document.getElementById("add-card-confirm-button").disabled = !readyToSave;

  var formattedNumber = formatCardNumber(number);
  if (number !== formattedNumber) {
    document.getElementById("cc-number").value = formattedNumber;
  }
}

document.getElementById("cc-number").addEventListener("input", cardInfoUpdated);
document.getElementById("full-name").addEventListener("input", cardInfoUpdated);
document.getElementById("exp-date").addEventListener("input", cardInfoUpdated);
document.getElementById("cancel").addEventListener("click", cancel);
document.getElementById("add-card-confirm-button").addEventListener("click", confirmAddCardClicked);


},{"card-validator":2}],2:[function(require,module,exports){
'use strict';

module.exports = {
  number: require('./src/card-number'),
  expirationDate: require('./src/expiration-date'),
  expirationMonth: require('./src/expiration-month'),
  expirationYear: require('./src/expiration-year'),
  cvv: require('./src/cvv'),
  postalCode: require('./src/postal-code'),
  creditCardType: require('credit-card-type')
};

},{"./src/card-number":3,"./src/cvv":4,"./src/expiration-date":5,"./src/expiration-month":6,"./src/expiration-year":7,"./src/postal-code":11,"credit-card-type":12}],3:[function(require,module,exports){
'use strict';

var luhn10 = require('./luhn-10');
var getCardTypes = require('credit-card-type');

function verification(card, isPotentiallyValid, isValid) {
  return {card: card, isPotentiallyValid: isPotentiallyValid, isValid: isValid};
}

function cardNumber(value) {
  var potentialTypes, cardType, isPotentiallyValid, isValid, i, maxLength;

  if (typeof value === 'number') {
    value = String(value);
  }

  if (typeof value !== 'string') { return verification(null, false, false); }

  value = value.replace(/\-|\s/g, '');

  if (!/^\d*$/.test(value)) { return verification(null, false, false); }

  potentialTypes = getCardTypes(value);

  if (potentialTypes.length === 0) {
    return verification(null, false, false);
  } else if (potentialTypes.length !== 1) {
    return verification(null, true, false);
  }

  cardType = potentialTypes[0];

  if (cardType.type === 'unionpay') {  // UnionPay is not Luhn 10 compliant
    isValid = true;
  } else {
    isValid = luhn10(value);
  }

  maxLength = Math.max.apply(null, cardType.lengths);

  for (i = 0; i < cardType.lengths.length; i++) {
    if (cardType.lengths[i] === value.length) {
      isPotentiallyValid = value.length !== maxLength || isValid;
      return verification(cardType, isPotentiallyValid, isValid);
    }
  }

  return verification(cardType, value.length < maxLength, false);
}

module.exports = cardNumber;

},{"./luhn-10":9,"credit-card-type":12}],4:[function(require,module,exports){
'use strict';

var DEFAULT_LENGTH = 3;

function includes(array, thing) {
  var i = 0;

  for (; i < array.length; i++) {
    if (thing === array[i]) { return true; }
  }

  return false;
}

function max(array) {
  var maximum = DEFAULT_LENGTH;
  var i = 0;

  for (; i < array.length; i++) {
    maximum = array[i] > maximum ? array[i] : maximum;
  }

  return maximum;
}

function verification(isValid, isPotentiallyValid) {
  return {isValid: isValid, isPotentiallyValid: isPotentiallyValid};
}

function cvv(value, maxLength) {
  maxLength = maxLength || DEFAULT_LENGTH;
  maxLength = maxLength instanceof Array ? maxLength : [maxLength];

  if (typeof value !== 'string') { return verification(false, false); }
  if (!/^\d*$/.test(value)) { return verification(false, false); }
  if (includes(maxLength, value.length)) { return verification(true, true); }
  if (value.length < Math.min.apply(null, maxLength)) { return verification(false, true); }
  if (value.length > max(maxLength)) { return verification(false, false); }

  return verification(true, true);
}

module.exports = cvv;

},{}],5:[function(require,module,exports){
'use strict';

var parseDate = require('./parse-date');
var expirationMonth = require('./expiration-month');
var expirationYear = require('./expiration-year');

function verification(isValid, isPotentiallyValid, month, year) {
  return {
    isValid: isValid,
    isPotentiallyValid: isPotentiallyValid,
    month: month,
    year: year
  };
}

function expirationDate(value, maxElapsedYear) {
  var date, monthValid, yearValid, isValidForThisYear;

  if (typeof value === 'string') {
    value = value.replace(/^(\d\d) (\d\d(\d\d)?)$/, '$1/$2');
    date = parseDate(value);
  } else if (value !== null && typeof value === 'object') {
    date = {
      month: String(value.month),
      year: String(value.year)
    };
  } else {
    return verification(false, false, null, null);
  }

  monthValid = expirationMonth(date.month);
  yearValid = expirationYear(date.year, maxElapsedYear);

  if (monthValid.isValid) {
    if (yearValid.isCurrentYear) {
      isValidForThisYear = monthValid.isValidForThisYear;
      return verification(isValidForThisYear, isValidForThisYear, date.month, date.year);
    }

    if (yearValid.isValid) {
      return verification(true, true, date.month, date.year);
    }
  }

  if (monthValid.isPotentiallyValid && yearValid.isPotentiallyValid) {
    return verification(false, true, null, null);
  }

  return verification(false, false, null, null);
}

module.exports = expirationDate;

},{"./expiration-month":6,"./expiration-year":7,"./parse-date":10}],6:[function(require,module,exports){
'use strict';

function verification(isValid, isPotentiallyValid, isValidForThisYear) {
  return {
    isValid: isValid,
    isPotentiallyValid: isPotentiallyValid,
    isValidForThisYear: isValidForThisYear || false
  };
}

function expirationMonth(value) {
  var month, result;
  var currentMonth = new Date().getMonth() + 1;

  if (typeof value !== 'string') {
    return verification(false, false);
  }
  if (value.replace(/\s/g, '') === '' || value === '0') {
    return verification(false, true);
  }
  if (!/^\d*$/.test(value)) {
    return verification(false, false);
  }

  month = parseInt(value, 10);

  if (isNaN(value)) {
    return verification(false, false);
  }

  result = month > 0 && month < 13;

  return verification(result, result, result && month >= currentMonth);
}

module.exports = expirationMonth;

},{}],7:[function(require,module,exports){
'use strict';

var DEFAULT_VALID_NUMBER_OF_YEARS_IN_THE_FUTURE = 19;

function verification(isValid, isPotentiallyValid, isCurrentYear) {
  return {
    isValid: isValid,
    isPotentiallyValid: isPotentiallyValid,
    isCurrentYear: isCurrentYear || false
  };
}

function expirationYear(value, maxElapsedYear) {
  var currentFirstTwo, currentYear, firstTwo, len, twoDigitYear, valid, isCurrentYear;

  maxElapsedYear = maxElapsedYear || DEFAULT_VALID_NUMBER_OF_YEARS_IN_THE_FUTURE;

  if (typeof value !== 'string') {
    return verification(false, false);
  }
  if (value.replace(/\s/g, '') === '') {
    return verification(false, true);
  }
  if (!/^\d*$/.test(value)) {
    return verification(false, false);
  }

  len = value.length;

  if (len < 2) {
    return verification(false, true);
  }

  currentYear = new Date().getFullYear();

  if (len === 3) {
    // 20x === 20x
    firstTwo = value.slice(0, 2);
    currentFirstTwo = String(currentYear).slice(0, 2);
    return verification(false, firstTwo === currentFirstTwo);
  }

  if (len > 4) {
    return verification(false, false);
  }

  value = parseInt(value, 10);
  twoDigitYear = Number(String(currentYear).substr(2, 2));

  if (len === 2) {
    isCurrentYear = twoDigitYear === value;
    valid = value >= twoDigitYear && value <= twoDigitYear + maxElapsedYear;
  } else if (len === 4) {
    isCurrentYear = currentYear === value;
    valid = value >= currentYear && value <= currentYear + maxElapsedYear;
  }

  return verification(valid, valid, isCurrentYear);
}

module.exports = expirationYear;

},{}],8:[function(require,module,exports){
'use strict';

// Polyfill taken from <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#Polyfill>.

module.exports = Array.isArray || function (arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
};

},{}],9:[function(require,module,exports){
/*
 * Luhn algorithm implementation in JavaScript
 * Copyright (c) 2009 Nicholas C. Zakas
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
'use strict';

function luhn10(identifier) {
  var sum = 0;
  var alt = false;
  var i = identifier.length - 1;
  var num;

  while (i >= 0) {
    num = parseInt(identifier.charAt(i), 10);

    if (alt) {
      num *= 2;
      if (num > 9) {
        num = (num % 10) + 1; // eslint-disable-line no-extra-parens
      }
    }

    alt = !alt;

    sum += num;

    i--;
  }

  return sum % 10 === 0;
}

module.exports = luhn10;

},{}],10:[function(require,module,exports){
'use strict';

var expirationYear = require('./expiration-year');
var isArray = require('./lib/is-array');

function parseDate(value) {
  var month, len, year, yearValid;

  if (/\//.test(value)) {
    value = value.split(/\s*\/\s*/g);
  } else if (/\s/.test(value)) {
    value = value.split(/ +/g);
  }

  if (isArray(value)) {
    return {
      month: value[0],
      year: value.slice(1).join()
    };
  }

  len = value[0] === '0' || value.length > 5 ? 2 : 1;

  if (value[0] === '1') {
    year = value.substr(1);
    yearValid = expirationYear(year);
    if (!yearValid.isPotentiallyValid) {
      len = 2;
    }
  }

  month = value.substr(0, len);

  return {
    month: month,
    year: value.substr(month.length)
  };
}

module.exports = parseDate;

},{"./expiration-year":7,"./lib/is-array":8}],11:[function(require,module,exports){
'use strict';

var DEFAULT_MIN_POSTAL_CODE_LENGTH = 3;

function verification(isValid, isPotentiallyValid) {
  return {isValid: isValid, isPotentiallyValid: isPotentiallyValid};
}

function postalCode(value, options) {
  var minLength;

  options = options || {};

  minLength = options.minLength || DEFAULT_MIN_POSTAL_CODE_LENGTH;

  if (typeof value !== 'string') {
    return verification(false, false);
  } else if (value.length < minLength) {
    return verification(false, true);
  }

  return verification(true, true);
}

module.exports = postalCode;

},{}],12:[function(require,module,exports){
'use strict';

var testOrder;
var types = {};
var customCards = {};
var VISA = 'visa';
var MASTERCARD = 'master-card';
var AMERICAN_EXPRESS = 'american-express';
var DINERS_CLUB = 'diners-club';
var DISCOVER = 'discover';
var JCB = 'jcb';
var UNIONPAY = 'unionpay';
var MAESTRO = 'maestro';
var CVV = 'CVV';
var CID = 'CID';
var CVC = 'CVC';
var CVN = 'CVN';
var ORIGINAL_TEST_ORDER = [
  VISA,
  MASTERCARD,
  AMERICAN_EXPRESS,
  DINERS_CLUB,
  DISCOVER,
  JCB,
  UNIONPAY,
  MAESTRO
];

function clone(originalObject) {
  var dupe;

  if (!originalObject) { return null; }

  dupe = JSON.parse(JSON.stringify(originalObject));
  delete dupe.prefixPattern;
  delete dupe.exactPattern;

  return dupe;
}

testOrder = clone(ORIGINAL_TEST_ORDER);

types[VISA] = {
  niceType: 'Visa',
  type: VISA,
  prefixPattern: /^4$/,
  exactPattern: /^4\d*$/,
  gaps: [4, 8, 12],
  lengths: [16, 18, 19],
  code: {
    name: CVV,
    size: 3
  }
};

types[MASTERCARD] = {
  niceType: 'Mastercard',
  type: MASTERCARD,
  prefixPattern: /^(5|5[1-5]|2|22|222|222[1-9]|2[3-6]|27|27[0-2]|2720)$/,
  exactPattern: /^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)\d*$/,
  gaps: [4, 8, 12],
  lengths: [16],
  code: {
    name: CVC,
    size: 3
  }
};

types[AMERICAN_EXPRESS] = {
  niceType: 'American Express',
  type: AMERICAN_EXPRESS,
  prefixPattern: /^(3|34|37)$/,
  exactPattern: /^3[47]\d*$/,
  isAmex: true,
  gaps: [4, 10],
  lengths: [15],
  code: {
    name: CID,
    size: 4
  }
};

types[DINERS_CLUB] = {
  niceType: 'Diners Club',
  type: DINERS_CLUB,
  prefixPattern: /^(3|3[0689]|30[0-5])$/,
  exactPattern: /^3(0[0-5]|[689])\d*$/,
  gaps: [4, 10],
  lengths: [14, 16, 19],
  code: {
    name: CVV,
    size: 3
  }
};

types[DISCOVER] = {
  niceType: 'Discover',
  type: DISCOVER,
  prefixPattern: /^(6|60|601|6011|65|64|64[4-9])$/,
  exactPattern: /^(6011|65|64[4-9])\d*$/,
  gaps: [4, 8, 12],
  lengths: [16, 19],
  code: {
    name: CID,
    size: 3
  }
};

types[JCB] = {
  niceType: 'JCB',
  type: JCB,
  prefixPattern: /^(2|21|213|2131|1|18|180|1800|3|35)$/,
  exactPattern: /^(2131|1800|35)\d*$/,
  gaps: [4, 8, 12],
  lengths: [16, 17, 18, 19],
  code: {
    name: CVV,
    size: 3
  }
};

types[UNIONPAY] = {
  niceType: 'UnionPay',
  type: UNIONPAY,
  prefixPattern: /^((6|62|62\d|(621(?!83|88|98|99))|622(?!06)|627[02,06,07]|628(?!0|1)|629[1,2])|622018)$/,
  exactPattern: /^(((620|(621(?!83|88|98|99))|622(?!06|018)|62[3-6]|627[02,06,07]|628(?!0|1)|629[1,2]))\d*|622018\d{12})$/,
  gaps: [4, 8, 12],
  lengths: [16, 17, 18, 19],
  code: {
    name: CVN,
    size: 3
  }
};

types[MAESTRO] = {
  niceType: 'Maestro',
  type: MAESTRO,
  prefixPattern: /^(5|5[06-9]|6\d*)$/,
  exactPattern: /^(5[06-9]|6[37])\d*$/,
  gaps: [4, 8, 12],
  lengths: [12, 13, 14, 15, 16, 17, 18, 19],
  code: {
    name: CVC,
    size: 3
  }
};

function findType(type) {
  return customCards[type] || types[type];
}

function creditCardType(cardNumber) {
  var type, value, i;
  var prefixResults = [];
  var exactResults = [];

  if (!(typeof cardNumber === 'string' || cardNumber instanceof String)) {
    return [];
  }

  for (i = 0; i < testOrder.length; i++) {
    type = testOrder[i];
    value = findType(type);

    if (cardNumber.length === 0) {
      prefixResults.push(clone(value));
      continue;
    }

    if (value.exactPattern.test(cardNumber)) {
      exactResults.push(clone(value));
    } else if (value.prefixPattern.test(cardNumber)) {
      prefixResults.push(clone(value));
    }
  }

  return exactResults.length ? exactResults : prefixResults;
}

creditCardType.getTypeInfo = function (type) {
  return clone(findType(type));
};

function getCardPosition(name, ignoreErrorForNotExisting) {
  var position = testOrder.indexOf(name);

  if (!ignoreErrorForNotExisting && position === -1) {
    throw new Error('"' + name + '" is not a supported card type.');
  }

  return position;
}

creditCardType.removeCard = function (name) {
  var position = getCardPosition(name);

  testOrder.splice(position, 1);
};

creditCardType.addCard = function (config) {
  var existingCardPosition = getCardPosition(config.type, true);

  customCards[config.type] = config;

  if (existingCardPosition === -1) {
    testOrder.push(config.type);
  }
};

creditCardType.changeOrder = function (name, position) {
  var currentPosition = getCardPosition(name);

  testOrder.splice(currentPosition, 1);
  testOrder.splice(position, 0, name);
};

creditCardType.resetModifications = function () {
  testOrder = clone(ORIGINAL_TEST_ORDER);
  customCards = {};
};

creditCardType.types = {
  VISA: VISA,
  MASTERCARD: MASTERCARD,
  AMERICAN_EXPRESS: AMERICAN_EXPRESS,
  DINERS_CLUB: DINERS_CLUB,
  DISCOVER: DISCOVER,
  JCB: JCB,
  UNIONPAY: UNIONPAY,
  MAESTRO: MAESTRO
};

module.exports = creditCardType;

},{}]},{},[1]);
