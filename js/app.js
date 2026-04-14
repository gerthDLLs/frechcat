(function() {
  'use strict';

  class TikTokApp {
    constructor() {
      this.dataManager = new DataManager();
      this.uiRenderer = new UIRenderer(this.dataManager);
      this.videoPlayer = new VideoPlayer(this.uiRenderer);
      
      this.touchStartY = 0;
      this.touchEndY = 0;
      this.touchMoved = false;
      this.lastTapTime = 0;
      
      this.isMobile = this.detectMobile();
      this.currentTab = 'home';
      this.spiderVideos = [];
      this.spider = new TikTokSpider();
    }

    detectMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    }

    init() {
      this.dataManager.load();
      this.setupDeviceMode();
      this.setupTabs();
      this.render();
      this.setupEventListeners();
      this.loadInitialVideos();
    }

    setupDeviceMode() {
      const toggle = document.getElementById('device-toggle');
      const desktopPanel = document.getElementById('desktop-panel');
      
      this.updateDeviceMode();
      
      toggle.addEventListener('click', () => {
        this.isMobile = !this.isMobile;
        this.updateDeviceMode();
      });
    }

    updateDeviceMode() {
      const toggle = document.getElementById('device-toggle');
      const desktopPanel = document.getElementById('desktop-panel');
      const tabsContainer = document.getElementById('tabs-container');
      
      if (this.isMobile) {
        toggle.classList.add('mobile');
        toggle.querySelector('.pc-label').classList.add('hidden');
        toggle.querySelector('.mobile-label').classList.remove('hidden');
        desktopPanel.style.display = 'none';
        tabsContainer.style.display = 'block';
      } else {
        toggle.classList.remove('mobile');
        toggle.querySelector('.pc-label').classList.remove('hidden');
        toggle.querySelector('.mobile-label').classList.add('hidden');
        desktopPanel.style.display = 'flex';
        tabsContainer.style.display = 'none';
        this.updateDesktopPanel();
      }
    }

    setupTabs() {
      const tabItems = document.querySelectorAll('.tab-item');
      const tabsWrapper = document.getElementById('tabs-wrapper');
      
      tabItems.forEach(item => {
        item.addEventListener('click', () => {
          const tab = item.dataset.tab;
          this.switchTab(tab);
        });
      });
      
      this.updateTabsVisibility();
    }

    switchTab(tabName) {
      this.currentTab = tabName;
      
      document.querySelectorAll('.tab-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tabName);
      });
      
      document.querySelectorAll('.tabs-wrapper > .tab-content > div').forEach(content => {
        const isActive = content.id === `${tabName}-tab`;
        content.style.display = isActive ? 'block' : 'none';
      });
      
      const tabsWrapper = document.getElementById('tabs-wrapper');
      tabsWrapper.classList.add('active');
      
      if (tabName !== 'home') {
        document.getElementById('app').style.display = 'none';
      } else {
        document.getElementById('app').style.display = this.isMobile ? 'none' : 'block';
      }
      
      if (tabName === 'feed') {
        this.renderVideoGrid();
      }
    }

    updateTabsVisibility() {
      const app = document.getElementById('app');
      const tabsContainer = document.getElementById('tabs-container');
      
      if (this.isMobile) {
        tabsContainer.style.display = 'block';
        app.style.display = 'none';
        this.switchTab(this.currentTab);
      } else {
        tabsContainer.style.display = 'none';
        app.style.display = 'block';
      }
    }

    getCurrentVideos() {
      return this.spiderVideos.length > 0 ? this.spiderVideos : this.dataManager.getVideos();
    }

    updateUI(index) {
      const videos = this.getCurrentVideos();
      if (index >= videos.length) return;
      
      const video = videos[index];
      const isLiked = this.dataManager.isLiked(video.id);
      const isPlaying = this.videoPlayer.getIsPlaying();
      
      this.uiRenderer.renderSidebar(video, isLiked, isPlaying);
      this.uiRenderer.renderBottomInfo(video, isPlaying);
      
      if (!this.isMobile) {
        this.updateDesktopPanel();
      }
    }

    updateDesktopPanel() {
      const videos = this.getCurrentVideos();
      const index = this.videoPlayer.getCurrentIndex();
      if (index >= videos.length) return;
      
      const video = videos[index];
      const isLiked = this.dataManager.isLiked(video.id);
      const comments = this.dataManager.getComments(video.id);
      
      document.getElementById('desktop-like-count').textContent = Utils.formatNumber(video.likes + (isLiked ? 1 : 0));
      
      const infoEl = document.getElementById('desktop-video-info');
      infoEl.innerHTML = `
        <div class="desktop-username">
          @${Utils.escapeHtml(video.username)}
          <svg class="verified" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        </div>
        <div class="desktop-description">${Utils.escapeHtml(video.description)}</div>
        <div class="desktop-stats">
          <div class="desktop-stat">
            <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span>${Utils.formatNumber(video.likes + (isLiked ? 1 : 0))}</span>
          </div>
          <div class="desktop-stat">
            <svg viewBox="0 0 24 24"><path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/></svg>
            <span>${Utils.formatNumber(comments.length)}</span>
          </div>
          <div class="desktop-stat">
            <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
            <span>${Utils.formatNumber(video.shares)}</span>
          </div>
        </div>
      `;
      
      const commentsEl = document.getElementById('desktop-comments-list');
      commentsEl.innerHTML = comments.map(c => `
        <div class="desktop-comment-item">
          <div class="desktop-comment-avatar">${c.username.charAt(0).toUpperCase()}</div>
          <div class="desktop-comment-content">
            <div class="desktop-comment-header">
              <span class="desktop-comment-username">${Utils.escapeHtml(c.username)}</span>
              <span class="desktop-comment-time">${Utils.escapeHtml(c.time)}</span>
            </div>
            <div class="desktop-comment-text">${Utils.escapeHtml(c.text)}</div>
          </div>
        </div>
      `).join('');
    }

    async runSpider() {
      const statusDot = document.getElementById('spider-dot');
      const statusText = document.getElementById('spider-status-text');
      const progressBar = document.getElementById('spider-progress-bar');
      const videosCount = document.getElementById('spider-videos-count');
      const logEl = document.getElementById('spider-log');
      
      this.spider.onProgress = (progress) => {
        progressBar.style.width = progress + '%';
        videosCount.textContent = `${this.spider.getVideos().length} vídeos carregados`;
      };
      
      this.spider.onLog = (entry) => {
        logEl.innerHTML += `<div class="spider-log-entry"><span class="time">[${entry.time}]</span><span class="${entry.level}">${entry.message}</span></div>`;
        logEl.scrollTop = logEl.scrollHeight;
      };
      
      statusDot.classList.add('running');
      statusText.textContent = 'Executando Spider...';
      this.addSpiderLog('Iniciando Spider...', 'info');
      
      try {
        const videos = await this.spider.run(100);
        this.spiderVideos = videos;
        
        statusText.textContent = 'Concluído!';
        statusDot.classList.remove('running');
        this.addSpiderLog(`Spider concluído! ${videos.length} vídeos`, 'success');
        
        this.renderVideoGrid();
        
      } catch (e) {
        this.addSpiderLog('Erro: ' + e.message, 'error');
        statusText.textContent = 'Erro!';
        statusDot.classList.remove('running');
      }
    }

    addSpiderLog(message, level) {
      const logEl = document.getElementById('spider-log');
      const time = new Date().toLocaleTimeString();
      logEl.innerHTML += `<div class="spider-log-entry"><span class="time">[${time}]</span><span class="${level}">${message}</span></div>`;
      logEl.scrollTop = logEl.scrollHeight;
    }

    clearSpider() {
      this.spiderVideos = [];
      this.spider = new TikTokSpider();
      document.getElementById('spider-progress-bar').style.width = '0%';
      document.getElementById('spider-videos-count').textContent = '0 vídeos carregados';
      document.getElementById('spider-status-text').textContent = 'Aguardando...';
      document.getElementById('spider-log').innerHTML = '';
      this.addSpiderLog('Spider limpo', 'info');
    }

    playVideo(index) {
      const videos = this.getCurrentVideos();
      if (index < 0 || index >= videos.length) return;
      
      this.videoPlayer.play(index);
      this.updateUI(index);
    }

    toggleLike() {
      const videos = this.getCurrentVideos();
      const index = this.videoPlayer.getCurrentIndex();
      if (index >= videos.length) return;
      
      const video = videos[index];
      this.dataManager.toggleLike(video.id);
      this.updateUI(this.videoPlayer.getCurrentIndex());
    }

    showLikeAnimation(e) {
      const touch = e.touches ? e.touches[0] : e;
      this.uiRenderer.showLikeAnimation(touch.clientX - 50, touch.clientY - 50);
    }

    openCommentModal() {
      const videos = this.getCurrentVideos();
      const index = this.videoPlayer.getCurrentIndex();
      if (index >= videos.length) return;
      
      const video = videos[index];
      this.uiRenderer.renderComments(video.id);
      document.getElementById('comment-modal').classList.add('active');
    }

    closeCommentModal() {
      document.getElementById('comment-modal').classList.remove('active');
    }

    addComment() {
      const input = this.isMobile 
        ? document.getElementById('comment-input')
        : document.getElementById('desktop-comment-input');
      const text = input.value.trim();
      if (!text) return;
      
      const videos = this.getCurrentVideos();
      const index = this.videoPlayer.getCurrentIndex();
      if (index >= videos.length) return;
      
      const video = videos[index];
      this.dataManager.addComment(video.id, {
        username: 'you',
        text: text,
        time: 'now'
      });
      
      input.value = '';
      this.updateUI(this.videoPlayer.getCurrentIndex());
    }

    openShareModal() {
      document.getElementById('share-modal').classList.add('active');
    }

    closeShareModal() {
      document.getElementById('share-modal').classList.remove('active');
    }

    copyLink() {
      const videos = this.getCurrentVideos();
      const index = this.videoPlayer.getCurrentIndex();
      if (index >= videos.length) return;
      
      const video = videos[index];
      navigator.clipboard?.writeText?.(`https://tiktok.local/video/${video.id}`);
      this.closeShareModal();
    }

    toggleMute() {
      this.videoPlayer.toggleMute();
    }

    handleUpload(files) {
      Array.from(files).forEach(file => {
        if (!file.type.startsWith('video/')) return;
        this.dataManager.addVideo(file);
      });
      
      this.render();
      this.playVideo(0);
    }

    handleSwipe() {
      if (!this.touchMoved) return;
      
      const diff = this.touchStartY - this.touchEndY;
      const videos = this.getCurrentVideos();
      
      if (Math.abs(diff) > 50) {
        if (diff > 0 && this.videoPlayer.canGoNext(videos.length - 1)) {
          this.playVideo(this.videoPlayer.getCurrentIndex() + 1);
        } else if (diff < 0 && this.videoPlayer.canGoPrevious()) {
          this.playVideo(this.videoPlayer.getCurrentIndex() - 1);
        }
      }
      
      this.touchMoved = false;
    }

    handleTouchStart(e) {
      const touch = e.touches ? e.touches[0] : e;
      this.touchStartY = touch.clientY;
      this.touchMoved = false;
    }

    handleTouchMove() {
      this.touchMoved = true;
    }

    handleDoubleTap(e) {
      const now = Date.now();
      if (now - this.lastTapTime < 300) {
        const videos = this.getCurrentVideos();
        const index = this.videoPlayer.getCurrentIndex();
        if (index >= videos.length) return;
        
        const video = videos[index];
        
        if (!this.dataManager.isLiked(video.id)) {
          this.toggleLike();
          this.showLikeAnimation(e);
        }
      }
      this.lastTapTime = now;
    }

    handleKeydown(e) {
      const videos = this.getCurrentVideos();
      
      switch(e.key) {
        case 'ArrowUp':
          if (this.videoPlayer.canGoNext(videos.length - 1)) {
            this.playVideo(this.videoPlayer.getCurrentIndex() + 1);
          }
          break;
        case 'ArrowDown':
          if (this.videoPlayer.canGoPrevious()) {
            this.playVideo(this.videoPlayer.getCurrentIndex() - 1);
          }
          break;
        case ' ':
          e.preventDefault();
          this.videoPlayer.togglePlay();
          this.updateUI(this.videoPlayer.getCurrentIndex());
          break;
      }
    }

    setupEventListeners() {
      const app = document.getElementById('app');
      
      app.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
      app.addEventListener('touchmove', () => this.handleTouchMove(), { passive: true });
      app.addEventListener('touchend', () => this.handleSwipe());
      
      app.addEventListener('click', (e) => {
        const target = e.target.closest('.video-slide');
        if (target && !e.target.closest('.sidebar') && !e.target.closest('.bottom-info')) {
          this.handleDoubleTap(e);
          this.videoPlayer.togglePlay();
          this.updateUI(this.videoPlayer.getCurrentIndex());
        }
      });

      document.addEventListener('click', (e) => {
        if (e.target.closest('#like-btn') || e.target.closest('#desktop-like-btn')) this.toggleLike();
        if (e.target.closest('#comment-btn') || e.target.closest('#desktop-comment-btn')) this.openCommentModal();
        if (e.target.closest('#share-btn') || e.target.closest('#desktop-share-btn')) this.openShareModal();
        if (e.target.closest('#mute-btn')) this.toggleMute();
        if (e.target.closest('#upload-btn')) {
          document.getElementById('video-input').click();
        }
        if (e.target.closest('#device-toggle')) {
          this.isMobile = !this.isMobile;
          this.updateDeviceMode();
        }
        
        if (e.target.closest('#spider-run-btn')) this.runSpider();
        if (e.target.closest('#spider-clear-btn')) this.clearSpider();
      });

      document.getElementById('video-input').addEventListener('change', (e) => {
        this.handleUpload(e.target.files);
        e.target.value = '';
      });

      document.getElementById('close-modal').addEventListener('click', () => this.closeCommentModal());
      document.getElementById('close-share').addEventListener('click', () => this.closeShareModal());
      document.getElementById('copy-link').addEventListener('click', () => this.copyLink());
      document.getElementById('save-video').addEventListener('click', () => {
        alert('Video saved!');
        this.closeShareModal();
      });
      document.getElementById('send-comment').addEventListener('click', () => this.addComment());
      document.getElementById('desktop-send-comment').addEventListener('click', () => this.addComment());
      
      document.getElementById('comment-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.addComment();
      });
      document.getElementById('desktop-comment-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.addComment();
      });

      document.querySelector('.modal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) this.closeCommentModal();
      });

      document.querySelector('.share-modal').addEventListener('click', (e) => {
        if (e.target.classList.contains('share-modal')) this.closeShareModal();
      });

      document.addEventListener('keydown', (e) => this.handleKeydown(e));

      window.addEventListener('resize', () => {
        const wasMobile = this.isMobile;
        this.isMobile = this.detectMobile();
        if (wasMobile !== this.isMobile) {
          this.updateDeviceMode();
          this.updateTabsVisibility();
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const app = new TikTokApp();
    app.init();
    window.tiktokApp = app;
  });
})();