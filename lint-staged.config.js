const ESLint = require('eslint').ESLint

// Adapted from https://github.com/okonet/lint-staged#how-can-i-ignore-files-from-eslintignore
async function removeIgnoredFiles(files) {
  const eslint = new ESLint()
  const isIgnored = await Promise.all(
    files.map((file) => {
      return eslint.isPathIgnored(file)
    })
  )
  const filteredFiles = files.filter((_, i) => !isIgnored[i])
  return filteredFiles.join(' ')
}

module.exports = {
  // Note, this rule should include *.mdx, but mdx linting is broken.
  // See https://github.com/mdx-js/eslint-mdx/issues/367.
  '*.{js,jsx,ts,tsx}': async (files) =>
    `eslint --cache --fix --max-warnings 0 ${await removeIgnoredFiles(files)}`,
  '*.{ts,tsx}': () => 'tsc -p .',
  '*.{css,js,json,jsx,md,mdx,ts,tsx}': async (files) =>
    `prettier --write ${await removeIgnoredFiles(files)}`,
}
