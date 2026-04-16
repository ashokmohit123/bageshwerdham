// config-overrides.js
module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "path": require.resolve("path-browserify"),
    "zlib": require.resolve("browserify-zlib"),
    "util": require.resolve("util/"),
    "querystring": require.resolve("querystring-es3"),
    "assert": require.resolve("assert/"),
    "stream": require.resolve("stream-browserify"),
    "crypto": require.resolve("crypto-browserify"),
    "http": require.resolve("stream-http"),
    "vm": require.resolve("vm-browserify"),
    "fs": false,
    "net": false,
    "async_hooks": false
  };
  return config;
};
