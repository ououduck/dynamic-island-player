# Dynamic Island Player

一个把 iOS **灵动岛（Dynamic Island）** 搬进浏览器的网页音乐播放器。纯 HTML / CSS / JavaScript，零依赖、零构建，粘贴两行代码即可挂载到任意页面。

> 展开态按官方的三段结构排布，收缩时收成一条真正的胶囊，展开、搜索、进度拖动全部保留 iOS 的弹性节奏。

## 特性

- **贴近官方的灵动岛材质**：纯黑「屏幕挖孔」色、内侧发丝高光、两端全圆的胶囊形态，形变使用 iOS 同款缓动曲线 `cubic-bezier(0.32, 0.72, 0, 1)`。
- **与官方一致的三段结构**：左上圆角方块封面，右侧大字歌名与淡色歌手；第二行是「已播放 · 发丝进度条 · 剩余时长」；第三行是居中的三个裸图标按钮。进度条在按钮**之上**，与 iOS Now Playing 的顺序一致。
- **连续形变，不靠 `display:none`**：展开 / 收缩时封面、文字、波形、进度行、按钮行按各自的宽高、透明度、位移分阶段收放，中间帧不跳变。
- **Live Activity 波形**：五根声波柱常驻岛的右上角，展开态与收缩态都在，播放时以不同节奏律动，暂停时静止成一组图标。
- **完整播放能力**：播放 / 暂停、上一首 / 下一首、进度点击与拖动、播放结束自动切歌、按歌名与歌手搜索。
- **移动端不铺满两端**：窄屏上岛横向内缩、纵向拉高（390px 视口下为 326×112），保持接近真机展开态的比例；同时紧贴视口顶边而不是浮成一张卡片。触摸时有效热区 ≥40px，输入框 16px 字号避免 iOS 聚焦时自动放大页面，触摸设备自动关闭 hover 残留。
- **可主题化**：30 个 CSS 变量控制结构尺寸、节奏与配色，无需改动样式文件。
- **零依赖**：不引入任何框架或字体文件，样式与脚本各一个文件。

## 快速开始

### 1. 引入文件

```html
<!-- <head> 内 -->
<link rel="stylesheet" href="./D-music/dynamic-island-player.css">

<!-- </body> 前 -->
<script src="./D-music/dynamic-island-player.js"></script>
```

### 2. 初始化

```html
<script>
  const player = new DynamicIslandPlayer();     // 默认挂载到 document.body
  player.loadPlaylist('./playlistData.json');   // 加载播放列表
</script>
```

播放器会自动创建 DOM 并固定在视口顶部居中，不需要任何额外的 HTML 结构。

生成的结构如下，覆盖样式时可直接引用这些类名：

```
.dynamic-island-player          固定于视口顶部居中，纵向三行
├── .search-box                 搜索面板，绝对定位于岛的下方
├── .island-head                第一行：封面 + 文字 + 波形 + 搜索
│   ├── .cover-art
│   ├── .player-info > .song-title / .artist
│   ├── .live-activity > span   五根声波柱
│   └── .search-btn
├── .progress-row               第二行：读数 + 轨道 + 读数
│   ├── .time-current
│   ├── .progress-container     轨道 + .progress-bar + .progress-handle
│   └── .time-remaining
└── .controls                   第三行：三个按钮居中
    └── .prev / .play-pause / .next
```

### 3. 准备播放列表

```json
{
  "playlist": [
    {
      "title": "歌曲名称",
      "artist": "艺术家名称",
      "cover": "https://example.com/cover.jpg",
      "url": "https://example.com/song.mp3"
    }
  ]
}
```

| 字段 | 说明 |
| --- | --- |
| `title` | 歌名，岛内主标题与搜索匹配字段 |
| `artist` | 歌手，展开态副标题与搜索匹配字段 |
| `cover` | 封面图片地址，建议正方形，显示为圆角方块 |
| `url` | 音频文件地址，需要浏览器可直接访问（跨域允许播放的直链） |

> **务必使用 `https`**：页面部署在 GitHub Pages 等 HTTPS 环境时，`http` 的封面与音频会被浏览器按混合内容拦截，表现为封面空白、点播放没反应。

## 交互说明

| 操作 | 结果 |
| --- | --- |
| 点击收缩态的岛 | 展开完整面板 |
| 点击岛外任意区域 | 收回胶囊 |
| 点击 / 拖动进度条 | 跳转播放进度（桌面端支持拖动，移动端支持触摸滑动） |
| 点击搜索图标 | 展开搜索面板，按歌名与歌手实时过滤，点击结果直接播放 |
| 播放结束 | 自动切换到下一首 |

## API

### 构造参数

```javascript
new DynamicIslandPlayer({ container: document.querySelector('#app') });
```

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `container` | `document.body` | 播放器挂载的父元素。注意容器不能设置 `overflow: hidden`，否则固定定位的岛会被裁剪 |

### 方法与属性

