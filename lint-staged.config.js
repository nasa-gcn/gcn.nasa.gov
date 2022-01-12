module.exports = {
  '*.{js,jsx,md,mdx,ts,tsx}': [
    'eslint --cache --fix',
    () => 'tsc --noEmit -p .',
  ],
  '*.{css,js,json,jsx,md,mdx,ts,tsx}': 'prettier --write',
}
