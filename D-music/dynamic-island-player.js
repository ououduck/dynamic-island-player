/**
 * 灵动岛音乐播放器类
 * 功能：提供音乐播放、播放列表管理、搜索等功能
 * 特性：支持展开/收缩动画，支持触摸屏操作
 */
class DynamicIslandPlayer {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   * @param {HTMLElement} options.container - 播放器挂载的容器元素
   */
  constructor(options = {}) {
    this.container = document.createElement('div');
    this.container.className = 'dynamic-island-player';
    this.audio = new Audio();
    this.isCollapsed = false;
    this.clickHandler = this.handleGlobalClick.bind(this);
    this.playlist = [];
    this.currentIndex = Math.floor(Math.random() * 100000); // 初始化一个较大的随机数
    this.dragStartTime = 0;
    this.dragStartPosition = 0;
    this.init(options);

    // 防止播放器被选中
    this.container.addEventListener('selectstart', e => e.preventDefault());
    this.container.addEventListener('contextmenu', e => e.preventDefault());
  }

  /**
   * 初始化播放器
   * @param {Object} options - 配置选项
   * @param {HTMLElement} options.container - 播放器挂载的容器元素
   */
  init(options) {
    const { container = document.body } = options;
    
    this.container.innerHTML = `
      <div class="search-box">
        <input type="text" class="search-input" placeholder="搜索歌曲、歌手…">
        <div class="search-results"></div>
      </div>
      <div class="island-head">
        <img class="cover-art" src="" alt="封面">
        <div class="player-info">
          <p class="song-title">未播放</p>
          <p class="artist">未知歌手</p>
        </div>
        <div class="live-activity" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <button class="control-btn search-btn" type="button" aria-label="搜索歌曲" title="搜索">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true">
            <circle cx="10.6" cy="10.6" r="6.4"/>
            <path d="M15.4 15.4 20 20"/>
          </svg>
        </button>
      </div>
      <div class="progress-row" aria-hidden="true">
        <span class="time-current">00:00</span>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-handle"></div>
          </div>
        </div>
        <span class="time-remaining">--:--</span>
      </div>
      <div class="controls">
        <button class="control-btn prev" type="button" aria-label="上一首" title="上一首">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M11.6 12 20 6.6v10.8z"/>
            <path d="M4 12 12.4 6.6v10.8z"/>
          </svg>
        </button>
        <button class="control-btn play-pause" type="button" aria-label="播放/暂停" title="播放 / 暂停">
          <svg viewBox="0 0 24 24" fill="currentColor" class="play-icon">
            <path d="M8.4 5.3v13.4c0 .9.9 1.4 1.6.9l10.4-6.7c.7-.4.7-1.4 0-1.8L10 4.4c-.7-.5-1.6 0-1.6.9z"/>
          </svg>
          <svg viewBox="0 0 24 24" fill="currentColor" class="pause-icon" style="display:none">
            <rect x="6.6" y="4.8" width="3.6" height="14.4" rx="1.8"/>
            <rect x="13.8" y="4.8" width="3.6" height="14.4" rx="1.8"/>
          </svg>
        </button>
        <button class="control-btn next" type="button" aria-label="下一首" title="下一首">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.4 12 4 6.6v10.8z"/>
            <path d="M20 12 11.6 6.6v10.8z"/>
          </svg>
        </button>
      </div>
    `;

    this.container.style.outline = 'none';
    this.container.setAttribute('tabindex', '-1');

    container.appendChild(this.container);
    this.bindEvents();

    // 添加全局点击事件监听
    document.addEventListener('click', this.clickHandler);

    // 移除原有的双击事件监听
    this.container.removeEventListener('dblclick', () => this.toggleCollapse());
  }

