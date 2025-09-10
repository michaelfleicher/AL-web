"use client";
import { useCallback, useEffect, useRef } from "react";

import { cn } from "src/lib/utils";
import "./morphing-text.css";

const morphTime = 5; // 5 seconds for morphing animation
const cooldownTime = 0.5; // 0.5 seconds to prevent further morphing after completion
const maxBlurAmount = 60; // Much higher blur for blob-like initial state

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
      current1.style.opacity = "100%"; // Always visible
      
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
        
        // Add scale transformation to create more blob-like effect at the start
        const scaleValue = 0.7 + (fraction * 0.3); // Start smaller and grow
        
        // Much more dramatic contrast change - starts very low (blob-like)
        const contrastValue = 0.3 + fraction * 0.7;
        
        // Add brightness variation for more organic blob effect
        const brightnessValue = 0.8 + fraction * 0.2;
        
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
    // Use appropriate increment for 5-second animation duration
    const increment = 0.002; // Increment for 5-second blob-to-text effect
    
    // Increase the morph progress
    morphRef.current += increment;
    
    // Prevent any sudden jumps in progress that could cause flickering
    if (morphRef.current < 0) morphRef.current = 0;
    
    // Apply easing function to make the transformation more non-linear
    // This creates a moderate start (when text is shapeless) and a clear finish
    let fraction = morphRef.current / morphTime;
    
    // Even smoother easing curve that completely eliminates flickering
    // This uses a continuous function to ensure no discontinuities
    // Implementing a custom ease-in-out that's very gradual at start
    let easedFraction;
    
    // Use a cubic-bezier like curve for the full animation
    // This creates a super smooth start with no discontinuities
    if (fraction < 0.15) {
      // Very gradual start - nearly imperceptible movement at first
      easedFraction = 15 * Math.pow(fraction, 4);
    } else if (fraction < 0.5) {
      // Smooth acceleration phase
      const normalizedFraction = (fraction - 0.15) / 0.35; // normalize to 0-1 range
      easedFraction = 0.15 + normalizedFraction * normalizedFraction * 0.35;
    } else {
      // Final smooth deceleration to target
      const normalizedFraction = (fraction - 0.5) / 0.5; // normalize to 0-1 range
      easedFraction = 0.5 + (1 - Math.pow(1 - normalizedFraction, 3)) * 0.5;
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
      current2.style.opacity = "100%";
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
          text1Ref.current.style.opacity = "1";
          text1Ref.current.style.visibility = "visible";
          text1Ref.current.style.display = "block";
          // Start as a complete blob
          text1Ref.current.style.filter = `blur(${maxBlurAmount}px) contrast(0.3) brightness(0.8)`;
          text1Ref.current.style.transform = "scale(0.7)";
          console.log('Morphing text initialized:', texts[0]);
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
        opacity: 1,
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
