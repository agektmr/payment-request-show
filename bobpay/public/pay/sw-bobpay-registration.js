/**
 * Utilities for registering/unregistering the Payment App service worker.
 */

// Adds the BobPay default instrument.
function addInstruments(registration) {
  const instrumentPromises = [
  registration.paymentManager.instruments.set(
    "c8126178-3bba-4d09-8f00-0771bcfd3b11",
    {
      name: "My Bob Pay Account",
      icons: [{
        src:"/pay/bobpay.png",
        sizes:"32x32",
        type:"image/png"}
      ],
      enabledMethods: ["https://emerald-eon.appspot.com/bobpay"]
    }),
  ];

  return Promise.all(instrumentPromises);
};

// Registers the payment app service worker by installing the default
// instruments.
function registerPaymentAppServiceWorker() {
  navigator.serviceWorker.register('/pay/sw-bobpay.js').then(function(registration) {
    if(!registration.paymentManager) {
      return;
    }
    addInstruments(registration);
  }).catch(function(error) {
    alert("error: " + error);
  });
}
