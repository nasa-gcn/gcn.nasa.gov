module.exports = {
  '*.{js,jsx,mdx,ts,tsx}': 'eslint --cache --fix --max-warnings 0',
  '*.{ts,tsx}': () => 'tsc -p .',
  '*.{css,js,json,jsx,md,mdx,ts,tsx}': 'prettier --write',
}
