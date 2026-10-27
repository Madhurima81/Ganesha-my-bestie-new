// The one place the offline code asks "is this a production build?" (the dev server has no live-assets.json and
// deletes service workers on localhost). A separate module so tests can replace it; `import.meta` cannot be parsed there.
export const isProd = () => import.meta.env.PROD;
