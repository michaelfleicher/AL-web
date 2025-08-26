/**
 * Video Helper Script
 * Enhances video playback and preloading, especially for mobile devices
 * Prevents play buttons from appearing during transitions
 */

(function() {
  // Store device type detection
  let isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Track all videos that need enhanced masking
  let maskedVideos = {};
  
  // Enhanced video preloading for mobile
  function enhanceVideoPreloading() {
    console.log('Enhancing video preloading, mobile: ' + isMobile);
    
    // Get all available video sources
    const sources = window.SOURCES || {};
    if (Object.keys(sources).length === 0) {
      console.warn('No SOURCES object found for preloading');
      return;
    }
    
    // Get all the videos that should be preloaded
    // For mobile, preload all videos immediately
    const videosToPreload = isMobile ? 
      Object.keys(sources) : 
      [1, 2]; // On desktop, only preload first two initially
    
    // Enhanced preload function with robust masking
    window.enhancedPreloadVideo = function(id, priority = 'high') {
      if (!sources[id]) return;
      
      console.log(`Enhanced preloading of video ${id}, priority: ${priority}`);
      
      // Create multiple resource hints
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.href = sources[id];
      preloadLink.as = 'iframe';
      preloadLink.importance = priority;
      document.head.appendChild(preloadLink);
      
      const prefetchLink = document.createElement('link');
      prefetchLink.rel = 'prefetch';
      prefetchLink.href = sources[id];
      document.head.appendChild(prefetchLink);
      
      // For mobile, use more aggressive preloading technique
      if (isMobile) {
        // Create a hidden container with iframe
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '-9999px';
        container.style.left = '-9999px';
        container.style.width = '10px';
        container.style.height = '10px';
        container.style.opacity = '0.01';
        container.style.overflow = 'hidden';
        container.style.pointerEvents = 'none';
        container.dataset.preloadId = id;
        
        // Create preload iframe
        const iframe = document.createElement('iframe');
        iframe.src = sources[id];
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.allow = 'autoplay';
        iframe.setAttribute('playsinline', '');
        iframe.setAttribute('muted', '');
        
        // Create mask over iframe to hide play button
        const mask = document.createElement('div');
        mask.style.position = 'absolute';
        mask.style.inset = '0';
        mask.style.backgroundColor = '#000';
        mask.style.zIndex = '999';
        
        container.appendChild(iframe);
        container.appendChild(mask);
        document.body.appendChild(container);
        
        // Track this video for masking purposes
        maskedVideos[id] = {
          container,
          iframe,
          mask
        };
      }
    };
    
    // Preload videos based on device type
    videosToPreload.forEach(id => {
      // Stagger preloading to avoid overwhelming the browser
      setTimeout(() => {
        window.enhancedPreloadVideo(id, 'high');
      }, isMobile ? id * 300 : id * 600);
    });
    
    // If original preloadVideo exists, enhance it
    if (window.preloadVideo) {
      const originalPreloadVideo = window.preloadVideo;
      window.preloadVideo = function(id, priority) {
        // Call both the original and our enhanced version
        originalPreloadVideo(id, priority);
        window.enhancedPreloadVideo(id, priority);
      };
    }
  }
  
  // Enhanced masking for video elements
  function enhanceVideoMasking() {
    console.log('Enhancing video masking');
    
    // Get all mask elements
    const masks = document.querySelectorAll('.video-mask');
    
    // Apply enhanced masking styles
    masks.forEach(mask => {
      // Use longer transition for smoother fade
      mask.style.transition = isMobile ? 
        "opacity 1s ease-in-out" : 
        "opacity 0.7s ease-out";
      
      // Initially all masks should be visible
      mask.style.opacity = '1';
      mask.style.display = 'block';
    });
    
    // Add special masking for main video containers
    const layers = document.querySelectorAll('.layer');
    layers.forEach(layer => {
      const iframe = layer.querySelector('iframe');
      const mask = layer.querySelector('.video-mask');
      
      if (iframe && mask) {
        // Handle iframe load events
        iframe.addEventListener('load', () => {
          console.log(`Iframe loaded in layer ${layer.id}`);
          
          // Wait longer on mobile to ensure play button is hidden
          const maskDuration = isMobile ? 2000 : 1000;
          
          setTimeout(() => {
            mask.style.opacity = '0';
            setTimeout(() => {
              mask.style.display = 'none';
            }, 1000);
          }, maskDuration);
        });
      }
    });
  }
  
  // Override crossfadeTo function if it exists
  function enhanceCrossfade() {
    if (window.crossfadeTo) {
      console.log('Enhancing crossfade function');
      
      // Store original function
      const originalCrossfadeTo = window.crossfadeTo;
      
      // Replace with enhanced version
      window.crossfadeTo = function(id, options = {}) {
        console.log(`Enhanced crossfade to video ${id}`);
        
        // Get layers before calling original function
        const nextLayer = window.activeLayer === 'A' ? 'layerB' : 'layerA';
        const nextMaskId = window.activeLayer === 'A' ? 'maskB' : 'maskA';
        const nextMask = document.getElementById(nextMaskId);
        
        // Always show mask before transition
        if (nextMask) {
          nextMask.style.opacity = '1';
          nextMask.style.display = 'block';
        }
        
        // Call original function
        const result = originalCrossfadeTo.call(this, id, options);
        
        // Apply additional masking for longer period, especially on mobile
        if (nextMask) {
          const maskDuration = isMobile ? 2500 : 1500;
          
          setTimeout(() => {
            nextMask.style.opacity = '0';
            setTimeout(() => {
              if (nextMask) nextMask.style.display = 'none';
            }, 1000);
          }, maskDuration);
        }
        
        return result;
      };
    }
  }
  
  // Initialize on document load
  function initVideoHelper() {
    console.log('Video helper initializing');
    enhanceVideoPreloading();
    enhanceVideoMasking();
    enhanceCrossfade();
    
    // Handle user interactions to trigger preloading
    const interactions = ['touchstart', 'click', 'scroll'];
    
    const triggerPreload = () => {
      console.log('User interaction detected, ensuring videos are preloaded');
      
      // Preload all videos on interaction
      if (window.SOURCES) {
        Object.keys(window.SOURCES).forEach(id => {
          window.enhancedPreloadVideo(id, 'high');
        });
      }
      
      // Remove event listeners after first interaction
      interactions.forEach(evt => {
        document.removeEventListener(evt, triggerPreload);
      });
    };
    
    // Add event listeners
    interactions.forEach(evt => {
      document.addEventListener(evt, triggerPreload);
    });
  }
  
  // Run when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoHelper);
  } else {
    initVideoHelper();
  }
})();
