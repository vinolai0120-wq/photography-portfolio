# 无人介绍 / 摄影也如此

一个极简的摄影作品集静态网站，结构参考摄影师作品档案的阅读方式：项目索引 -> 系列详情 -> 大图灯箱。

## 本地预览

在项目目录运行：

```bash
python3 -m http.server 4173
```

然后打开 <http://localhost:4173>。

## 画廊墙模式

项目详情页使用暗色画廊墙：中央照片最大，两侧照片缩小并带有画框、透视和射灯光晕。支持左右键、页面按钮、点击侧边照片和手机左右滑动。点击中央照片可打开大图预览。

每张图片都可以单独控制两个比例，修改项目 HTML 中的参数：

```html
<button class="gallery-image" data-scale="1.04" data-art-size="82% auto" ...></button>
```

- `data-scale` 控制整件画框在墙上的大小，例如 `1.15` 放大 15%，`.9` 缩小 10%。
- `data-art-size` 控制卡纸内作品区大小，例如 `82% auto` 会像展览装裱一样保留更多白边，`100% 100%` 会铺满作品区。

照片比例差异较大时，优先调 `data-art-size`，需要整件作品更突出时再调 `data-scale`。


## 上传自己的照片

照片目录已经预留：

```text
images/
├── city-after-rain/
│   ├── 01.jpg
│   ├── 02.jpg
│   ├── 03.jpg
│   └── 04.jpg
├── along-the-way/
│   ├── 01.jpg
│   ├── 02.jpg
│   └── 03.jpg
└── quiet-corners/
    ├── 01.jpg
    ├── 02.jpg
    └── 03.jpg
```

把同名照片放入对应目录后，项目详情页的灯箱会自动读取本地照片。首页项目封面目前使用临时网络图片，后续可以把首页 CSS 中对应的 `background-image` 换成 `url('../images/...')`。

建议上传前把照片导出为 JPG，长边约 2400-3200px，单张控制在 2-5MB，网站会更快。

## 修改文字

- 首页项目名称、年份：编辑 `index.html`
- 关于页：编辑 `about.html`
- 系列说明和图片数量：编辑 `projects/` 下对应的 HTML
- 颜色、字体、间距：编辑 `css/style.css`
- 联系邮箱：编辑 `about.html` 中的 `mailto:` 地址

## 发布

当前版本是纯静态网站，可以部署到 GitHub Pages、Netlify 或 Cloudflare Pages。发布前需要一个 GitHub 账号或其他托管账号；本机当前还没有 GitHub CLI 登录状态。
