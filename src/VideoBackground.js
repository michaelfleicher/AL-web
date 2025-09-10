import { useEffect } from 'react';
import useResponsive from './hooks/useResponsive';

const VideoBackground = () => {
  const { deviceType } = useResponsive();
  
  useEffect(() => {
    // This will run once the component mounts
    const initVideoBackground = () => {
      const layerA = document.getElementById('layerA');
      const layerB = document.getElementById('layerB');
      const videoA = document.getElementById('videoA');
      const videoB = document.getElementById('videoB');
      const badge = document.getElementById('badge');
      
      if (!layerA || !layerB || !videoA || !videoB || !badge) {
        console.error('Video elements not found');
        return;
      }
      
      console.log('HLS video background initialized');
      
      // Set up HLS video playback monitoring
      const setupVideoEvents = (videoElement) => {
        if (!videoElement) return;
        
        videoElement.addEventListener('play', () => {
          console.log(`Video started playing`);
        });
        
        videoElement.addEventListener('error', (e) => {
          console.error(`Video error:`, e);
        });
        
        videoElement.addEventListener('stalled', () => {
          console.warn(`Video playback stalled`);
        });
        
        videoElement.addEventListener('waiting', () => {
          console.log(`Video is waiting for data`);
        });
        
        videoElement.addEventListener('canplay', () => {
          console.log(`Video can start playback`);
        });
      };
      
      // Set up events for both videos
      setupVideoEvents(videoA);
      setupVideoEvents(videoB);
      
      // Optimize video playback based on device type
      const optimizeVideoForDevice = () => {
        const videos = [videoA, videoB];
        
        videos.forEach(video => {
          if (!video) return;
          
          // Apply optimizations based on device type
          if (deviceType === 'mobile') {
            // Optimize for mobile
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.preload = 'auto';
            
            // Lower resolution might be set via HLS quality selection
          } else {
            // Higher quality for tablets/desktop
            video.preload = 'auto';
          }
        });
      };
      
      // Apply video optimizations
      optimizeVideoForDevice();
      
      // Dispatch initial fade-in events to trigger text components
      const sendInitialEvents = () => {
        console.log('Sending initial fade-in events immediately');
        
        // Send events immediately
        window.dispatchEvent(new CustomEvent('video1-fade-in'));
        
        // Dispatch video-mask-fadeout event right away to show text immediately
        console.log('Dispatching video-mask-fadeout event for text components');
        window.dispatchEvent(new CustomEvent('video-mask-fadeout'));
        
        // Send second round with short delay
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('video1-fade-in'));
          window.dispatchEvent(new CustomEvent('video-mask-fadeout'));
        }, 100);
        
        // And another after a longer delay for components that load more slowly
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('video1-fade-in'));
          window.dispatchEvent(new CustomEvent('video-mask-fadeout'));
        }, 500);
        
        // If the current video is 3, also send video3-fade-in events
        if (badge && badge.textContent === "Video: 3") {
          console.log('Sending video3-fade-in events');
          window.dispatchEvent(new CustomEvent('video3-fade-in'));
          
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('video3-fade-in'));
          }, 800);
        }
      };
      
      // Wait a bit for all components to be ready
      setTimeout(() => {
        console.log('VideoBackground checking badge before sending events:', badge ? badge.textContent : 'badge not found');
        sendInitialEvents();
      }, 500);
      
      // Handle orientation changes
      const handleOrientationChange = () => {
        console.log('Orientation changed, reapplying video optimizations');
        setTimeout(() => {
          optimizeVideoForDevice();
        }, 300);
      };
      
      window.addEventListener('orientationchange', handleOrientationChange);
      
      return () => {
        window.removeEventListener('orientationchange', handleOrientationChange);
      };
    };
    
    // Initialize the video background
    initVideoBackground();
  }, [deviceType]);
  
  // This component doesn't render anything as the video elements
  // are already in the index.html file
  return null;
};

export default VideoBackground;
