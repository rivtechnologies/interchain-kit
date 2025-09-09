const path = require('path');
const projectRoot = path.resolve(__dirname, '../../');
module.exports = {
  map: false,
  plugins: [
    require('postcss-import')({
      path: [path.resolve(projectRoot, 'node_modules')],
    }),
    // 可以添加其他 PostCSS 插件，如 autoprefixer 等
  ],
};
