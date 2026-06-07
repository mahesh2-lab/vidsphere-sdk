const { VidSphereClient } = require('./dist'); // or require('.')

const apikey = "sk_86cee8e7044cff7d19706908d955631e402d60def769d0d62b9e7d3b43873910";

// 1. Initialize the client
const client = new VidSphereClient({ 
  apiKey: apikey,
  baseUrl: 'http://localhost:3000' // <-- Replace with your actual dashboard URL
});

async function uploadTest() {
  try {
    console.log("Starting upload...");
    
    // 2. Call upload with a local file path
    // Make sure you have a valid video file at this path, e.g. './test-video.mp4'
    const videoId = await client.upload('./test.mp4', (percent) => {
      console.log(`Upload progress: ${percent}%`);
    });
    
    console.log(`Upload complete! VidSphere Video ID: ${videoId}`);
    console.log("Checking YouTube processing status...");
                                                                                                        
    // 3. Poll the status until YouTube finishes processing
    let processing = true;
    while (processing) {
      const status = await client.getStatus(videoId);
      
      const ytStatus = status.youtubeStatus;
      if (!ytStatus || ytStatus === 'not_found') {
        console.log("YouTube processing status: Waiting for YouTube to register the video...");
      } else {
        const pStatus = ytStatus.processingStatus || 'processing';
        console.log(`YouTube processing status: ${pStatus}`);
        
        if (pStatus === 'succeeded' || pStatus === 'failed') {
          processing = false;
        }
      }

      if (processing) {
        // Wait 5 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    console.log("Video is fully processed and ready!");
  } catch (error) {
    console.error("Upload failed:", error.message);
  }
}

uploadTest();
