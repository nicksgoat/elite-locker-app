module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Add Reanimated plugin
      'react-native-reanimated/plugin',
    ],
  };
};
