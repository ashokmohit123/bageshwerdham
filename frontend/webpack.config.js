const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      "path": require.resolve("path-browserify"), // path के लिए polyfill
       "zlib": require.resolve("browserify-zlib"), // zlib का polyfill
    },
  },
  // अन्य Webpack कॉन्फ़िगरेशन
};
