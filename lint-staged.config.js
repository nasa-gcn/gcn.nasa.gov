module.exports = {
  '*.{js,jsx,md,mdx,ts,tsx}': 'eslint --cache --fix',
  '*.{ts,tsx}': () => 'tsc -p .',
  '*.{css,js,json,jsx,md,mdx,ts,tsx}': 'prettier --write',
}
