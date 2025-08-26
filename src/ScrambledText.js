import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./fonts.css";
import "./ScrambledText.css";

// Helper function to get a random character from the scramble chars string
const getRandomChar = (chars) => {
  return chars.charAt(Math.floor(Math.random() * chars.length));
};

// Using OCR-A-Std font which is monospaced for better consistency
const ScrambledText = ({
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = ":.",
  className = "",
  style = {},
  children,
}) => {
  // Generate a unique ID for this instance for debugging
  const instanceId = useRef(`scramble-${Math.floor(Math.random() * 10000)}`);
  console.log(`Initializing ScrambledText instance ${instanceId.current} with className: ${className}`);
  const rootRef = useRef(null);
  const charsRef = useRef([]);
  const animationsRef = useRef(new Map());
  const [isVisible, setIsVisible] = useState(true);

  // Listen for video transition events
  useEffect(() => {
    // Handler for when video 1 is fading out
    const handleVideo1FadeOut = () => {
      console.log("ScrambledText: Video 1 is fading out, hiding text");
      // Fade out the text container
      if (rootRef.current) {
        gsap.to(rootRef.current, {
          opacity: 0,
          duration: 1,
          ease: "power2.out"
        });
        setIsVisible(false);
      }
    };

    // Handler for when video 1 is fading in
    const handleVideo1FadeIn = () => {
      console.log("ScrambledText: Video 1 is fading in, showing text");
      
      // Make sure text is visible first
      setIsVisible(true);
      
      // Only proceed if we have elements in the DOM
      if (!rootRef.current) return;
      
      // Force reset all characters to their original state
      if (charsRef.current && charsRef.current.length > 0) {
        charsRef.current.forEach(el => {
          if (el && el.dataset && el.dataset.content) {
            el.textContent = el.dataset.content;
          }
        });
      }
      
      // Give the browser a moment to update the DOM and measure elements
      setTimeout(() => {
        // Then trigger scramble animations
        if (rootRef.current) {
          // Fade in first
          gsap.to(rootRef.current, {
            opacity: 1,
            duration: 0.3,
            ease: "power1.in",
            onComplete: () => {
              // Then start animation after fade in - full animation
              playAllAnimations();
            }
          });
        }
      }, 100);
    };

    // Add event listeners
    window.addEventListener('video1-fade-out', handleVideo1FadeOut);
    window.addEventListener('video1-fade-in', handleVideo1FadeIn);

    // Clean up listeners when component unmounts
    return () => {
      window.removeEventListener('video1-fade-out', handleVideo1FadeOut);
      window.removeEventListener('video1-fade-in', handleVideo1FadeIn);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize the text splitting and setup
  useEffect(() => {
    console.log("ScrambledText useEffect triggered");
    if (!rootRef.current) return;

    // First, ensure text is not visible during initial setup
    rootRef.current.style.opacity = '0';
    setIsVisible(true);
    
    // Store animations reference for cleanup
    const animationsMapRef = animationsRef;

    // Create paragraph element if it doesn't exist
    if (!rootRef.current.querySelector("p")) {
      const p = document.createElement("p");
      p.textContent = children;
      rootRef.current.appendChild(p);
    }

    const container = rootRef.current.querySelector("p");
    container.innerHTML = ""; // Clear any existing content

    // Get content as string
    const content = typeof children === "string" ? children : String(children);
    
    // First, get the font metrics to ensure consistent character sizing
    // Get font properties for consistent sizing
    const fontStyle = window.getComputedStyle(container);
    
    // Create a word-level handling approach
    const words = content.split(" ");
    let elements = [];
    
    // Create a measurement div once for all characters
    const measureDiv = document.createElement("div");
    measureDiv.style.visibility = "hidden";
    measureDiv.style.position = "absolute";
    measureDiv.style.fontSize = fontStyle.fontSize;
    measureDiv.style.fontFamily = "'Roboto', sans-serif"; // Use Roboto font
    measureDiv.style.fontWeight = fontStyle.fontWeight;
    measureDiv.style.letterSpacing = fontStyle.letterSpacing || '0.01em'; // Ensure proper letter spacing
    measureDiv.style.fontKerning = 'normal'; // Enable kerning for measurement
    measureDiv.style.fontFeatureSettings = '"kern" 1'; // Enable kerning feature
    measureDiv.style.whiteSpace = "pre";
    document.body.appendChild(measureDiv);
    
    words.forEach((word, wordIndex) => {
      // Create a wrapper for each word to keep it together
      const wordWrapper = document.createElement("span");
      wordWrapper.className = "word-wrapper";
      wordWrapper.style.display = "inline-block";
      wordWrapper.style.whiteSpace = "nowrap"; // Ensure word stays together
      wordWrapper.style.letterSpacing = "0.01em"; // Add letter spacing for Roboto font
      wordWrapper.style.marginRight = "0.5em"; // Standard space between words
      container.appendChild(wordWrapper);
      
      // Process each character in the word
      const wordChars = word.split("");
      const wordElements = wordChars.map((char, charIndex) => {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = char;
        span.style.display = "inline-block";
        span.style.position = "relative";
        
        // Measure the character - OCR-A-Std is monospace so all characters have the same width
        measureDiv.textContent = char;
        let width = measureDiv.getBoundingClientRect().width;
        
        // Roboto needs consistent spacing for readability
        
        // Apply width with a bit of padding for consistent display
        span.style.width = `${width + 1}px`; // Add 1 pixel to prevent overlap
        span.style.height = "1em";
        span.style.textAlign = "center"; // Center the text within its container
        span.style.fontKerning = "none"; // Disable kerning for each character
        span.style.fontFeatureSettings = '"kern" 0'; // Disable kerning feature
        
        // Store the original character
        span.dataset.content = char;
        
        wordWrapper.appendChild(span);
        return span;
      });
      
      elements = [...elements, ...wordElements];
    });
    
    // Remove the measurement div as it's no longer needed
    document.body.removeChild(measureDiv);
    
    // Set up GSAP animations for each character
    charsRef.current = elements;
    
    // Initialize the scramble animation for each character
    elements.forEach((el, index) => {
      const originChar = el.dataset.content;
      let isRevealed = false;
      
      // Create a timeline for this character
      const tl = gsap.timeline({ 
        paused: true,
        onComplete: () => {
          if (!isRevealed) {
            el.textContent = originChar;
            isRevealed = true;
          }
        }
      });
      
      // Custom scramble animation without the plugin
      const scrambleDuration = duration * 0.8;
      const scrambleSteps = 10;
      const stepDuration = scrambleDuration / scrambleSteps;
      
      // Add initial state - no delay by default, we'll control timing at playback
      tl.set(el, { 
        innerHTML: getRandomChar(scrambleChars)
      });
      
      // Add scramble steps
      for (let i = 0; i < scrambleSteps - 1; i++) {
        tl.to(el, {
          duration: stepDuration,
          innerHTML: getRandomChar(scrambleChars),
          ease: "none",
          immediateRender: false
        });
      }
      
      // Final reveal
      tl.to(el, {
        duration: stepDuration,
        innerHTML: originChar,
        ease: "power1.inOut",
        immediateRender: false
      });
      
      // Store the timeline
      animationsRef.current.set(el, tl);
    });
    
    // Ensure ALL characters start scrambled
    elements.forEach((el, index) => {
      if (el && el.dataset && el.dataset.content) {
        // Always start scrambled - no exceptions
        el.textContent = getRandomChar(scrambleChars);
      }
    });
    
    // Trigger an initial animation with a shorter delay
    const initialAnimationTimeout = setTimeout(() => {
      console.log("Running initial scramble animation");
      
      // First make the component visible
      if (rootRef.current) {
        rootRef.current.style.opacity = '1';
      }
      
      // Short delay after becoming visible before starting animation
      setTimeout(() => {
        // Do a direct animation instead of event (more reliable)
        playAllAnimations();
        
        // Also dispatch an event for other components that may listen
        const initialLoadEvent = new CustomEvent('text-initialized');
        window.dispatchEvent(initialLoadEvent);
      }, 100);
    }, 300);
    
    // Cleanup function
    return () => {
      clearTimeout(initialAnimationTimeout);
      // Ensure no lingering animations - use stored ref
      if (animationsMapRef.current) {
        animationsMapRef.current.forEach((tl) => {
          if (tl.kill) tl.kill();
        });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, radius, duration, speed, scrambleChars]);
  
  // Function to play animations on all characters (for initialization)
  const playAllAnimations = () => {
    if (animationsRef.current && rootRef.current) {
      console.log("Playing animations on ALL characters");
      
      // Ensure text container is visible before animations
      if (rootRef.current) {
        // Make sure it's visible in the DOM
        rootRef.current.style.opacity = '1';
        rootRef.current.style.visibility = 'visible';
      }
      
      // Double-check state alignment
      if (!isVisible) return;
      
      let index = 0;
      const totalChars = animationsRef.current.size;
      
      // Animate all characters with sequential delays
      animationsRef.current.forEach((tl, el) => {
        if (el && el.dataset && el.dataset.content) {
          // Ensure all characters start scrambled
          el.textContent = getRandomChar(scrambleChars);
          
          // Use sequential delay for smoother wave effect
          const delay = (index / totalChars) * (speed * 1.5);
          index++;
          
          // Play the animation
          tl.pause();
          tl.seek(0);
          tl.delay(delay);
          tl.restart();
        }
      });
    }
  };
  
  // Function to play animations around a specific point
  const playAnimationsAroundPoint = (x, y) => {
    if (animationsRef.current && rootRef.current) {
      console.log("Starting animations around point", x, y);
      
      // Only proceed if text is visible
      if (!isVisible) return;
      
      // Special case: if coordinates are centered and this is likely an initial load
      // or video transition, animate ALL characters
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // If we're within 20px of center, this is likely an automated event (not mouse)
      if (Math.abs(x - centerX) < 20 && Math.abs(y - centerY) < 20) {
        playAllAnimations();
        return;
      }
      
      // For mouse hover, only animate characters within radius
      animationsRef.current.forEach((tl, el) => {
        if (el && el.dataset && el.dataset.content) {
          // Get the element's position
          const elementRect = el.getBoundingClientRect();
          
          // If element has no size yet, skip it
          if (elementRect.width === 0 || elementRect.height === 0) return;
          
          const elementCenterX = elementRect.left + elementRect.width / 2;
          const elementCenterY = elementRect.top + elementRect.height / 2;
          
          // Calculate distance from cursor
          const distX = elementCenterX - x;
          const distY = elementCenterY - y;
          const distance = Math.sqrt(distX * distX + distY * distY);
          
          if (distance <= radius) {
            // Only animate characters within radius for mouse hover
            el.textContent = getRandomChar(scrambleChars);
            
            // Calculate delay based on distance (farther = more delay)
            const normalizedDist = Math.min(distance / radius, 1);
            const delay = normalizedDist * speed;
            
            // Set delay and then play
            tl.pause();
            tl.seek(0);
            tl.delay(delay);
            tl.restart();
          }
        }
      });
    }
  };
  
  // Function to handle mouse move
  const handleMouseMove = (e) => {
    // Get mouse position relative to the document
    const x = e.clientX;
    const y = e.clientY;
    
    // Play animations around the mouse position
    playAnimationsAroundPoint(x, y);
  };

  // Ensure we have a proper initialization when we're first becoming visible
  useEffect(() => {
    if (isVisible && rootRef.current) {
      // Short delay to ensure everything is ready
      setTimeout(() => {
        // Use the full animation for visibility changes
        playAllAnimations();
      }, 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);
  
  return (
    <div 
      ref={rootRef} 
      className={`text-block ${className}`}
      style={{
        ...style,
        transition: 'opacity 0.5s ease',
        opacity: 0, // Start with opacity 0 to avoid flicker
        visibility: isVisible ? 'visible' : 'hidden', // Use visibility alongside opacity
        willChange: 'opacity' // Optimize for animations
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Content will be generated here */}
    </div>
  );
};

export default ScrambledText;
