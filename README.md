# payment-request-show

This repository contains the code for two websites:

* Payment Request API demo site (https://paymentrequest.show/) in the main
  directory and `app` subdirectory.
* Bobpay.xyz website (https://bobpay.xyz) in the `bobpay` subdirectory.

## Deployment

The apps can be deployed as node.js applications. In addition, `app.yaml`
and `bobpay/app.yaml` are included here for the purposes of deploying on
Google App Engine.

### App Engine deployment

Make sure the [Google Cloud SDK](https://cloud.google.com/sdk/install) is
installed.

After configuring your project, simply run the following command to deploy
or update the applications in their respective directories.

`gcloud app deploy --project <your-project>`

The application should now be serving at `<your-project>.appspot.com`.
