'use strict';

let express = require('express');
let app = express();

// All of our paths have the Link header.
app.use(function(req, res, next) {
  res.status(200).links({
    'payment-method-manifest':
        'https://bobpay.xyz/pay/payment-manifest.json',
    });
    return next();
});
// We are mostly a static website.
app.use(express.static('public'));

/**
 * Starts the server.
 */
if (module === require.main) {
  let server = app.listen(process.env.PORT || 8080, function() {
    console.log('App listening on port %s', server.address().port);
  });
}

module.exports = app;
