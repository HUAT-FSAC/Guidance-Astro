export default {
  "*.{ts,tsx,astro}": [
    "eslint --fix",
    "prettier --write",
  ],
  "*.{css,md,json}": [
    "prettier --write",
  ],
};
