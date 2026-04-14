class UIRenderer {
  constructor(dataManager) {
    this.dataManager = dataManager;
  }

  renderVideos(videos, currentIndex) {
    const wrapper = document.getElementById('video-wrapper');
    wrapper.innerHTML = videos.map((video, index) => `
      <div class="video-slide ${index === currentIndex ? 'active' : ''}" data-index="${index}">
        <div class="video-loading">
          <div class="loading-spinner"></div>
        </div>
        <video 
          src="${video.videoUrl || video.url || ''}" 
          loop 
          playsinline 
          preload="none"
          data-index="${index}"
        ></video>
      </div>
    `).join('');
  }

  renderSidebar(video, isLiked, isPlaying) {
    const sidebar = document.getElementById('sidebar');
    const commentCount = (this.dataManager.getComments(video.id) || []).length;
    const likes = video.likes || 0;
    const comments = video.comments || 0;
    const shares = video.shares || 0;
    const username = video.username || 'user';
    const music = video.music || 'Original Sound';
    
    sidebar.innerHTML = `
      <div class="sidebar-item profile-avatar" id="profile-btn">
        <span class="plus">+</span>
      </div>
      <div class="sidebar-item" id="like-btn">
        <div class="sidebar-icon ${isLiked ? 'liked' : ''}">
          <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </div>
        <span class="sidebar-count">${Utils.formatNumber(likes + (isLiked ? 1 : 0))}</span>
      </div>
      <div class="sidebar-item" id="comment-btn">
        <div class="sidebar-icon">
          <svg viewBox="0 0 24 24"><path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/></svg>
        </div>
        <span class="sidebar-count">${Utils.formatNumber(comments + commentCount)}</span>
      </div>
      <div class="sidebar-item" id="share-btn">
        <div class="sidebar-icon">
          <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
        </div>
        <span class="sidebar-count">${Utils.formatNumber(shares)}</span>
      </div>
      <div class="sidebar-item">
        <div class="music-disc ${isPlaying ? 'playing' : ''}">
          <div class="music-disc-inner">
            <div class="music-disc-hole"></div>
          </div>
        </div>
      </div>
    `;
  }

  renderBottomInfo(video, isPlaying) {
    const bottomInfo = document.getElementById('bottom-info');
    const username = video.username || 'user';
    const description = video.description || '';
    const music = video.music || 'Original Sound';
    
    bottomInfo.innerHTML = `
      <div class="username">
        @${Utils.escapeHtml(username)}
        <svg class="verified" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
      </div>
      <div class="description">${Utils.escapeHtml(description)}</div>
      <div class="music-info">
        <div class="music-icon ${isPlaying ? 'playing' : ''}"></div>
        <span>${Utils.escapeHtml(music)}</span>
      </div>
    `;
  }

  renderComments(videoId) {
    const list = document.getElementById('comments-list');
    const comments = this.dataManager.getComments(videoId);
    
    list.innerHTML = comments.map(c => `
      <div class="comment-item">
        <div class="comment-avatar">${c.username.charAt(0).toUpperCase()}</div>
        <div class="comment-content">
          <span class="comment-username">${Utils.escapeHtml(c.username)}</span>
          <span class="comment-text">${Utils.escapeHtml(c.text)}</span>
          <div class="comment-time">${Utils.escapeHtml(c.time)}</div>
        </div>
      </div>
    `).join('');
  }

  showLoading() {
    document.getElementById('loading-spinner').classList.add('show');
  }

  hideLoading() {
    document.getElementById('loading-spinner').classList.remove('show');
  }

  showLikeAnimation(x, y) {
    const anim = document.getElementById('like-animation');
    anim.style.left = x + 'px';
    anim.style.top = y + 'px';
    anim.classList.remove('show');
    void anim.offsetWidth;
    anim.classList.add('show');
  }

  updateProgress(percent) {
    document.getElementById('progress').style.width = percent + '%';
  }

  updateMuteButton(isMuted) {
    const btn = document.getElementById('mute-btn');
    btn.classList.toggle('muted', isMuted);
  }
}

window.UIRenderer = UIRenderer;