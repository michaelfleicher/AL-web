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
        maskA.style.transition = "opacity 0.8s ease-out"; // Increased from 0.5s to 0.8s
        maskB.style.transition = "opacity 0.8s ease-out"; // Increased from 0.5s to 0.8s
        
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
        
        // Enhanced loading event handling
        const setupVideoLoadEvents = (video, mask) => {
          // Use multiple events to ensure we catch when video is truly ready
          const events = ['loadeddata', 'canplay', 'playing'];
          
          events.forEach(eventType => {
            video.addEventListener(eventType, () => {
              // Only start fading out mask after we're confident video is playing
              if (eventType === 'playing') {
                console.log(`Video is now playing, fading out mask with longer duration`);
                
                // For mobile devices, use a longer mask duration
                const maskDelay = deviceType === 'mobile' ? 1500 : 800;
                
                setTimeout(() => {
                  mask.style.opacity = '0';
                  setTimeout(() => {
                    mask.style.display = 'none';
                  }, 800); // Match with the CSS transition duration
                }, maskDelay);
              }
            });
          });
        };
        
        // Set up enhanced load events for both videos
        setupVideoLoadEvents(videoA, maskA);
        setupVideoLoadEvents(videoB, maskB);
        
        // Dispatch initial video1-fade-in event when video A is loaded
        videoA.addEventListener('loadeddata', () => {
          setTimeout(() => {
            console.log('Video A loaded, triggering video1-fade-in event');
            window.dispatchEvent(new CustomEvent('video1-fade-in'));
          }, 300);
        });
      };
      
      enhanceMaskTransitions();
      
      // Enhanced preloading mechanism for mobile devices
      const enhanceMobilePreloading = () => {
        if (deviceType === 'mobile') {
          console.log('Enhanced mobile preloading activated');
          
          // For mobile, modify the global preloaded videos tracking
          window.mobilePreloadedVideos = window.mobilePreloadedVideos || {};
          
          // Function to force preload all videos for better mobile experience
          const forcePreloadAllVideos = () => {
            console.log('Forcing preload of all videos for mobile');
            
            // Get video sources from SOURCES object defined in index.html
            const sources = window.SOURCES || {
              1: document.getElementById('videoA').src,
              2: document.getElementById('videoB').src
            };
            
            // Create hidden preloader elements with play button masking
            Object.entries(sources).forEach(([id, src]) => {
              if (window.mobilePreloadedVideos[id]) return;
              
              console.log(`Mobile-specific preloading of video ${id}`);
              
              // Create preloader wrapper with stronger masking
              const preloaderWrapper = document.createElement('div');
              preloaderWrapper.style.position = 'absolute';
              preloaderWrapper.style.left = '-9999px';
              preloaderWrapper.style.width = '1px';
              preloaderWrapper.style.height = '1px';
              preloaderWrapper.style.opacity = '0.01'; // Not zero to ensure it loads
              preloaderWrapper.style.overflow = 'hidden';
              preloaderWrapper.style.pointerEvents = 'none';
              preloaderWrapper.setAttribute('aria-hidden', 'true');
              preloaderWrapper.dataset.mobilePreloaderId = id;
              
              // Create iframe for preloading
              const hiddenPreloader = document.createElement('iframe');
              hiddenPreloader.src = src;
              hiddenPreloader.allow = 'autoplay';
              hiddenPreloader.setAttribute('muted', '');
              hiddenPreloader.setAttribute('playsinline', '');
              hiddenPreloader.style.width = '100%';
              hiddenPreloader.style.height = '100%';
              hiddenPreloader.style.border = 'none';
              
              // Create mask to hide play button
              const mask = document.createElement('div');
              mask.style.position = 'absolute';
              mask.style.inset = '0';
              mask.style.backgroundColor = '#000';
              mask.style.zIndex = '999';
              
              preloaderWrapper.appendChild(hiddenPreloader);
              preloaderWrapper.appendChild(mask);
              document.body.appendChild(preloaderWrapper);
              
              // Mark as preloaded for mobile
              window.mobilePreloadedVideos[id] = true;
            });
          };
          
          // Force preload on various user interactions to work around mobile restrictions
          const interactionEvents = ['touchstart', 'click', 'scroll'];
          const preloadOnceHandler = () => {
            forcePreloadAllVideos();
            // Remove event listeners after first interaction
            interactionEvents.forEach(evt => {
              window.removeEventListener(evt, preloadOnceHandler);
            });
          };
          
          // Add event listeners for user interaction
          interactionEvents.forEach(evt => {
            window.addEventListener(evt, preloadOnceHandler, { once: true });
          });
          
          // Also try to preload immediately (may work on some devices)
          setTimeout(forcePreloadAllVideos, 500);
        }
      };
      
      enhanceMobilePreloading();
      
      // Enhance any crossfadeTo function that exists in global scope
      if (window.crossfadeTo) {
        const originalCrossfadeTo = window.crossfadeTo;
        window.crossfadeTo = function(id, options = {}) {
          // Call original function
          const result = originalCrossfadeTo.call(this, id, options);
          
          // Enhance mask handling for mobile specifically
          if (deviceType === 'mobile') {
            const { nextLayer, nextVideo, nextMask } = window.getNextLayerElements ? 
              window.getNextLayerElements() : 
              { nextMask: id === 1 ? maskA : maskB };
              
            // For mobile, always show mask and wait longer
            if (nextMask) {
              console.log(`Mobile-specific mask handling for video ${id}`);
              nextMask.style.opacity = '1';
              nextMask.style.display = 'block';
              
              // Extend the mask duration to ensure play button is gone
              setTimeout(() => {
                nextMask.style.opacity = '0';
                setTimeout(() => nextMask.style.display = 'none', 800);
              }, 2000);
            }
          }
          
          return result;
        };
      }
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
    
    // Add responsive handling for videos based on device type
    const optimizeVideoForDevice = () => {
      const videos = document.querySelectorAll('video');
      const iframes = document.querySelectorAll('iframe');
      
      // Apply optimizations to traditional video elements if present
      videos.forEach(video => {
        // Set quality/resolution based on device type
        if (deviceType === 'mobile') {
          // Optimize for mobile - lower playback quality to save bandwidth
          if (video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')) {
            video.style.objectFit = 'cover';
            // Prioritize performance on mobile
            video.setAttribute('playsinline', '');
            video.setAttribute('preload', 'auto'); // Force preloading
          }
        } else {
          // Higher quality for tablets/desktop
          video.style.objectFit = 'cover';
        }
      });
      
      // Apply optimizations to iframe video elements
      iframes.forEach(iframe => {
        if (deviceType === 'mobile') {
          // Add additional attributes to assist with mobile playback
          iframe.setAttribute('playsinline', '');
          
          // Apply custom mask over iframes specifically for mobile
          const parent = iframe.parentElement;
          if (parent && parent.classList.contains('layer')) {
            const existingMask = parent.querySelector('.video-mask');
            if (existingMask) {
              // Extend the duration for which masks are shown on mobile
              existingMask.style.transition = "opacity 0.8s ease-out";
              existingMask.style.opacity = '1';
              existingMask.style.display = 'block';
            }
          }
        }
      });
    };
    
    optimizeVideoForDevice();
    
    // Reapply video optimizations on orientation change
    const handleOrientationChange = () => {
      console.log('Orientation changed, reapplying video optimizations');
      setTimeout(() => {
        optimizeVideoForDevice();
        
        // Re-preload videos on orientation change for mobile
        if (deviceType === 'mobile' && window.mobilePreloadedVideos) {
          Object.keys(window.mobilePreloadedVideos).forEach(id => {
            window.mobilePreloadedVideos[id] = false;
          });
          
          // Trigger preload again after orientation change
          const event = new Event('orientationpreload');
          window.dispatchEvent(event);
        }
      }, 300);
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [deviceType]);
  
  // This component doesn't render anything as the video elements
  // are already in the index.html file
  return null;
};

export default VideoBackground;
