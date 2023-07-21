const autoprefixer = require('autoprefixer')
const csso = require('postcss-csso')

module.exports = {
  plugins: [
    autoprefixer({
      cascade: false,
      grid: true,
    }),
    csso({ forceMediaMerge: false }),
  ],
}
