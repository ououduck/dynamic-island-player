# Dynamic Island Player

一个把 iOS **灵动岛（Dynamic Island）** 搬进浏览器的网页音乐播放器。纯 HTML / CSS / JavaScript，零依赖、零构建，粘贴两行代码即可挂载到任意页面。

> 播放时专辑封面像唱片一样旋转，收缩时收成一条真正的胶囊，展开、搜索、进度拖动全部保留 iOS 的弹性节奏。

## 特性

- **贴近官方的灵动岛材质**：纯黑「屏幕挖孔」色、内侧发丝高光、两端全圆的胶囊形态，形变使用 iOS 同款缓动曲线 `cubic-bezier(0.32, 0.72, 0, 1)`。
- **与官方一致的双层结构**：展开后第一行是封面 + 大字歌名（下方淡色歌手），第二行是居中的三个播放按钮，最底部一条发丝进度条，两端分别是已播放与剩余时长。
- **连续形变，不靠 `display:none`**：展开 / 收缩时封面、歌名、按钮行、波形、进度条按各自的宽高、透明度、位移分阶段收放，中间帧不跳变。
- **Live Activity 波形**：收缩态右侧的四根声波柱，播放时以不同节奏律动，暂停时静止成一组图标。
- **完整播放能力**：播放 / 暂停、上一首 / 下一首、进度点击与拖动、播放结束自动切歌、按歌名与歌手搜索。
- **移动端适配**：岛宽跟随视口，安全区避让，触摸时有效热区 ≥42px，输入框 16px 字号避免 iOS 聚焦时自动放大页面，触摸设备自动关闭 hover 残留。
- **可主题化**：28 个 CSS 变量控制结构尺寸、节奏与配色，无需改动样式文件。
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
.dynamic-island-player          固定于视口顶部居中，纵向两层
├── .search-box                 搜索面板，绝对定位于岛的下方
├── .island-head                第一行：封面 + 文字 + 搜索
│   ├── .cover-art
│   ├── .player-info > .song-title / .artist
│   ├── .live-activity > span   四根声波柱
│   └── .search-btn
├── .controls                   第二行：三个按钮居中
│   └── .prev / .play-pause / .next
├── .progress-container         贴底：轨道 + .progress-bar + .progress-handle
└── .time-display               与轨道同行，左右两端读数
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
| `cover` | 封面图片地址，建议正方形，显示为圆形唱片 |
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
  --di-width: 520px;            /* 展开态宽高 */
  --di-height: 170px;
  --di-width-collapsed: 280px;  /* 收缩态宽高，收缩态圆角恒为胶囊 */
  --di-height-collapsed: 38px;
  --di-top: 16px;               /* 距视口顶部（与刘海安全区取较大值） */
  --di-radius: 34px;            /* 展开态圆角 */
  --di-duration: 0.5s;          /* 形变时长 */
  --di-ease: cubic-bezier(0.32, 0.72, 0, 1);

  --di-cover: 54px;             /* 封面直径 */
  --di-controls-h: 42px;        /* 按钮行高度，收缩态归零 */
  --di-gap: 14px;               /* 第一行内部的横向间距（收缩态用 --di-gap-collapsed） */
  --di-row-gap: 14px;           /* 两行之间的纵向间距 */
  --di-inset: 20px;             /* 岛内左右留白 */
  --di-pad-top: 18px;
  --di-pad-bottom: 26px;        /* 底部留给进度条与读数的高度 */
  --di-bar-bottom: 13px;        /* 进度条距岛底 */
  --di-time-w: 46px;            /* 进度条两端为时间读数让出的宽度 */
  --di-progress-h: 3px;         /* 进度条粗细 */
  --di-eq-h: 16px;              /* 声波基准高度，四根柱子全部由它推导 */

  --di-bg: #000;                /* 岛体颜色 */
  --di-text: #fff;              /* 主标题（另有 --di-text-dim / --di-text-faint） */
  --di-track: rgba(255,255,255,.2); /* 进度轨道 */
  --di-fill: #fff;              /* 进度填充与声波 */
  --di-hairline: rgba(255,255,255,.08);
  --di-shadow: 0 14px 40px -16px rgba(0,0,0,.75);
}
```

改动 `--di-height` 时记得同步 `--di-pad-top / --di-row-gap / --di-cover / --di-controls-h / --di-pad-bottom`，这五项之和就是岛的总高。

响应式断点在 `768px / 420px / 320px` 覆盖同一批变量，窄屏会自动收窄岛宽、放大触摸热区。

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

Chrome / Edge / Safari / Firefox 的近两年版本。播放器本身只依赖 CSS 变量与 `env(safe-area-inset-*)`，示例页面另用 `:has()` 联动底部提示文案，不支持 IE。

- 系统开启「减弱动态效果」时，形变与旋转动画会自动关闭。
- 音频是否可播放取决于链接自身的跨域策略与防盗链设置。

## 开源协议

本项目基于 [MIT License](./LICENSE) 开源。
