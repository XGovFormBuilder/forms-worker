module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "20",
        },
      },
    ],
    [
      "@babel/preset-typescript",
      {
        allowDeclareFields: true,
      },
    ],
  ],
};
