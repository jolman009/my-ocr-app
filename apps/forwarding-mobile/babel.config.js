module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            // Keep in sync with tsconfig.json paths. Lets us import shared
            // mobile infrastructure from Receipt Radar (apps/mobile/src/*)
            // without duplicating it. Same precedent as forwarding-api's
            // @receipt-radar/api/* alias into apps/api.
            "@receipt-radar/mobile": "../mobile/src"
          }
        }
      ]
    ]
  };
};
