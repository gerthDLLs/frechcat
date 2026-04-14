class VideoPlayer {
  constructor(uiRenderer) {
    this.uiRenderer = uiRenderer;
    this.isPlaying = true;
    this.isMuted = false;
    this.currentIndex = 0;
    this.videoElements = [];
    this.eventListeners = new Map();
  }

  init(videos, currentIndex = 0) {
    this.currentIndex = currentIndex;
    this.setupVideoEvents();
  }

  setVideos(videoElements) {
    this.videoElements = videoElements;
  }

  play(index) {
    if (index < 0 || index >= this.videoElements.length) return false;
    
    this.uiRenderer.showLoading();
    
    this.videoElements.forEach((v, i) => {
      v.pause();
      v.currentTime = 0;
      v.parentElement.classList.toggle('active', i === index);
    });
    
    const currentVideo = this.videoElements[index];
    const slide = currentVideo.parentElement;
    const loading = slide.querySelector('.video-loading');
    
    const onCanPlay = () => {
      this.uiRenderer.hideLoading();
      if (loading) loading.style.opacity = '0';
      currentVideo.play().catch(() => {});
      currentVideo.removeEventListener('canplay', onCanPlay);
    };
    
    currentVideo.addEventListener('canplay', onCanPlay);
    currentVideo.load();
    
    if (currentVideo.readyState >= 3) {
      onCanPlay();
    }
    
    this.currentIndex = index;
    this.isPlaying = true;
    this.preloadAdjacent();
    
    return true;
  }

  preloadAdjacent() {
    const videos = this.videoElements;
    if (this.currentIndex > 0) {
      videos[this.currentIndex - 1].preload = 'metadata';
    }
    if (this.currentIndex < videos.length - 1) {
      videos[this.currentIndex + 1].preload = 'metadata';
    }
    videos[this.currentIndex].preload = 'auto';
  }

  setupVideoEvents() {
    this.videoElements.forEach(video => {
      const onTimeUpdate = () => {
        if (video.duration) {
          const progress = (video.currentTime / video.duration) * 100;
          this.uiRenderer.updateProgress(progress);
        }
      };
      
      const onEnded = () => video.play();
      const onWaiting = () => this.uiRenderer.showLoading();
      const onPlaying = () => this.uiRenderer.hideLoading();
      
      video.addEventListener('timeupdate', onTimeUpdate);
      video.addEventListener('ended', onEnded);
      video.addEventListener('waiting', onWaiting);
      video.addEventListener('playing', onPlaying);
      
      this.eventListeners.set(video, { onTimeUpdate, onEnded, onWaiting, onPlaying });
    });
  }

  togglePlay() {
    const video = this.videoElements[this.currentIndex];
    if (!video) return;
    
    if (video.paused) {
      video.play();
      this.isPlaying = true;
    } else {
      video.pause();
      this.isPlaying = false;
    }
    
    return this.isPlaying;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.videoElements.forEach(v => v.muted = this.isMuted);
    this.uiRenderer.updateMuteButton(this.isMuted);
    return this.isMuted;
  }

  getCurrentIndex() {
    return this.currentIndex;
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  getIsMuted() {
    return this.isMuted;
  }

  next() {
    return this.play(this.currentIndex + 1);
  }

  previous() {
    return this.play(this.currentIndex - 1);
  }

  canGoNext(maxIndex) {
    return this.currentIndex < maxIndex;
  }

  canGoPrevious() {
    return this.currentIndex > 0;
  }
}

window.VideoPlayer = VideoPlayer;