module.exports = {
  staticFileGlobs: [
    'app/**.html',
    'app/demo/**.*',
    'app/images/**.*',
    'app/styles/**.*',
  ],
  stripPrefix: 'app/',
  verbose: true,
  runtimeCaching: [{
    urlPattern: /.+/,
    handler: 'networkFirst'
  }]
};
