const fs = require('fs');
const path = require('path');

// Danh sách các symlink cần tạo
const links = [
  {
    source: path.resolve(__dirname, '../libs/map/basemap/docs'),
    target: path.resolve(__dirname, '../docs/pages/map/basemap'),
  },
  {
    source: path.resolve(__dirname, '../libs/map/core/docs'),
    target: path.resolve(__dirname, '../docs/pages/map/core'),
  },
  {
    source: path.resolve(__dirname, '../libs/map/measurement/docs'),
    target: path.resolve(__dirname, '../docs/pages/map/measurement'),
  },
  {
    source: path.resolve(__dirname, '../libs/map/print/docs'),
    target: path.resolve(__dirname, '../docs/pages/map/print'),
  },
  {
    source: path.resolve(__dirname, '../libs/map/dataset/docs'),
    target: path.resolve(__dirname, '../docs/pages/map/dataset'),
  },
  {
    source: path.resolve(__dirname, '../libs/map/legend/docs'),
    target: path.resolve(__dirname, '../docs/pages/map/legend'),
  },
  {
    source: path.resolve(__dirname, '../libs/map/draw/docs'),
    target: path.resolve(__dirname, '../docs/pages/map/draw'),
  },
  {
    source: path.resolve(__dirname, '../libs/draggable/docs'),
    target: path.resolve(__dirname, '../docs/pages/draggable'),
  },
  {
    source: path.resolve(__dirname, '../libs/share/shared/src'),
    target: path.resolve(__dirname, '../docs/pages/share/shared'),
  },
  {
    source: path.resolve(__dirname, '../libs/share/core/src'),
    target: path.resolve(__dirname, '../docs/pages/share/core'),
  },
  {
    source: path.resolve(__dirname, '../libs/share/file/src'),
    target: path.resolve(__dirname, '../docs/pages/share/file'),
  },
  // có thể thêm nhiều link ở đây
  // {
  //   source: path.resolve(__dirname, "../libs/map/layer"),
  //   target: path.resolve(__dirname, "../docs/pages/layer"),
  // },
];

links.forEach(({ source, target }) => {
  // Nếu thư mục target đã tồn tại thì bỏ qua
  if (!fs.existsSync(target)) {
    fs.symlinkSync(source, target, 'junction'); // "junction" để tương thích Windows
    console.log('Symlink created:', target, '->', source);
  } else {
    console.log('Symlink already exists:', target);
  }
});
