const STORAGE_KEY = 'tiktok-clone-data';

const defaultVideos = [
  {
    id: 1,
    username: 'bigbuckbunny',
    description: '🐰 Big Buck Bunny - Animated Short Film #animation #shortfilm #classic',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    likes: 124000,
    comments: 2340,
    shares: 890,
    music: 'Original Sound - Big Buck Bunny'
  },
  {
    id: 2,
    username: 'sintelmovie',
    description: '🎬 Sintel - Third Open Movie by Blender Foundation #blender #animation #opensource',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    likes: 89200,
    comments: 1567,
    shares: 542,
    music: 'Original Sound - Sintel'
  },
  {
    id: 3,
    username: 'tearsofsteel',
    description: '🎥 Tears of Steel - Sci-Fi Short by Blender Foundation #scifi #vfx #blender',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    likes: 45600,
    comments: 892,
    shares: 321,
    music: 'Original Sound - Tears of Steel'
  },
  {
    id: 4,
    username: 'elephantsdream',
    description: '🐘 Elephant\'s Dream - First Open Movie #history #blender #animation',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    likes: 32100,
    comments: 456,
    shares: 123,
    music: 'Original Sound - Elephants Dream'
  },
  {
    id: 5,
    username: 'forgreatergood',
    description: '🔥 For Greater Good - Immersive Visual Experience #immersive #visual #art',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    likes: 78900,
    comments: 1234,
    shares: 456,
    music: 'Original Sound - For Greater Good'
  }
];

const sampleComments = [
  { username: 'user1', text: 'This is amazing! 🔥', time: '2h' },
  { username: 'user2', text: 'Best video I\'ve seen today!', time: '5h' },
  { username: 'user3', text: 'Can\'t stop watching this', time: '1d' },
  { username: 'user4', text: 'The quality is insane 😍', time: '1d' },
  { username: 'user5', text: 'Who else is here from the algorithm?', time: '2d' }
];

class DataManager {
  constructor() {
    this.videos = [];
    this.likedVideos = {};
    this.videoComments = {};
    this.nextId = 6;
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.videos = data.videos || [];
        this.likedVideos = data.likedVideos || {};
        this.videoComments = data.videoComments || {};
        this.nextId = data.nextId || 6;
      }
    } catch (e) {
      console.error('Error loading data:', e);
    }
    
    if (this.videos.length === 0) {
      this.videos = [...defaultVideos];
      defaultVideos.forEach(v => {
        this.videoComments[v.id] = [...sampleComments];
      });
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        videos: this.videos,
        likedVideos: this.likedVideos,
        videoComments: this.videoComments,
        nextId: this.nextId
      }));
    } catch (e) {
      console.error('Error saving data:', e);
    }
  }

  getVideos() {
    return this.videos;
  }

  getVideo(index) {
    return this.videos[index];
  }

  getCurrentVideo() {
    return this.videos[index];
  }

  isLiked(videoId) {
    return !!this.likedVideos[videoId];
  }

  toggleLike(videoId) {
    this.likedVideos[videoId] = !this.likedVideos[videoId];
    this.save();
    return this.likedVideos[videoId];
  }

  getComments(videoId) {
    return this.videoComments[videoId] || [];
  }

  addComment(videoId, comment) {
    if (!this.videoComments[videoId]) {
      this.videoComments[videoId] = [...sampleComments];
    }
    this.videoComments[videoId].unshift(comment);
    this.save();
  }

  addVideo(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const username = 'yourvideo_' + Math.floor(Math.random() * 10000);
      
      const newVideo = {
        id: this.nextId++,
        username: username,
        description: 'My video #' + this.nextId,
        videoUrl: url,
        likes: 0,
        comments: 0,
        shares: 0,
        music: 'Original Sound'
      };
      
      this.videos.unshift(newVideo);
      this.videoComments[newVideo.id] = [...sampleComments];
      this.save();
      
      resolve(newVideo);
    });
  }
}

window.DataManager = DataManager;