| 名称 | 说明 |
| --- | --- |
| `loadPlaylist(url)` | 拉取 JSON 播放列表，非空时自动装载第一首 |
| `loadSong(song)` | 装载并预加载单首歌曲（`title / artist / cover / url`） |
| `togglePlay()` | 播放或暂停 |
| `next()` / `prev()` | 下一首 / 上一首，并自动播放 |
| `toggleCollapse()` | 切换展开与收缩 |
| `updateProgress(percent)` | 设置进度条宽度（百分比） |
| `updateTimeDisplay()` | 刷新左侧已播放、右侧剩余时长 |
| `formatTime(seconds)` | 秒数格式化为 `MM:SS` |
| `filterPlaylist(keyword)` | 按关键词渲染搜索结果 |
| `player.playlist` | 当前播放列表数组 |
| `player.currentIndex` | 当前歌曲下标 |
| `player.audio` | 底层 `HTMLAudioElement`，可自行接音量、倍速等能力 |
| `player.isCollapsed` | 是否处于收缩态 |

### 自定义钩子

```javascript
player.onNext = () => {
  console.log('点击了下一首');   // 在切换歌曲之前触发
};
```

### 错误处理

音频与列表加载失败会写入控制台，并把岛内文案替换为「播放失败 / 加载失败 · 请检查音乐链接」，不会出现空白无反馈的状态。

## 主题定制

所有外观参数都是 `.dynamic-island-player` 上的 CSS 变量，在页面里覆盖即可，不需要改源文件：

```css
.dynamic-island-player {
  --di-width: 412px;            /* 展开态宽高 */
  --di-height: 134px;
  --di-width-collapsed: 210px;  /* 收缩态宽高，收缩态圆角恒为胶囊 */
  --di-height-collapsed: 36px;
  --di-top: 12px;               /* 距视口顶部；需要避让刘海时改这里 */
  --di-radius: 34px;            /* 展开态圆角；窄屏依次为 32 / 32 / 28 */
  --di-duration: 0.42s;         /* 形变时长 */
  --di-ease: cubic-bezier(0.32, 0.72, 0, 1);

  --di-cover: 46px;             /* 封面边长（圆角方块） */
  --di-cover-radius: calc(var(--di-cover) * .26); /* 封面圆角，默认随封面缩放 */
  --di-controls-h: 36px;        /* 按钮行高度，收缩态归零 */
  --di-progress-row: 12px;      /* 进度行高度，收缩态归零 */
  --di-btn-gap: 30px;           /* 三个按钮之间的间距 */
  --di-gap: 12px;               /* 第一行内部的横向间距（收缩态用 --di-gap-collapsed） */
  --di-row-gap: 6px;            /* 行与行之间的纵向间距 */
  --di-inset: 22px;             /* 岛内左右留白 */
  --di-pad-top: 14px;
  --di-pad-bottom: 14px;
  --di-time-w: 44px;            /* 进度行两端读数的最小宽度 */
  --di-progress-h: 3px;         /* 进度条粗细 */
  --di-eq-h: 15px;              /* 声波基准高度，五根柱子的宽度、间距与高度全部由它推导 */

  --di-bg: #000;                /* 岛体颜色 */
  --di-text: #fff;              /* 主标题（另有 --di-text-dim / --di-text-faint） */
  --di-track: rgba(255,255,255,.2); /* 进度轨道 */
  --di-fill: #fff;              /* 进度填充与声波 */
  --di-hairline: rgba(255,255,255,.08);
  --di-shadow: 0 14px 40px -16px rgba(0,0,0,.75);
}
```

展开态的总高由纵向变量推导：
`--di-pad-top + --di-cover + --di-row-gap + --di-progress-row + --di-row-gap + --di-controls-h + --di-pad-bottom = --di-height`。
改高度时同步这几项即可；收缩态靠 `--di-progress-row` 与 `--di-controls-h` 归零来收成一条胶囊，桌面默认 `210px` 宽、36px 高，只留封面 + 歌名 + 波形。

响应式断点在 `768px / 420px / 320px` 覆盖同一批变量。窄屏不让岛铺满两端：横向依次内缩到 `100vw - 56 / 64 / 40`，纵向拉高到 `117 / 112 / 102`，`--di-radius` 相应为 `32 / 32 / 28`，触摸热区则保持放大。

## 部署到 GitHub Pages

1. 仓库 `Settings → Pages → Build and deployment`，Source 选 `Deploy from a branch`，Branch 选 `main` + `/ (root)`。
2. 保存后等待构建完成，访问 Pages 给出的域名即可。
3. 播放列表与音频必须全部是 `https` 直链，否则会被混合内容策略拦截。

## 文件结构

```
dynamic-island-player/
├── D-music/
│   ├── dynamic-island-player.css   # 灵动岛样式与设计变量
│   └── dynamic-island-player.js    # 播放器逻辑（DynamicIslandPlayer 类）
├── index.html                      # 可直接打开的示例页面
├── playlistData.json               # 播放列表数据（示例）
├── README.md
└── LICENSE
```

## 浏览器支持

Chrome / Edge / Safari / Firefox 的近两年版本。播放器本身只依赖 CSS 变量，示例页面另用 `:has()` 联动底部提示文案，不支持 IE。

- 系统开启「减弱动态效果」时，形变与声波动画会自动关闭。
- 需要避让浏览器状态栏或刘海时，把 `--di-top` 调大，或用 `top: max(var(--di-top), env(safe-area-inset-top))` 自行覆盖。
- 音频是否可播放取决于链接自身的跨域策略与防盗链设置。

## 开源协议

本项目基于 [MIT License](./LICENSE) 开源。
