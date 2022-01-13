module.exports = {
  // Note, this rule should include *.mdx, but mdx linting is broken.
  // See https://github.com/mdx-js/eslint-mdx/issues/367.
  '*.{js,jsx,ts,tsx}': 'eslint --cache --fix --max-warnings 0',
  '*.{ts,tsx}': () => 'tsc -p .',
  '*.{css,js,json,jsx,md,mdx,ts,tsx}': 'prettier --write',
}