  /**
   * 处理全局点击事件
   * 功能：控制播放器的展开/收缩状态
   * @param {Event} event - 点击事件对象
   */
  handleGlobalClick(event) {
    // 如果点击的是播放器内部元素
    if (this.container.contains(event.target)) {
      // 如果播放器当前是收缩状态,则展开
      if (this.isCollapsed) {
        this.toggleCollapse();
      }
      return;
    }
    
    // 如果点击的是播放器外部且播放器是展开状态,则收缩
    if (!this.isCollapsed) {
      this.toggleCollapse();
    }
  }

  /**
   * 绑定事件监听器
   * 功能：为播放器各个控件绑定事件处理函数
   */
  bindEvents() {
    const playBtn = this.container.querySelector('.play-pause');
    const nextBtn = this.container.querySelector('.next');
    const prevBtn = this.container.querySelector('.prev');
    const searchBtn = this.container.querySelector('.search-btn');
    const searchBox = this.container.querySelector('.search-box');
    const searchInput = this.container.querySelector('.search-input');
    const searchResults = this.container.querySelector('.search-results');
    
    playBtn.addEventListener('click', () => this.togglePlay());
    nextBtn.addEventListener('click', () => this.next());
    prevBtn.addEventListener('click', () => this.prev());
    
    this.audio.addEventListener('play', () => {
      const playIcon = this.container.querySelector('.play-icon');
      const pauseIcon = this.container.querySelector('.pause-icon');
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
      this.container.querySelector('.cover-art').classList.add('playing');
      // 容器级状态：供 CSS 驱动波形律动等整体视觉
      this.container.classList.add('playing');
    });
    
    this.audio.addEventListener('pause', () => {
      const playIcon = this.container.querySelector('.play-icon');
      const pauseIcon = this.container.querySelector('.pause-icon');
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      this.container.querySelector('.cover-art').classList.remove('playing');
      this.container.classList.remove('playing');
    });

    // 移除双击相关的触摸事件代码
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;

    this.container.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY; 
    });

    this.container.addEventListener('touchend', (e) => {
      const deltaTime = Date.now() - touchStartTime;
      const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartX);
      const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY);
      
      // 如果是有效的点击
      if (deltaTime < 300 && deltaX < 10 && deltaY < 10) {
        if (this.isCollapsed) {
          this.toggleCollapse();
        }
      }
    });

    // 修复进度条拖动问题
    const progressContainer = this.container.querySelector('.progress-container');
    let isDragging = false;

    const startDragging = (e) => {
      isDragging = true;
      this.dragStartTime = this.audio.currentTime;
      this.dragStartPosition = e.clientX;
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', stopDragging);
    };

    const onDrag = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const rect = progressContainer.getBoundingClientRect();
      const position = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.audio.currentTime = this.audio.duration * position;
      this.updateProgress(position * 100);
    };

    const stopDragging = () => {
      if (!isDragging) return;
      isDragging = false;
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDragging);
    };

    progressContainer.addEventListener('mousedown', startDragging);
    progressContainer.addEventListener('click', (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const width = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
      const percent = width / rect.width;
      this.audio.currentTime = this.audio.duration * percent;
      this.updateProgress(percent * 100);
    });

    // 优化进度条更新
    this.audio.addEventListener('timeupdate', () => {
      if (!isDragging) {
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        this.updateProgress(progress);
        this.updateTimeDisplay();
      }
    });

    // 添加音频错误处理
    this.audio.addEventListener('error', (e) => {
      console.error('音频播放错误:', e);
      this.container.querySelector('.song-title').textContent = '播放失败';
      this.container.querySelector('.artist').textContent = '请检查音乐链接';
    });

    // 添加音频结束自动下一首
    this.audio.addEventListener('ended', () => {
      this.next();
    });

    // 添加移动端进度条控制
    let initialProgress = 0;

    progressContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      initialProgress = this.audio.currentTime / this.audio.duration;
      e.preventDefault();
    });

    progressContainer.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const rect = progressContainer.getBoundingClientRect();
      const relativeX = touch.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, relativeX / rect.width));
      
      this.audio.currentTime = this.audio.duration * percent;
      this.updateProgress(percent * 100);
      e.preventDefault();
    });

    // 优化搜索功能绑定
    searchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      searchBox.classList.toggle('show');
      if (searchBox.classList.contains('show')) {
        searchInput.focus();
        searchInput.value = '';
      }
    });

    searchInput.addEventListener('input', (e) => {
      const keyword = e.target.value.trim();
      this.filterPlaylist(keyword);
    });

    searchInput.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // 添加搜索结果点击事件
    searchResults.addEventListener('click', (e) => {
      const resultItem = e.target.closest('.search-result-item');
      if (resultItem) {
        const index = parseInt(resultItem.dataset.index);
        if (!isNaN(index)) {
          this.currentIndex = index;
          this.loadSong(this.playlist[index]);
          this.audio.play().catch(console.error);
          // 隐藏搜索框和结果
          searchBox.classList.remove('show');
          searchResults.classList.remove('show');
        }
      }
    });

    // 点击外部关闭搜索框和搜索结果
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        searchBox.classList.remove('show');
        searchResults.classList.remove('show');
        searchInput.value = '';
      }
    });
  }

  /**
   * 加载播放列表
   * @param {string} url - 播放列表的JSON文件URL
   * @returns {Promise<void>}
   */
  async loadPlaylist(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      this.playlist = data.playlist || [];
      if (this.playlist.length > 0) {
        this.currentIndex = this.currentIndex % this.playlist.length; // 使用取模运算确保索引有效
        await this.loadSong(this.playlist[this.currentIndex]);
      }
    } catch (error) {
      console.error('加载播放列表失败:', error);
    }
  }

  /**
   * 加载并播放指定歌曲
   * @param {Object} song - 歌曲对象
   * @param {string} song.title - 歌曲标题
   * @param {string} song.artist - 艺术家
   * @param {string} song.cover - 封面图片URL
   * @param {string} song.url - 音频文件URL
   * @returns {Promise<void>}
   */
  async loadSong(song) {
    try {
      const { title, artist, cover, url } = song;
      this.container.querySelector('.song-title').textContent = title;
      this.container.querySelector('.artist').textContent = artist;
      this.container.querySelector('.cover-art').src = cover;
      
      // 预加载音频
      await new Promise((resolve, reject) => {
        this.audio.src = url;
        this.audio.load();
        this.audio.oncanplaythrough = resolve;
        this.audio.onerror = reject;
      });
      
    } catch (error) {
      console.error('加载音乐失败:', error);
      // 显示错误状态
      this.container.querySelector('.song-title').textContent = '加载失败';
      this.container.querySelector('.artist').textContent = '请检查音乐链接';
    }
  }

  /**
   * 切换播放/暂停状态
   */
  togglePlay() {
    if (this.audio.paused) {
      this.audio.play().catch(console.error);
    } else {
      this.audio.pause();
    }
  }

  /**
   * 播放上一首歌曲
   * @returns {Promise<void>}
   */
  async prev() {
    if (this.playlist.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    await this.loadSong(this.playlist[this.currentIndex]);
    this.audio.play().catch(console.error);
  }

  /**
   * 播放下一首歌曲
   * @returns {Promise<void>}
   */
  async next() {
    if (this.playlist.length === 0) return;
    // 触发外部自定义钩子（README 中记录的公开 API）
    if (typeof this.onNext === 'function') this.onNext();
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    await this.loadSong(this.playlist[this.currentIndex]);
    this.audio.play().catch(console.error);
  }

  /**
   * 切换播放器的展开/收缩状态
   * 优化动画效果，使用更流畅的贝塞尔曲线
   */
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    
    // 添加动画类
    if (this.isCollapsed) {
      this.container.classList.add('collapsing');
    } else {
      this.container.classList.add('expanding');
    }
    
    requestAnimationFrame(() => {
      // 动画时长与缓动统一由 CSS 变量控制，避免内联样式覆盖分阶段过渡
      this.container.classList.toggle('collapsed', this.isCollapsed);
      
      // 动画结束后移除动画类
      setTimeout(() => {
        this.container.classList.remove('collapsing', 'expanding');
      }, 500);
    });
  }

  /**
   * 更新播放进度条
   * @param {number} percent - 当前播放进度百分比
   * 优化动画效果，使用更流畅的过渡
   */
  updateProgress(percent) {
    const progressBar = this.container.querySelector('.progress-bar');
    const progressContainer = this.container.querySelector('.progress-container');
    
    // 添加拖动状态类
    if (percent > 0 && percent < 100) {
      progressContainer.classList.add('active');
    } else {
      progressContainer.classList.remove('active');
    }
    
    // 使用requestAnimationFrame确保流畅动画
    requestAnimationFrame(() => {
      progressBar.style.width = `${percent}%`;
      
      // 添加进度条动画效果
      if (percent > 0 && percent < 100) {
        progressBar.style.animation = 'none';
        setTimeout(() => {
          progressBar.style.animation = '';
        }, 10);
      }
    });
  }

  /**
   * 更新时间显示
   * 左侧为已播放，右侧为剩余时长（Apple Music 的读数方式）
   */
  updateTimeDisplay() {
    const current = this.container.querySelector('.time-current');
    const remaining = this.container.querySelector('.time-remaining');
    current.textContent = this.formatTime(this.audio.currentTime);
    const left = this.audio.duration - this.audio.currentTime;
    remaining.textContent = Number.isFinite(left) ? `-${this.formatTime(left)}` : '--:--';
  }

  /**
   * 格式化时间显示
   * @param {number} seconds - 总秒数
   * @returns {string} 格式化后的时间字符串 (MM:SS)
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * 根据关键词过滤播放列表
   * @param {string} keyword - 搜索关键词
   */
  filterPlaylist(keyword) {
    if (!this.playlist) return;
    
    const searchResults = this.container.querySelector('.search-results');
    
    if (!keyword.trim()) {
      searchResults.classList.remove('show');
      return;
    }

    const songs = this.playlist.filter(song => {
      const title = song.title.toLowerCase();
      const artist = song.artist.toLowerCase();
      keyword = keyword.toLowerCase();
      return title.includes(keyword) || artist.includes(keyword);
    });

    // 渲染搜索结果（使用 DOM 构造，避免歌曲信息被当作 HTML 解析）
    searchResults.textContent = '';
    if (songs.length > 0) {
      songs.forEach(song => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.dataset.index = this.playlist.indexOf(song);

        const cover = document.createElement('img');
        cover.className = 'search-result-cover';
        cover.src = song.cover;
        cover.alt = '';

        const meta = document.createElement('div');
        meta.className = 'search-result-meta';

        const title = document.createElement('div');
        title.className = 'search-result-title';
        title.textContent = song.title;

        const artist = document.createElement('div');
        artist.className = 'search-result-artist';
        artist.textContent = song.artist;

        meta.append(title, artist);
        item.append(cover, meta);
        searchResults.appendChild(item);
      });
    } else {
      const empty = document.createElement('div');
      empty.className = 'no-results';
      empty.textContent = '暂无相关音乐';
      searchResults.appendChild(empty);
    }
    
    searchResults.classList.add('show');
  }

  /**
   * 渲染过滤后的歌曲列表
   * @param {Array} songs - 过滤后的歌曲列表
   */
  renderFilteredSongs(songs) {
    // 更新播放列表
    if (songs.length > 0) {
      // 找到匹配的歌曲,加载第一首
      if (this.audio.paused) { // 仅在当前没有播放时自动播放第一首
        this.loadSong(songs[0]);
        const index = this.playlist.findIndex(song => song.title === songs[0].title);
        if (index !== -1) {
          this.currentIndex = index;
        }
      }
    }
  }
}
