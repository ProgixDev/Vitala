// Preserve React Native's native fetch before @expo/metro-runtime (whatwg-fetch) overrides it.
// The polyfill can cause "Network request failed" on Android when hitting HTTPS from the device.
if (typeof global.fetch === "function") {
  global.__NATIVE_FETCH__ = global.fetch;
}
require("expo-router/entry");
