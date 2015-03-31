module.exports = {
  entry: __dirname + "/app/public/js/main.js",
  output: {
    path: __dirname + "/app/public/js",
    filename: "bundle.js"
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: "jsx" },
      { test: /\.less$/, loader: "style!css!less" }
    ]
  }
};
