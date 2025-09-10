/**
 * Video Helper Script for HLS Video Playback
 * Enhances HLS video streaming and transitions
 * Provides better compatibility across different devices and browsers
 */

(function() {
  // Store device type detection
  let isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  // Specific iOS detection
  let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  // HLS configuration options
  const HLS_CONFIG = {
    autoStartLoad: true,
    startPosition: -1,
    capLevelToPlayerSize: true,
    debug: false,
    defaultAudioCodec: undefined,
    initialLiveManifestSize: 1,
    maxBufferLength: 30,
    maxMaxBufferLength: 600,
    maxBufferSize: 60 * 1000 * 1000,
    maxBufferHole: 0.5,
    lowLatencyMode: false,
    enableWorker: true
  };
  
  // Function to initialize HLS on a video element
  window.initializeHls = function(videoElement, src, autoplay = true, loop = false) {
    if (!videoElement || !src) return null;
    
    console.log('Initializing HLS for:', src);
    
    // Set video properties
    videoElement.muted = true;
    videoElement.autoplay = autoplay;
    videoElement.loop = loop;
    videoElement.playsInline = true;
    videoElement.setAttribute('webkit-playsinline', '');
    
    let hlsInstance = null;
    
    // Use HLS.js if supported
    if (Hls.isSupported()) {
      hlsInstance = new Hls(HLS_CONFIG);
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(videoElement);
      
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
        console.log(`HLS manifest parsed for ${src}`);
        
        if (autoplay) {
          videoElement.play().catch(e => {
            console.error('Error auto-playing video:', e);
            
            // Try again with user interaction
            document.addEventListener('click', function playOnClick() {
              videoElement.play();
              document.removeEventListener('click', playOnClick);
            }, { once: true });
          });
        }
      });
      
      // Add error handling
      hlsInstance.on(Hls.Events.ERROR, function(event, data) {
        if (data.fatal) {
          console.error(`Fatal HLS error:`, data);
          
          // Try to recover
          switch(data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error, trying to recover...');
              hlsInstance.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, trying to recover...');
              hlsInstance.recoverMediaError();
              break;
            default:
              console.error('Unrecoverable error, destroying HLS instance');
              hlsInstance.destroy();
              
              // Fall back to native player if possible
              if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                videoElement.src = src;
                if (autoplay) videoElement.play().catch(e => console.error('Native fallback error:', e));
              }
              break;
          }
        }
      });
    } 
    // For browsers with native HLS support (Safari)
    else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      console.log('Using native HLS support');
      videoElement.src = src;
      
      if (autoplay) {
        videoElement.play().catch(e => {
          console.error('Error playing video with native HLS:', e);
        });
      }
    } 
    else {
      console.error('HLS is not supported in this browser and no fallback available');
    }
    
    return hlsInstance;
  };
  
  // Function to optimize videos based on device
  window.optimizeVideoForDevice = function(videoElement) {
    if (!videoElement) return;
    
    if (isMobile) {
      videoElement.setAttribute('playsinline', '');
      videoElement.setAttribute('webkit-playsinline', '');
      videoElement.preload = 'auto';
      
      if (isIOS) {
        // iOS-specific optimizations
        videoElement.setAttribute('x-webkit-airplay', 'allow');
      }
    }
  };
  
  // Function to check if a browser supports HLS
  window.isHlsSupported = function() {
    return Hls.isSupported() || document.createElement('video').canPlayType('application/vnd.apple.mpegurl');
  };
  
  // Function to destroy an HLS instance
  window.destroyHls = function(hlsInstance) {
    if (hlsInstance) {
      hlsInstance.destroy();
      return true;
    }
    return false;
  };
  
  console.log('HLS Video Helper initialized');
})();