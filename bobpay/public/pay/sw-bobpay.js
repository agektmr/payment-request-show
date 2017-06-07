self.addEventListener('paymentrequest', function(e) {
  let payment_app_window = undefined;
  let window_ready = false;
  //let payment_request_event = e;

  e.respondWith(new Promise(function(resolve, reject) {
    let maybeSendPaymentRequest = function() {
      if (payment_app_window && window_ready) {
        // Copy the relevant data from the paymentrequestevent to
        // send to the payment app confirmation page.
        // TODO(madmath): This doesn't work.
        // var paymentRequest = {
        //   'methodData': payment_request_event.methodData,
        //   'modifiers': payment_request_event.modifiers,
        //   'paymentRequestId': payment_request_event.paymentRequestId,
        //   'paymentRequestOrigin': payment_request_event.paymentRequestOrigin,
        //   'topLevelOrigin': payment_request_event.topLevelOrigin,
        //   'total': payment_request_event.total
        // };
        payment_app_window.postMessage(e.total);
      }
    };

    self.addEventListener('message', listener = function(e) {
      if (e.data == "payment_app_window_ready") {
        window_ready = true;
        maybeSendPaymentRequest();
        return;
      }

      self.removeEventListener('message', listener);
      if(e.data.methodName) {
        resolve(e.data);
      } else {
        reject(e.data);
      }
    });

    e.openWindow("https://bobpay.xyz/pay")
    .then(window_client => {
      payment_app_window = window_client;
      maybeSendPaymentRequest();
    })
    .catch(function(err) {
      reject(err);
    });
  }));
});
