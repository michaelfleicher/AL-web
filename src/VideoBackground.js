import { useEffect } from 'react';

const VideoBackground = () => {
  useEffect(() => {
    // This will run once the component mounts
    const initVideoBackground = () => {
      const layerA = document.getElementById('layerA');
      const layerB = document.getElementById('layerB');
      const videoA = document.getElementById('videoA');
      const videoB = document.getElementById('videoB');
      const maskA = document.getElementById('maskA');
      const maskB = document.getElementById('maskB');
      const badge = document.getElementById('badge');
      
      if (!layerA || !layerB || !videoA || !videoB || !badge) {
        console.error('Video elements not found');
        return;
      }
      
      console.log('Video background initialized');
      
      // Enhance video mask transitions with improved cross-fade and longer duration
      // This modifies how masks are faded out when videos load
      const enhanceMaskTransitions = () => {
        // Apply improved transition property to masks for better cross-fade
        maskA.style.transition = "opacity 0.5s ease-out";
        maskB.style.transition = "opacity 0.5s ease-out";
        
        // Force masks to be fully visible initially
        maskA.style.opacity = '1';
        maskB.style.opacity = '1';
        
        // Add event listeners to video elements for better masking
        videoA.addEventListener('loadstart', () => {
          // Ensure mask is fully visible when video starts loading
          maskA.style.opacity = '1';
          maskA.style.display = 'block';
        });
        
        videoB.addEventListener('loadstart', () => {
          // Ensure mask is fully visible when video starts loading
          maskB.style.opacity = '1';
          maskB.style.display = 'block';
        });
        
        // Dispatch initial video1-fade-in event when video A is loaded
        videoA.addEventListener('loadeddata', () => {
          setTimeout(() => {
            console.log('Video A loaded, triggering video1-fade-in event');
            window.dispatchEvent(new CustomEvent('video1-fade-in'));
          }, 300);
        });
      };
      
      enhanceMaskTransitions();
    };
    
    initVideoBackground();
    
    // Dispatch multiple initial fade-in events with different timing to ensure
    // that all text components get animated properly no matter when they load
    const sendInitialEvents = () => {
      console.log('Sending initial fade-in events');
      
      // Send first event immediately
      window.dispatchEvent(new CustomEvent('video1-fade-in'));
      
      // Send another after a short delay
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('video1-fade-in'));
      }, 800);
      
      // And another after a longer delay for components that load more slowly
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('video1-fade-in'));
      }, 1500);
      
      // If the current video is 3, also send video3-fade-in events
      if (document.getElementById('badge').textContent === "Video: 3") {
        console.log('Sending video3-fade-in events');
        window.dispatchEvent(new CustomEvent('video3-fade-in'));
        
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('video3-fade-in'));
        }, 800);
      }
    };
    
    // Wait a bit for all components to be ready
    setTimeout(sendInitialEvents, 500);
  }, []);
  
  // This component doesn't render anything as the video elements
  // are already in the index.html file
  return null;
};

export default VideoBackground;
