
# Dynamic Island Player

**Dynamic Island Player** 是一个嵌入式灵活灵动岛静态网页播放器，灵感来源于 iOS 的灵动岛设计风格。它提供了丰富的音乐播放功能，包括播放/暂停、上一首/下一首、播放列表管理以及搜索功能，支持响应式布局和触摸屏操作。



## 特性

- **灵动岛设计风格**：半透明背景、圆角矩形设计，支持收缩与展开动画。
- **播放功能全面**：支持播放/暂停、上一首/下一首、播放列表管理。
- **搜索功能**：快速检索歌曲。
- **触摸屏优化**：支持移动端手势操作，响应式设计适配各种屏幕尺寸。
- **进度条交互**：支持点击跳转和拖动操作。
- **播放动画**：专辑封面动态旋转，播放时旋转，暂停时停止。

## 使用方法

### 1. 引入项目文件

在您的 HTML 文件中引入以下内容：

#### 引入 CSS 和 JS 文件

```html
<!-- 播放器样式文件 -->
<link rel="stylesheet" href="./D-music/dynamic-island-player.css">
<!-- 播放器核心脚本 -->
<script src="./D-music/dynamic-island-player.js"></script>
```

#### 初始化播放器

```html
<script>
  // 初始化播放器实例
  const player = new DynamicIslandPlayer();

  // 加载播放列表
  player.loadPlaylist('./playlistData.json');
</script>
```

### 3. 播放器 HTML 结构

播放器会自动挂载到页面的 `<body>` 中，无需额外搭建 HTML 结构，初始化完成后即可使用。

### 4. 播放列表

播放器会从 JSON 文件加载播放列表，文件格式示例如下：

```json
{
  "playlist": [
    {
      "title": "歌曲名称",
      "artist": "艺术家名称",
      "cover": "封面图片URL",
      "url": "音频文件URL"
    },
    {
      "title": "另一首歌曲",
      "artist": "另一位艺术家",
      "cover": "封面图片URL",
      "url": "音频文件URL"
    }
  ]
}
```

将您的播放列表数据保存为 `playlistData.json` 文件，放置于根目录以供播放器加载。

## 文件结构

```
dynamic-island-player/
├── D-music/
│   ├── dynamic-island-player.css  # 播放器样式文件
│   ├── dynamic-island-player.js   # 播放器核心脚本
├── index.html                     # 示例页面
├── README.md                      # 项目说明文件
├── LICENSE                        # 开源协议
├── playlistData.json              # 播放列表数据 (示例文件)
```

## 技术栈

- **HTML**：页面结构
- **CSS**：灵动岛样式设计，响应式布局，交互动画
- **JavaScript**：播放器核心逻辑，事件绑定，动态 DOM 操作

## 适配

- **桌面端**：支持鼠标交互
- **移动端**：支持触摸交互，优化手势操作体验
- **响应式设计**：适配不同屏幕尺寸，包括平板和超小屏手机

## 开发与扩展

### 自定义功能

播放器提供开放的 API 接口，支持自定义功能扩展。例如，自定义 "下一首" 按钮的功能：

```javascript
player.onNext = () => {
  console.log('下一首按钮被点击');
};
```

### 错误处理

播放器提供了基础的错误处理机制，例如音频加载失败时会显示提示信息：

```javascript
this.audio.addEventListener('error', (e) => {
  console.error('音频播放错误:', e);
});
```

## 开源协议

本项目基于 [MIT License](./LICENSE) 开源，您可以自由使用和修改代码，但需要保留原始版权声明。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进本项目！😊

---

如果您在使用过程中有任何疑问，请联系 [跑路的duck(D工作室)]。

