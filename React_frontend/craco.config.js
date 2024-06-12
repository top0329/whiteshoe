const webpack = require('webpack');
const CracoAlias = require('craco-alias');
const Dotenv = require('dotenv-webpack');

module.exports = {
  webpack: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      zlib: 'browserify-zlib',
      util: 'util',
      buffer: 'buffer',
      assert: 'assert',
      crypto: 'crypto-browserify',
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify',
      path: 'path-browserify',
      vm: 'vm-browserify',
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
      new Dotenv({
        path: './.env', // Path to .env file
        systemvars: true, // Load all system variables as well
      }),
    ],
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.resolve.fallback = {
        process: require.resolve('process/browser'),
        stream: require.resolve('stream-browserify'),
        zlib: require.resolve('browserify-zlib'),
        util: require.resolve('util'),
        buffer: require.resolve('buffer'),
        assert: require.resolve('assert'),
        crypto: require.resolve('crypto-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify'),
        path: require.resolve('path-browserify'),
        vm: require.resolve('vm-browserify'),
      };
      return webpackConfig;
    },
  },
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'jsconfig',
        baseUrl: './src',
        aliases: {
          '@components': './src/components',
          '@styles': './src/css',
        },
      },
    },
  ],
};
