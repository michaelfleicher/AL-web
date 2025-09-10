import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./fonts.css";
import "./ScrambledText.css";

// Helper function to get a random character from the scramble chars string
const getRandomChar = (chars) => {
  return chars.charAt(Math.floor(Math.random() * chars.length));
};

// Helper function to get a random number between min and max (inclusive)
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Using Roboto font for consistent, clean appearance
const ScrambledText = ({
  radius = 30,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = ":.",
  className = "",
  style = {},
  children,
}) => {
  // Generate a unique ID for this instance for debugging
  const instanceId = useRef(`scramble-${Math.floor(Math.random() * 10000)}`);
  console.log(
    `Initializing ScrambledText instance ${instanceId.current} with className: ${className}`
  );
  const rootRef = useRef(null);
  const charsRef = useRef([]);
  const animationsRef = useRef(new Map());
  const [isVisible, setIsVisible] = useState(true);
  const initialLoadRef = useRef(true); // Track if this is the initial page load
  const scrambleIntervalRef = useRef(null); // Track the scrambling interval
  const hasFadeoutBeenHandled = useRef(false); // Track if we've handled the mask fadeout event
  const hasPlayedInitialAnimation = useRef(false); // Track if we've played the initial animation
  const autoScrambleIntervalRef = useRef(null); // Track the auto scramble interval
  const currentVideo = useRef(1); // Track current video being displayed

  // Listen for video transition events
  useEffect(() => {
    // Handler for when video 1 is fading out
    const handleVideo1FadeOut = () => {
      // Only respond if we're not in initial loading state
      if (initialLoadRef.current) return;

      console.log(
        "ScrambledText: Video 1 is fading out with scramble animation"
      );
      currentVideo.current = 0; // Track that we're transitioning out of video 1

      // Stop auto scramble interval if it's running
      if (autoScrambleIntervalRef.current) {
        clearInterval(autoScrambleIntervalRef.current);
        autoScrambleIntervalRef.current = null;
      }

      // Start scrambling the text again
      if (charsRef.current && charsRef.current.length > 0) {
        // First, ensure all characters are re-scrambled
        charsRef.current.forEach((el) => {
          if (el && el.dataset && el.dataset.content) {
            el.textContent = getRandomChar(scrambleChars);
          }
        });

        // Start a new scrambling interval that will continue during fadeout
        if (scrambleIntervalRef.current) {
          clearInterval(scrambleIntervalRef.current);
        }

        // Create scramble effect during fadeout
        scrambleIntervalRef.current = setInterval(() => {
          // Randomly update characters for a scrambling effect
          if (charsRef.current && charsRef.current.length > 0) {
            charsRef.current.forEach((el) => {
              if (el && el.dataset && el.dataset.content) {
                // Higher chance to update each character for more noticeable effect
                if (Math.random() > 0.5) {
                  el.textContent = getRandomChar(scrambleChars);
                }
              }
            });
          }
        }, 80); // Slightly faster updates for more visible effect
      }

      // Fade out the text container while scrambling
      if (rootRef.current) {
        gsap.to(rootRef.current, {
          opacity: 0,
          duration: 1,
          ease: "power2.out",
          onComplete: () => {
            // Clean up scramble interval when fadeout is complete
            if (scrambleIntervalRef.current) {
              clearInterval(scrambleIntervalRef.current);
              scrambleIntervalRef.current = null;
            }
            setIsVisible(false);
          },
        });
      }
    };

    // Handler for when video 1 is fading in
    const handleVideo1FadeIn = () => {
      console.log("ScrambledText: Video 1 is fading in, showing text");

      // Mark that we're on video 1
      currentVideo.current = 1;

      // Make sure text is visible first
      setIsVisible(true);

      // Only proceed if we have elements in the DOM
      if (!rootRef.current) return;

      // For non-initial loads, show with scramble effect similar to initial load
      if (!initialLoadRef.current) {
        // First set all characters to scrambled state
        if (charsRef.current && charsRef.current.length > 0) {
          charsRef.current.forEach((el) => {
            if (el && el.dataset && el.dataset.content) {
              el.textContent = getRandomChar(scrambleChars);
            }
          });
        }

        // Give the browser a moment to update the DOM and measure elements
        setTimeout(() => {
          // First make the container visible with scrambled text
          if (rootRef.current) {
            // Fade in quickly
            gsap.to(rootRef.current, {
              opacity: 1,
              duration: 0.3,
              ease: "power1.in",
              onComplete: () => {
                // Then play animations to reveal static text
                playAllAnimations();

                // After the animation completes, start the auto-scramble effect
                setTimeout(() => {
                  // Start the auto scramble effect only if we're still on video 1
                  if (currentVideo.current === 1) {
                    startAutoScramble();
                  }
                }, 500); // Give a short delay after the reveal animation
              },
            });
          }
        }, 100);
      }
    };

    // Handler for initial video mask fade-out - THE ONLY PLACE WE SHOULD TRANSITION FROM SCRAMBLED TO STATIC
    const handleInitialMaskFadeOut = () => {
      // Prevent handling this event multiple times
      if (hasFadeoutBeenHandled.current) return;
      hasFadeoutBeenHandled.current = true;

      console.log(
        "ScrambledText: Initial video mask is fading out - THIS IS THE ONLY TRANSITION TO STATIC"
      );

      // Mark that we're on video 1
      currentVideo.current = 1;

      // After mask fades out, transition to static text with animation
      setTimeout(() => {
        console.log(
          "ScrambledText: Transitioning to static mode after initial mask fadeout"
        );

        // Stop the scrambling effect
        if (scrambleIntervalRef.current) {
          clearInterval(scrambleIntervalRef.current);
          scrambleIntervalRef.current = null;
        }

        // Play animation to transition from scrambled to normal text
        playAllAnimations();

        // Mark initial load complete
        initialLoadRef.current = false;

        // After the main animation completes, start the auto-scramble effect
        setTimeout(() => {
          // Start the auto scramble effect only if we're still on video 1
          if (currentVideo.current === 1) {
            startAutoScramble();
          }
        }, 1500); // Give a short delay after the reveal animation
      }, 450); // Increased delay after mask fades out for better timing
    };

    // Add event listeners
    window.addEventListener("video1-fade-out", handleVideo1FadeOut);
    window.addEventListener("video1-fade-in", handleVideo1FadeIn);

    // Listen for video mask fade-out event
    console.log(
      "ScrambledText: Setting up listener for video-mask-fadeout event"
    );
    window.addEventListener("video-mask-fadeout", handleInitialMaskFadeOut);

    // Clean up listeners when component unmounts
    return () => {
      window.removeEventListener("video1-fade-out", handleVideo1FadeOut);
      window.removeEventListener("video1-fade-in", handleVideo1FadeIn);
      window.removeEventListener(
        "video-mask-fadeout",
        handleInitialMaskFadeOut
      );

      // Clean up scramble interval if it exists
      if (scrambleIntervalRef.current) {
        clearInterval(scrambleIntervalRef.current);
      }

      // Clean up auto-scramble interval if it exists
      if (autoScrambleIntervalRef.current) {
        clearInterval(autoScrambleIntervalRef.current);
      }
    };
  }, []); // Empty dependency array is intentional - only run once on mount

  // Initialize the text splitting and setup
  useEffect(() => {
    console.log("ScrambledText useEffect triggered");
    if (!rootRef.current) return;

    // Make text visible immediately
    rootRef.current.style.opacity = "1";
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
    measureDiv.style.letterSpacing = fontStyle.letterSpacing || "0.01em"; // Ensure proper letter spacing
    measureDiv.style.fontKerning = "normal"; // Enable kerning for measurement
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
        span.style.fontFamily = "'Roboto', sans-serif"; // Explicitly set Roboto font

        // Measure the character width in Roboto font
        measureDiv.textContent = char;
        let width = measureDiv.getBoundingClientRect().width;

        // Ensure consistent spacing for Roboto readability

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
        },
      });

      // Custom scramble animation without the plugin
      const scrambleDuration = duration * 0.8;
      const scrambleSteps = 10;
      const stepDuration = scrambleDuration / scrambleSteps;

      // Add initial state - no delay by default, we'll control timing at playback
      tl.set(el, {
        innerHTML: getRandomChar(scrambleChars),
      });

      // Add scramble steps
      for (let i = 0; i < scrambleSteps - 1; i++) {
        tl.to(el, {
          duration: stepDuration,
          innerHTML: getRandomChar(scrambleChars),
          ease: "none",
          immediateRender: false,
        });
      }

      // Final reveal
      tl.to(el, {
        duration: stepDuration,
        innerHTML: originChar,
        ease: "power1.inOut",
        immediateRender: false,
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

    // Start with scrambling for initial page load WITHOUT transitioning to static
    const startInitialScrambling = () => {
      console.log(
        "Starting initial scrambling effect immediately - keeping in scrambled state until mask fades out"
      );

      // Make component visible first and ensure it's in the DOM
      if (rootRef.current) {
        rootRef.current.style.opacity = "1";
        rootRef.current.style.visibility = "visible";
      }

      // Set all characters to scrambled state initially
      if (charsRef.current && charsRef.current.length > 0) {
        charsRef.current.forEach((el) => {
          if (el && el.dataset && el.dataset.content) {
            el.textContent = getRandomChar(scrambleChars);
          }
        });
      }

      // ONLY create a scrambling interval for the initial page load
      if (initialLoadRef.current) {
        // Clear any existing interval
        if (scrambleIntervalRef.current) {
          clearInterval(scrambleIntervalRef.current);
        }

        // Start a new scrambling interval that will continue until explicitly stopped
        // Use a faster update interval to make the scrambling more noticeable immediately
        scrambleIntervalRef.current = setInterval(() => {
          // Randomly update characters for a scrambling effect
          if (charsRef.current && charsRef.current.length > 0) {
            charsRef.current.forEach((el) => {
              if (el && el.dataset && el.dataset.content) {
                // 50% chance to update each character for a more active initial effect
                if (Math.random() > 0.5) {
                  el.textContent = getRandomChar(scrambleChars);
                }
              }
            });
          }
        }, 80);

        // Dispatch an event for other components that may listen
        const initialLoadEvent = new CustomEvent("text-initialized");
        window.dispatchEvent(initialLoadEvent);
      }
    };

    // Start scrambling immediately
    startInitialScrambling();

    // Cleanup function
    return () => {
      // Ensure no lingering animations - use stored ref
      if (animationsMapRef.current) {
        animationsMapRef.current.forEach((tl) => {
          if (tl.kill) tl.kill();
        });
      }
    };
  }, [children, radius, duration, speed, scrambleChars]);

  // Function to play animations on all characters (transition from scrambled to normal)
  const playAllAnimations = () => {
    // For initial load, ensure we only run this once to avoid multiple transitions
    if (initialLoadRef.current) {
      if (hasPlayedInitialAnimation.current) {
        console.log("Skipping duplicate animation during initial load");
        return;
      }
      hasPlayedInitialAnimation.current = true;
    }

    if (animationsRef.current && rootRef.current) {
      console.log("Playing animations to reveal final text");

      // Record the time when animation completes
      window.initialAnimationCompletedTime = Date.now();

      // Stop any ongoing scrambling
      if (scrambleIntervalRef.current) {
        clearInterval(scrambleIntervalRef.current);
        scrambleIntervalRef.current = null;
      }

      // Ensure text container is visible before animations
      if (rootRef.current) {
        // Make sure it's visible in the DOM
        rootRef.current.style.opacity = "1";
        rootRef.current.style.visibility = "visible";
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

  // Function to start the auto-scramble animation that occurs every 4 seconds
  const startAutoScramble = () => {
    // Clear any existing interval first
    if (autoScrambleIntervalRef.current) {
      clearInterval(autoScrambleIntervalRef.current);
    }

    console.log("Starting auto-scramble animation every 4 seconds");

    // Set up the interval to run every 4 seconds
    autoScrambleIntervalRef.current = setInterval(() => {
      // Enhanced checks for component health
      if (
        currentVideo.current !== 1 ||
        !charsRef.current ||
        charsRef.current.length === 0 ||
        !rootRef.current ||
        !document.contains(rootRef.current)
      ) {
        clearInterval(autoScrambleIntervalRef.current);
        autoScrambleIntervalRef.current = null;
        return;
      }

      // Get a random number of characters to animate (between 2 and 12)
      const numCharsToAnimate = getRandomInt(2, 12);

      // Get random indices of characters to animate
      const allIndices = Array.from(
        { length: charsRef.current.length },
        (_, i) => i
      );
      const shuffledIndices = allIndices.sort(() => Math.random() - 0.5);
      const indicesToAnimate = shuffledIndices.slice(0, numCharsToAnimate);

      // Animate these characters
      indicesToAnimate.forEach((idx) => {
        const el = charsRef.current[idx];
        if (!el || !el.dataset || !el.dataset.content) return;

        const originalChar = el.dataset.content;

        // Create a mini scramble animation for this character
        const scrambleDuration = 0.8; // Total duration of scramble effect
        const numSteps = 4; // Number of character changes

        // Start the character animation
        let step = 0;
        const charInterval = setInterval(() => {
          step++;

          if (step < numSteps) {
            // Show scrambled character
            el.textContent = getRandomChar(scrambleChars);
          } else {
            // Final step - restore original character
            el.textContent = originalChar;
            clearInterval(charInterval);
          }
        }, (scrambleDuration * 2000) / numSteps);
      });
    }, 8000); // Run every 8 seconds
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

  // Throttle mouse interactions for performance
  const lastMouseMoveRef = useRef(0);
  const MOUSE_THROTTLE_MS = 100; // Limit to 10fps

  // Function to handle mouse move with throttling
  const handleMouseMove = (e) => {
    const now = Date.now();

    // Throttle mouse moves to prevent excessive calculations
    if (now - lastMouseMoveRef.current < MOUSE_THROTTLE_MS) {
      return;
    }
    lastMouseMoveRef.current = now;

    // Skip mouse interactions during initial loading phase or if scrambling is still active
    if (initialLoadRef.current || scrambleIntervalRef.current) {
      return;
    }

    // Also skip for a short time after initial load completes to avoid accidental triggers
    if (hasPlayedInitialAnimation.current) {
      const timeSinceInitialAnimation =
        Date.now() - (window.initialAnimationCompletedTime || 0);
      if (timeSinceInitialAnimation < 1000) {
        // 1 second cooldown after initial animation
        return;
      }
    }

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
        if (!initialLoadRef.current) {
          playAllAnimations();
        }
      }, 200);
    }
  }, [isVisible]);

  return (
    <div
      ref={rootRef}
      className={`text-block ${className}`}
      style={{
        ...style,
        transition: "opacity 0.3s ease", // Faster transition
        opacity: 1, // Start with opacity 1 to be immediately visible
        visibility: isVisible ? "visible" : "hidden", // Use visibility alongside opacity
        willChange: "opacity", // Optimize for animations
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Content will be generated here */}
    </div>
  );
};

export default ScrambledText;
