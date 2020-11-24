module.exports = {
  eslint: {
    enable: true,
    mode: "extends" || "file",
    configure: (eslintConfig) => { return eslintConfig; },
    loaderOptions: (eslintOptions) => { return eslintOptions; }
  },
  webpack: {
    configure: (webpackConfig) => { return webpackConfig; }
  }
};
