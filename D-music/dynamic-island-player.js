class DynamicIslandPlayer {
  constructor(options = {}) {
    this.container = document.createElement('div');
    this.container.className = 'dynamic-island-player';
    this.audio = new Audio();
    this.isCollapsed = false;
    this.playlist = [];
    this.currentIndex = Math.floor(Math.random() * 100000); // 初始化一个较大的随机数
    this.init(options);

    // 防止播放器被选中
    this.container.addEventListener('selectstart', e => e.preventDefault());
    this.container.addEventListener('contextmenu', e => e.preventDefault());
  }

  init(options) {
    const { container = document.body } = options;
    
    this.container.innerHTML = `
      <img class="cover-art" src="" alt="封面">
      <div class="player-info">
        <p class="song-title">未播放</p>
        <p class="artist">未知歌手</p>
      </div>
      <div class="controls">
        <button class="control-btn prev">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </button>
        <button class="control-btn play-pause">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="play-icon">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="pause-icon" style="display:none">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>
        <button class="control-btn next">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>
        <button class="control-btn playlist-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 10h12v2H4zm0-4h12v2H4zm0 8h8v2H4zm10 0v6l5-3z"/>
          </svg>
        </button>
      </div>
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-handle"></div>
        </div>
      </div>
      <div class="time-display">00:00</div>
      <div class="playlist-container"></div>
    `;

    this.container.style.outline = 'none';
    this.container.setAttribute('tabindex', '-1');

    container.appendChild(this.container);
    this.bindEvents();
  }

  bindEvents() {
    const playBtn = this.container.querySelector('.play-pause');
    const nextBtn = this.container.querySelector('.next');
    const prevBtn = this.container.querySelector('.prev');
    const playlistBtn = this.container.querySelector('.playlist-btn');
    
    playBtn.addEventListener('click', () => this.togglePlay());
    nextBtn.addEventListener('click', () => this.next());
    prevBtn.addEventListener('click', () => this.prev());
    playlistBtn.addEventListener('click', () => this.togglePlaylist());
    
    this.audio.addEventListener('play', () => {
      const playIcon = this.container.querySelector('.play-icon');
      const pauseIcon = this.container.querySelector('.pause-icon');
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
      this.container.querySelector('.cover-art').classList.add('playing');
    });
    
    this.audio.addEventListener('pause', () => {
      const playIcon = this.container.querySelector('.play-icon');
      const pauseIcon = this.container.querySelector('.pause-icon');
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      this.container.querySelector('.cover-art').classList.remove('playing');
    });

    this.container.addEventListener('dblclick', () => this.toggleCollapse());
    
    // 进度条拖动相关
    const progressContainer = this.container.querySelector('.progress-container');
    let isDragging = false;
    let startX = 0;
    let startWidth = 0;

    const updateProgressFromEvent = (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const width = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
      const percent = width / rect.width;
      this.audio.currentTime = this.audio.duration * percent;
      this.updateProgress(percent * 100);
    };

    const startDragging = (e) => {
      isDragging = true;
      startX = e.clientX;
      startWidth = parseFloat(this.container.querySelector('.progress-bar').style.width);
      progressContainer.classList.add('dragging');
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', stopDragging);
    };

    const onDrag = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      updateProgressFromEvent(e);
    };

    const stopDragging = () => {
      isDragging = false;
      progressContainer.classList.remove('dragging');
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDragging);
    };

    progressContainer.addEventListener('mousedown', startDragging);
    progressContainer.addEventListener('click', updateProgressFromEvent);

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

    // 添加触摸事件支持
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
      
      if (deltaTime < 300 && deltaX < 10 && deltaY < 10) {
        this.toggleCollapse();
      }
    });
  }

  async loadPlaylist(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      this.playlist = data.playlist || [];
      if (this.playlist.length > 0) {
        this.currentIndex = this.currentIndex % this.playlist.length; // 使用取模运算确保索引有效
        await this.loadSong(this.playlist[this.currentIndex]);
      }
      this.renderPlaylist();
    } catch (error) {
      console.error('加载播放列表失败:', error);
    }
  }

  renderPlaylist() {
    const container = this.container.querySelector('.playlist-container');
    container.innerHTML = this.playlist.map((song, index) => `
      <div class="playlist-item ${index === this.currentIndex ? 'active' : ''}" 
           data-index="${index}">
        <span>${song.title}</span> - <span>${song.artist}</span>
      </div>
    `).join('');

    container.querySelectorAll('.playlist-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        this.currentIndex = index;
        this.loadSong(this.playlist[index]);
        this.audio.play();
        this.renderPlaylist();
      });
    });
  }

  togglePlaylist() {
    const playlist = this.container.querySelector('.playlist-container');
    playlist.classList.toggle('show');
  }

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

  togglePlay() {
    if (this.audio.paused) {
      this.audio.play().catch(console.error);
    } else {
      this.audio.pause();
    }
  }

  async prev() {
    if (this.playlist.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    await this.loadSong(this.playlist[this.currentIndex]);
    this.audio.play().catch(console.error);
    this.renderPlaylist();
  }

  async next() {
    if (this.playlist.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    await this.loadSong(this.playlist[this.currentIndex]);
    this.audio.play().catch(console.error);
    this.renderPlaylist();
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    requestAnimationFrame(() => {
      this.container.style.transition = 'all 0.4s cubic-bezier(0.32, 0.72, 0, 1)';
      this.container.classList.toggle('collapsed', this.isCollapsed);
    });
  }

  updateProgress(percent) {
    const progressBar = this.container.querySelector('.progress-bar');
    progressBar.style.width = `${percent}%`;
  }

  updateTimeDisplay() {
    const timeDisplay = this.container.querySelector('.time-display');
    const current = this.formatTime(this.audio.currentTime);
    const total = this.formatTime(this.audio.duration);
    timeDisplay.textContent = `${current} / ${total}`;
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
