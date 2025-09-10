"use client";
import { useCallback, useEffect, useRef } from "react";

import { cn } from "src/lib/utils";
import "./morphing-text.css";

const morphTime = 3; // 4 seconds for morphing animation
const cooldownTime = 0.5; // 0.5 seconds to prevent further morphing after completion
const maxBlurAmount = 12; // Optimal blur for blob-like initial state - readable as text but very blurry

const useMorphingText = (texts) => {   
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(0);
  const timeRef = useRef(new Date());
  const animatedRef = useRef(false);

  const text1Ref = useRef(null);
  const text2Ref = useRef(null);

  const setStyles = useCallback((fraction) => {
    const [current1, current2] = [text1Ref.current, text2Ref.current];
    if (!current1 || !current2) return;
    
    // For single text, we'll simulate an animation from extreme blur to clear
    if (texts.length === 1) {
      // Always show the text immediately, but with an extreme blur effect
      current1.textContent = texts[0];
      current1.style.opacity = "95%"; // Match other text opacity
      
      // If we've already completed the animation once, keep it clear
      if (animatedRef.current) {
        current1.style.filter = "none";
        current2.style.opacity = "0%";
        return;
      }
      
      // Create a morphing animation that starts extremely blurred (shapeless) and gradually becomes clear
      if (fraction < 1) {
        // Start with extreme blur and gradually reduce to 0
        // Use a smoother curve to avoid flickering
        const blurValue = Math.max(0, maxBlurAmount * Math.pow(1 - fraction, 1.5));
        
        // Add subtle scale transformation for organic blob effect
        const scaleValue = 0.85 + (fraction * 0.15); // Start slightly smaller and grow
        
        // Moderate contrast change for better blob-to-text transition
        const contrastValue = 0.8 + fraction * 0.2;
        
        // Subtle brightness variation for more organic blob effect
        const brightnessValue = 0.9 + fraction * 0.1;
        
        // Use smoother transition for less jarring changes
        current1.style.transition = "filter 40ms ease-out, transform 40ms ease-out";
        
        // Round to 2 decimal places to avoid micro-changes causing flicker
        const roundedBlur = Math.round(blurValue * 100) / 100;
        const roundedContrast = Math.round(contrastValue * 100) / 100;
        const roundedBrightness = Math.round(brightnessValue * 100) / 100;
        const roundedScale = Math.round(scaleValue * 1000) / 1000;
        
        // Combine multiple filters for blob effect
        current1.style.filter = `blur(${roundedBlur}px) contrast(${roundedContrast}) brightness(${roundedBrightness})`;
        current1.style.transform = `scale(${roundedScale})`;
      } else {
        // Ensure a smooth final transition to clear text
        current1.style.transition = "filter 60ms ease-out, transform 60ms ease-out";
        current1.style.filter = "none";
        current1.style.transform = "scale(1)";
        animatedRef.current = true;
      }
      
      current2.style.opacity = "0%";
      return;
    }

    // For multiple texts, make the transitions more extreme
    const blurValueIn = Math.min(maxBlurAmount / fraction - maxBlurAmount, 200);
    current2.style.filter = `blur(${blurValueIn}px) contrast(${0.5 + fraction * 0.5})`;
    current2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

    const invertedFraction = 1 - fraction;
    const blurValueOut = Math.min(maxBlurAmount / invertedFraction - maxBlurAmount, 200);
    current1.style.filter = `blur(${blurValueOut}px) contrast(${0.5 + invertedFraction * 0.5})`;
    current1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`;

    current1.textContent = texts[textIndexRef.current % texts.length];
    current2.textContent = texts[(textIndexRef.current + 1) % texts.length];
  }, [texts]);

  const doMorph = useCallback(() => {
    // Use appropriate increment for 4-second animation duration
    const increment = 0.005; // Increment for 4-second blob-to-text effect
    
    // Increase the morph progress
    morphRef.current += increment;
    
    // Prevent any sudden jumps in progress that could cause flickering
    if (morphRef.current < 0) morphRef.current = 0;
    
    // Apply easing function to make the transformation more non-linear
    // This creates a moderate start (when text is shapeless) and a clear finish
    let fraction = morphRef.current / morphTime;
    
    // Simple ease-in-out curve that feels more responsive
    // This provides smooth animation without excessive delays
    let easedFraction;
    
    // Use a more responsive easing curve
    if (fraction < 0.5) {
      // Smooth ease-in with immediate visible progress
      easedFraction = 2 * fraction * fraction;
    } else {
      // Smooth ease-out
      easedFraction = 1 - 2 * Math.pow(1 - fraction, 2);
    }
    
    // Cap the fraction at 1
    if (fraction > 1) {
      fraction = 1;
      easedFraction = 1;
      // For multiple texts, we'd continue to the next text
      if (texts.length > 1) {
        cooldownRef.current = cooldownTime;
        if (fraction === 1) {
          textIndexRef.current++;
        }
      }
    }
    
    setStyles(easedFraction);
  }, [setStyles, texts.length]);

  const doCooldown = useCallback(() => {
    morphRef.current = 0;
    const [current1, current2] = [text1Ref.current, text2Ref.current];
    if (current1 && current2) {
      current2.style.filter = "none";
      current2.style.transform = "scale(1)";
      current2.style.opacity = "95%";
      current1.style.filter = "none";
      current1.style.transform = "scale(1)";
      current1.style.opacity = "0%";
    }
  }, []);

  useEffect(() => {
    let animationFrameId;
    let startTimeout;
    
    // Reset animation state when texts change
    animatedRef.current = false;
    
    // Initialize with zero for a consistent start
    morphRef.current = 0.0;
    
    // Use requestAnimationFrame for the initial style setup
    // This ensures we're in the browser's render cycle
    startTimeout = setTimeout(() => {
      requestAnimationFrame(() => {
        // Set initial styles to prevent flickering
        if (text1Ref.current && texts.length === 1) {
          // Set up the initial blob-like state
          text1Ref.current.style.transition = "filter 40ms ease-out, transform 40ms ease-out";
          text1Ref.current.textContent = texts[0];
          text1Ref.current.style.opacity = "0";
          text1Ref.current.style.visibility = "visible";
          text1Ref.current.style.display = "block";
          
          // Fade in the text smoothly
          setTimeout(() => {
            if (text1Ref.current) {
              text1Ref.current.style.transition = "opacity 0.5s ease-in";
              text1Ref.current.style.opacity = "0.95";
            }
          }, 10);
          // Start as a blob-like state but still recognizable as text
          text1Ref.current.style.filter = `blur(${maxBlurAmount}px) contrast(0.8) brightness(0.9)`;
          text1Ref.current.style.transform = "scale(0.85)";
        }
      });
    }, 5); // Start even faster
    
    const animate = () => {
      // Check if component is still mounted before continuing
      if (!text1Ref.current || !text2Ref.current) {
        return; // Stop animation if refs are null (component unmounted)
      }

      animationFrameId = requestAnimationFrame(animate);

      const newTime = new Date();
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
      timeRef.current = newTime;

      // For single text animation, always animate until completion
      if (texts.length === 1) {
        // Continue animating until we reach the end (when animatedRef becomes true)
        if (!animatedRef.current) {
          doMorph();
        } else {
          // Animation completed, stop the loop
          cancelAnimationFrame(animationFrameId);
        }
      } else {
        cooldownRef.current -= dt;
        if (cooldownRef.current <= 0) doMorph();
        else doCooldown();
      }
    };

    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (startTimeout) clearTimeout(startTimeout);
    };
  }, [doMorph, doCooldown, setStyles, texts.length, texts]);

  return { text1Ref, text2Ref };
};

const Texts = ({ texts, className }) => {
  const { text1Ref, text2Ref } = useMorphingText(texts);
  
  // Define additional class-specific style properties that won't interfere with animation
  let additionalClass = "";
  if (className) {
    additionalClass = className;
  }
  
  return (
    <>
      <span
        className={`text-center m-auto inline-block ${additionalClass}`}
        ref={text1Ref}
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          textAlign: 'center',
          lineHeight: '1.2',
          overflowWrap: 'break-word',
          wordWrap: 'break-word',
          hyphens: 'auto',
          left: '0',
          right: '0',
          margin: '0 auto',
          transformOrigin: 'center center', // Ensure scaling happens from center
        }}
        data-morph-text="true"
      />
      <span
        className={`text-center m-auto inline-block ${texts.length === 1 ? "opacity-0" : ""} ${additionalClass}`}
        ref={text2Ref}
        style={{
          position: 'absolute',
          display: 'block',
          width: '100%',
          textAlign: 'center',
          lineHeight: '1.2',
          overflowWrap: 'break-word',
          wordWrap: 'break-word',
          hyphens: 'auto',
          left: '0',
          right: '0',
          margin: '0 auto',
          transformOrigin: 'center center', // Ensure scaling happens from center
        }}
      />
    </>
  );
};

const SvgFilters = () => (
  <svg
    id="filters"
    className="fixed h-0 w-0"
    preserveAspectRatio="xMidYMid slice">
    <defs>
      <filter id="threshold" x="0%" y="0%" width="100%" height="100%">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 255 -150" />
        {/* Added a slight blur to smooth out any harsh edges that might cause flickering */}
        <feGaussianBlur stdDeviation="0.3" />
      </filter>
    </defs>
  </svg>
);

export const MorphingText = ({
  texts,
  className,
  onAnimationComplete,
  delayStart = false,
  textSize = "text-[40pt] lg:text-[5rem]",
  style = {}
}) => {
  const textRef = useRef(null);
  
  // Check if animation is completed to call the onAnimationComplete callback
  useEffect(() => {
    if (!onAnimationComplete) return;
    
    const animationCheckInterval = setInterval(() => {
      const textElement = textRef.current;
      if (textElement) {
        const animatedElements = textElement.querySelectorAll('span');
        if (animatedElements[0] && animatedElements[0].style.filter === 'none') {
          onAnimationComplete();
          clearInterval(animationCheckInterval);
        }
      }
    }, 100);
    
    return () => clearInterval(animationCheckInterval);
  }, [onAnimationComplete]);
  
  // Handle visibility when delayStart changes
  useEffect(() => {
    if (textRef.current) {
      if (delayStart === false) {
        // When delayStart is false, make the text immediately visible
        textRef.current.style.visibility = 'visible';
        
        // Force a quick start to the animation
        const event = new Event('quickstart');
        document.dispatchEvent(event);
      }
    }
  }, [delayStart]);
  
  return (
    <div
      ref={textRef}
      className={cn(
        `morphed-text-container relative mx-auto h-auto w-full text-center font-sans ${textSize} leading-tight [filter:url(#threshold)]`,
        className
      )}
      style={{ 
        opacity: 0.95,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        whiteSpace: 'normal',
        visibility: delayStart ? 'hidden' : 'visible',
        minHeight: 'auto',
        padding: '0',
        boxSizing: 'border-box',
        maxWidth: '100%',
        overflowWrap: 'break-word',
        textAlign: 'center',
        margin: '0 auto',
        left: '0',
        right: '0',
        willChange: 'filter, transform',
        ...style
      }}
    >
      <Texts texts={texts} className={className} />
      <SvgFilters />
    </div>
  );
};
