module.exports = function (api) {
  // Cache config per NODE_ENV so jest (test) and metro (development) get different plugin lists
  api.cache.using(() => process.env.NODE_ENV);
  const isTest = process.env.NODE_ENV === 'test';
  return {
    presets: [
      'babel-preset-expo',
      // NativeWind transforms className props at build/bundle time. Skip in Jest.
      ...(isTest ? [] : ['nativewind/babel']),
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
          },
        },
      ],
      // Must be last
      'react-native-reanimated/plugin',
    ],
  };
};
