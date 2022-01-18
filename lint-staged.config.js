// Adapted from https://github.com/okonet/lint-staged#how-can-i-ignore-files-from-eslintignore
async function eslintRemoveIgnoredFiles(files) {
  const ESLint = require('eslint').ESLint
  const eslint = new ESLint()
  const isIgnored = await Promise.all(
    files.map((file) => {
      return eslint.isPathIgnored(file)
    })
  )
  const filteredFiles = files.filter((_, i) => !isIgnored[i])
  return filteredFiles.join(' ')
}

// Adapted from https://github.com/okonet/lint-staged#how-can-i-ignore-files-from-eslintignore
function prettierRemoveIgnoredFiles(files) {
  const getFileInfo = require('prettier').getFileInfo
  const filteredFiles = files.filter((file) => !getFileInfo(file).isIgnored)
  return filteredFiles.join(' ')
}

module.exports = {
  // Note, this rule should include *.mdx, but mdx linting is broken.
  // See https://github.com/mdx-js/eslint-mdx/issues/367.
  '*.{js,jsx,ts,tsx}': async (files) => {
    const filteredFiles = await eslintRemoveIgnoredFiles(files)
    if (!files) return []
    return `eslint --cache --fix --max-warnings 0 ${filteredFiles}`
  },
  '*.{ts,tsx}': () => 'tsc -p .',
  '*.{css,js,json,jsx,md,mdx,ts,tsx}': async (files) => {
    const filteredFiles = prettierRemoveIgnoredFiles(files)
    if (!files) return []
    return `prettier --write ${filteredFiles}`
  },
}
