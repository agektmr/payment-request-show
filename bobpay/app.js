'use strict';

let express = require('express');
let app = express();

/**
 * Payment app.
 */
app.head('/pay', function(req, res) {
  res.status(200).links({
    'payment-method-manifest':
        'https://rsolomakhin.github.io/bobpay/payment-manifest.json',
  }).end();
});

/**
 * Starts the server.
 */
if (module === require.main) {
  let server = app.listen(process.env.PORT || 8080, function() {
    console.log('App listening on port %s', server.address().port);
  });
}

module.exports = app;
