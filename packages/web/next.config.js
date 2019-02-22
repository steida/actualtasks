const path = require('path');
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer');
const withCustomBabelConfig = require('next-plugin-custom-babel-config');
const withTranspileModules = require('next-transpile-modules');
const withTypescript = require('@zeit/next-typescript');

const { BUNDLE_ANALYZE } = process.env;

module.exports = withCustomBabelConfig(
  withBundleAnalyzer(
    withTypescript(
      withTranspileModules({
        analyzeBrowser: ['browser', 'both'].includes(BUNDLE_ANALYZE),
        analyzeServer: ['server', 'both'].includes(BUNDLE_ANALYZE),
        babelConfigFile: path.resolve('babel.config.js'),
        bundleAnalyzerConfig: {
          browser: {
            analyzerMode: 'static',
            reportFilename: '../bundles/client.html',
          },
          server: {
            analyzerMode: 'static',
            reportFilename: '../../bundles/server.html',
          },
        },
        target: 'serverless',
        transpileModules: ['@app'],
      }),
    ),
  ),
);
