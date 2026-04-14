class TikTokSpider {
  constructor() {
    this.videos = [];
    this.logs = [];
    this.isRunning = false;
    this.progress = 0;
    this.onProgress = null;
    this.onLog = null;
  }

  log(message, level = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const entry = { time: timestamp, message, level };
    this.logs.push(entry);
    if (this.onLog) this.onLog(entry);
    console.log(`[${timestamp}] ${message}`);
  }

  generateMockVideos(count = 100) {
    this.log(`Gerando ${count} vídeos mock...`);
    this.videos = [];

    const sampleVideos = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    ];

    const baseUsernames = [
      'creator1', 'viralvid', 'trendingnow', 'foryou', 'explore',
      'dailyvids', 'viralnova', 'contentcreator', 'newtrend',
      'fyp', 'viral', 'trending', 'foryoupage', 'tiktok', 'reels',
      'viralview', 'trendingnow', 'fypシ', 'viralvibes', 'foryoupage'
    ];

    const baseDescriptions = [
      'Check this out! 🔥 #fyp #viral #trending',
      'Wait for it... 😱 #foryou #viral',
      'This is amazing! #trending #fyp',
      'POV: When you see this #pov #viral',
      'No cap this is crazy #fyp #trending',
      'Wait till the end! #viral #foryou',
      'This is everything 🔥 #trending',
      'Best part is at the end #viral',
      'Can you do this? #challenge #fyp',
      'Tutorial time! #howto #viral',
      'Wait for the twist 😲 #plot twist #viral',
      'This changed everything #viral #fyp',
      'Day in my life vlog #vlog #daily',
      'POV: You found this early #fyp #viral',
      'Replying to viral video #reply #viral',
    ];

    const hashtags = [
      '#fyp', '#viral', '#trending', '#foryou', '#explore',
      '#viralvibes', '#trendingnow', '#fypシ', '#reels', '#viral',
      '#foryoupage', '#explorepage', '#tiktok', '#viralvideo'
    ];

    return new Promise((resolve) => {
      let i = 0;
      
      const generateNext = () => {
        if (i >= count) {
          this.progress = 100;
          this.log(`Spider concluído! Total: ${this.videos.length} vídeos`);
          this.isRunning = false;
          resolve(this.videos);
          return;
        }

        this.progress = Math.floor((i / count) * 100);
        if (this.onProgress) this.onProgress(this.progress);

        const desc = baseDescriptions[i % baseDescriptions.length];
        const hashtag = hashtags[i % hashtags.length];
        const fullDesc = `${desc} ${hashtag}`;

        const video = {
          id: i + 1,
          url: sampleVideos[i % sampleVideos.length],
          username: baseUsernames[i % baseUsernames.length],
          description: fullDesc,
          likes: Math.floor(Math.random() * 9999000) + 1000,
          comments: Math.floor(Math.random() * 499900) + 100,
          shares: Math.floor(Math.random() * 99950) + 50,
          music: `Original Sound - ${baseUsernames[i % baseUsernames.length]}`,
          thumbnail: `https://picsum.photos/seed/${i}/300/400`,
        };

        this.videos.push(video);
        this.log(`Gerado vídeo ${i + 1}/100: @${video.username}`);

        i++;
        setTimeout(generateNext, 20);
      };

      this.isRunning = true;
      this.logs = [];
      this.videos = [];
      this.progress = 0;
      generateNext();
    });
  }

  async run(count = 100) {
    return this.generateMockVideos(count);
  }

  getStatus() {
    return {
      is_running: this.isRunning,
      progress: this.progress,
      videos_count: this.videos.length,
      logs: this.logs.slice(-20)
    };
  }

  getVideos() {
    return this.videos;
  }
}

window.TikTokSpider = TikTokSpider;