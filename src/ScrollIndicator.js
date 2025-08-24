import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './ScrollIndicator.css';

const ScrollIndicator = () => {
  const arrowRef = useRef(null);
  const timelineRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [video1Active, setVideo1Active] = useState(false);
  const [initialDelayComplete, setInitialDelayComplete] = useState(false);

  useEffect(() => {
    let blinkingAnimation;
    let scrollHandler;
    let video1FadeInHandler;
    let video1FadeOutHandler;
    
    // Set up the initial 8-second delay timer on component mount
    const initialDelay = setTimeout(() => {
      setInitialDelayComplete(true);
      console.log("ScrollIndicator: Initial 8-second delay complete");
    }, 8000);

    video1FadeInHandler = () => {
      setVideo1Active(true);
    };
    video1FadeOutHandler = () => {
      // Immediately hide the arrow when switching from video 1, regardless of animation state
      setVideo1Active(false);
      if (arrowRef.current) {
        // Use a shorter duration for faster fade out
        gsap.to(arrowRef.current, { opacity: 0, duration: 0.2, ease: "power1.in" });
      }
      if (timelineRef.current) {
        timelineRef.current.pause();
      }
    };
    window.addEventListener('video1-fade-in', video1FadeInHandler);
    window.addEventListener('video1-fade-out', video1FadeOutHandler);

    // Handle text initialization event (when scramble text is done loading)
    const handleTextInitialized = () => {
      console.log("ScrollIndicator: Text initialized, waiting for initial delay");
      
      // Create blinking animation after the arrow is visible with more intensity
      // and add a pulsating effect for more visibility
      const setupArrowAnimation = () => {
        const arrow = arrowRef.current;
        if (arrow) {
          blinkingAnimation = gsap.timeline({ repeat: -1, paused: true }) // Always start paused
            .to(arrow, { opacity: 0, duration: 0.8, ease: "power1.in" }) // Fade out
            .to({}, { duration: 7.2 }) // Rest while hidden (total rest 8s)
            .to(arrow, { opacity: 1, duration: 0.8, ease: "power1.out", onStart: () => setIsAnimating(true) }) // Fade in
            .to(arrow, {
              opacity: 0.2,
              y: 40, // Move down 40px
              duration: 0.7,
              ease: "power2.in"
            })
            .to(arrow, {
              opacity: 1,
              y: 80, // Move further down
              duration: 0.7,
              ease: "power2.out"
            })
            .to(arrow, {
              opacity: 0.1,
              y: 120, // Even further down
              duration: 0.5,
              ease: "power3.in"
            })
            .to(arrow, {
              opacity: 1,
              y: 0, // Snap back to original position
              duration: 0.5,
              ease: "bounce.out"
            })
            .to(arrow, {
              y: 0,
              duration: 0.3,
              onComplete: () => setIsAnimating(false)
            })
            .to(arrow, { opacity: 0, duration: 0.8, ease: "power1.in" }) // Fade out after movement
            .to({}, { duration: 7.2 }); // Rest while hidden (total rest 8s)
          
          timelineRef.current = blinkingAnimation;
          
          // Only play if we're on video1 AND the initial delay has completed
          if (video1Active && initialDelayComplete) {
            // Fade in the arrow first
            gsap.to(arrow, { opacity: 1, duration: 0.5, ease: "power1.out", onComplete: () => {
              setIsAnimating(true);
              blinkingAnimation.play();
            }});
          }
        }
      };
      
      // Set up the animation with a short delay to ensure DOM is ready
      setTimeout(setupArrowAnimation, 500);
    };
    
    // Scroll event handler
    scrollHandler = () => {
      if (isAnimating && arrowRef.current) {
        gsap.to(arrowRef.current, { opacity: 0, duration: 0.5, ease: "power1.in" });
        if (timelineRef.current) {
          timelineRef.current.pause();
          setTimeout(() => {
            timelineRef.current.resume();
          }, 8000); // Resume after rest period
        }
        setIsAnimating(false);
      }
    };
    window.addEventListener('scroll', scrollHandler);
    window.addEventListener('text-initialized', handleTextInitialized);

    // Clean up event listeners when component unmounts
    return () => {
      window.removeEventListener('video1-fade-in', video1FadeInHandler);
      window.removeEventListener('video1-fade-out', video1FadeOutHandler);
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('text-initialized', handleTextInitialized);
      
      // Clear the initial delay timer
      clearTimeout(initialDelay);
      
      // Kill the animation if it exists
      if (blinkingAnimation) {
        blinkingAnimation.kill();
      }
    };
  }, [isAnimating, video1Active, initialDelayComplete]);
  
  // This effect handles the case when the initial delay completes while already on video 1
  useEffect(() => {
    // If both conditions are met and we have a timeline, play it
    if (video1Active && initialDelayComplete && timelineRef.current && arrowRef.current) {
      console.log("ScrollIndicator: Initial delay completed while on video 1, showing arrow");
      gsap.to(arrowRef.current, { opacity: 1, duration: 0.5, ease: "power1.out", onComplete: () => {
        setIsAnimating(true);
        timelineRef.current.play();
      }});
    }
  }, [video1Active, initialDelayComplete]);

  return (
    <div 
      className="scroll-indicator"
      aria-hidden="true"
      ref={arrowRef}
      style={{ 
        opacity: 0, // Always start hidden, GSAP will control opacity
        display: video1Active && initialDelayComplete ? 'block' : 'none' // Only display if both conditions are met
      }}
    >
      ⌄
    </div>
  );
};

export default ScrollIndicator;
