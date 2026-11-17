// Jest cannot parse Vite's `import.meta.env`. Replace it with a plain object before babel-jest runs,
// so scene/game components that read it (dev-only logging) can be loaded in unit tests.
const babelJest = require('babel-jest').default;

const base = babelJest.createTransformer();
const VITE_ENV = '({ DEV: false, PROD: false, MODE: "test", BASE_URL: "/" })';
const swap = (src) => (src.includes('import.meta') ? src.replace(/import\.meta\.env/g, VITE_ENV) : src);

module.exports = {
  ...base,
  process(src, filename, options) { return base.process(swap(src), filename, options); },
  getCacheKey(src, filename, options) { return base.getCacheKey(swap(src), filename, options); },
};
