'use strict';

let express = require('express');
let app = express();

// We are mostly a static website.
app.use(express.static('app'));

/**
 * Starts the server.
 */
if (module === require.main) {
  let server = app.listen(process.env.PORT || 8080, function() {
    console.log('App listening on port %s', server.address().port);
  });
}

module.exports = app;
