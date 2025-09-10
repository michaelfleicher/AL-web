import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./ScrollIndicator.css";

const ScrollIndicator = () => {
  const arrowRef = useRef(null);
  const timelineRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [video1Active, setVideo1Active] = useState(false);

  useEffect(() => {
    let blinkingAnimation;
    let scrollHandler;
    let video1FadeInHandler;
    let video1FadeOutHandler;

    video1FadeInHandler = () => {
      console.log("ScrollIndicator: Video 1 fade in detected");
      setVideo1Active(true);

      // Wait 5 seconds total (3 for text reveal + 2 additional), then fade in over 2 seconds
      if (arrowRef.current) {
        gsap.fromTo(
          arrowRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 2,
            delay: 5, // Wait 5 seconds before starting the fade-in
            ease: "power2.out",
            onComplete: () => {
              // Start the animation sequence after fade-in
              if (timelineRef.current) {
                setIsAnimating(true);
                timelineRef.current.play();
              }
            },
          }
        );
      }
    };

    video1FadeOutHandler = () => {
      console.log("ScrollIndicator: Video 1 fade out detected");
      setVideo1Active(false);

      if (arrowRef.current) {
        // Quickly fade out when leaving video 1
        gsap.to(arrowRef.current, {
          opacity: 0,
          duration: 0.2,
          ease: "power1.in",
        });
      }
      if (timelineRef.current) {
        timelineRef.current.pause();
      }
    };
    window.addEventListener("video1-fade-in", video1FadeInHandler);
    window.addEventListener("video1-fade-out", video1FadeOutHandler);

    // Create the arrow animation timeline
    const setupArrowAnimation = () => {
      const arrow = arrowRef.current;
      if (arrow) {
        blinkingAnimation = gsap
          .timeline({ repeat: -1, paused: true }) // Always start paused
          .to(arrow, { opacity: 0, duration: 0.8, ease: "power1.in" }) // Fade out
          .to({}, { duration: 3.2 }) // Rest while hidden (total rest 4s)
          .to(arrow, {
            opacity: 1,
            duration: 0.8,
            ease: "power1.out",
            onStart: () => setIsAnimating(true),
          }) // Fade in
          .to(arrow, {
            opacity: 0.2,
            y: 40, // Move down 40px
            duration: 0.7,
            ease: "power2.in",
          })
          .to(arrow, {
            opacity: 1,
            y: 80, // Move further down
            duration: 0.7,
            ease: "power2.out",
          })
          .to(arrow, {
            opacity: 0.1,
            y: 120, // Even further down
            duration: 0.5,
            ease: "power3.in",
          })
          .to(arrow, {
            opacity: 1,
            y: 0, // Snap back to original position
            duration: 0.5,
            ease: "bounce.out",
          })
          .to(arrow, {
            y: 0,
            duration: 0.3,
            onComplete: () => setIsAnimating(false),
          })
          .to(arrow, { opacity: 0, duration: 0.8, ease: "power1.in" }) // Fade out after movement
          .to({}, { duration: 3.2 }); // Rest while hidden (total rest 4s)

        timelineRef.current = blinkingAnimation;
      }
    };

    // Set up the animation immediately
    setupArrowAnimation();

    // Scroll event handler
    scrollHandler = () => {
      if (isAnimating && arrowRef.current) {
        gsap.to(arrowRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: "power1.in",
        });
        if (timelineRef.current) {
          timelineRef.current.pause();
          setTimeout(() => {
            timelineRef.current.resume();
          }, 4000); // Resume after rest period
        }
        setIsAnimating(false);
      }
    };
    window.addEventListener("scroll", scrollHandler);

    // Clean up event listeners when component unmounts
    return () => {
      window.removeEventListener("video1-fade-in", video1FadeInHandler);
      window.removeEventListener("video1-fade-out", video1FadeOutHandler);
      window.removeEventListener("scroll", scrollHandler);

      // Kill the animation if it exists
      if (blinkingAnimation) {
        blinkingAnimation.kill();
      }
    };
  }, [isAnimating, video1Active]);

  return (
    <div
      className="scroll-indicator"
      aria-hidden="true"
      ref={arrowRef}
      style={{
        opacity: 0, // Always start hidden, GSAP will control opacity
        display: video1Active ? "block" : "none", // Show whenever video 1 is active
      }}
    >
      ⌄
    </div>
  );
};

export default ScrollIndicator;
