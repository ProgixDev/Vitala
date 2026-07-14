// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
  {
    rules: {
      // The experimental React Compiler rules bundled with eslint-plugin-react-hooks v6
      // misfire on Reanimated shared-value mutation (`sv.value = ...`), the standard
      // FlatList `useRef(fn).current` handler idiom, and legitimate setState-in-effect
      // used for scroll/index sync. These are intentional RN patterns here.
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]);
