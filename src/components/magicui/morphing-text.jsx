"use client";
import { useCallback, useEffect, useRef } from "react";
import { cn } from "src/lib/utils";
import "./morphing-text.css";

// const morphTime = 4; // 3 seconds for the morphing animation
const maxBlurAmount = 13; // Blur amount for liquid effect
// const startDelay = 0; // 1 second delay before starting

const useMorphingText = (texts, shouldStart, startDelay, morphTime) => {
  const morphRef = useRef(0);
  const timeRef = useRef(new Date());
  const animatedRef = useRef(false);
  const startedRef = useRef(false);
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);

  const setStyles = useCallback(
    (fraction) => {
      const [current1, current2] = [text1Ref.current, text2Ref.current];
      if (!current1 || !current2) return;

      // Always show the first text
      current1.textContent = texts[0] || texts;
      current2.style.opacity = "0%";

      if (animatedRef.current) {
        // Animation complete
        current1.style.filter = "none";
        current1.style.opacity = "100%";
        return;
      }

      // Morphing animation from blob to clear text
      const blurValue = Math.max(0, maxBlurAmount * (1 - fraction));
      const contrastValue = 0.5 + fraction * 1.0; // More dramatic contrast change

      current1.style.filter = `blur(${blurValue.toFixed(1)}px)`;
      // current1.style.filter = `blur(${blurValue.toFixed(
      //   1
      // )}px) contrast(${contrastValue.toFixed(2)})`;
      current1.style.opacity = "100%";
    },
    [texts]
  );

  const doMorph = useCallback(() => {
    const increment = 0.016; // Smooth 60fps animation
    morphRef.current += increment;

    let fraction = morphRef.current / morphTime;

    // Smooth easing curve
    let easedFraction;
    if (fraction < 0.5) {
      easedFraction = 2 * fraction * fraction;
    } else {
      easedFraction = 1 - 2 * (1 - fraction) * (1 - fraction);
    }

    if (fraction >= 1) {
      fraction = 1;
      easedFraction = 1;
      animatedRef.current = true;
    }

    setStyles(easedFraction);
  }, [setStyles]);

  useEffect(() => {
    let animationFrameId;
    let delayTimeoutId;

    // Reset animation state
    morphRef.current = 0;
    animatedRef.current = false;
    startedRef.current = false;
    timeRef.current = new Date();

    // Hide initially
    if (text1Ref.current) {
      text1Ref.current.style.visibility = "hidden";
      text1Ref.current.style.opacity = "0";
    }
    if (text2Ref.current) {
      text2Ref.current.style.visibility = "hidden";
      text2Ref.current.style.opacity = "0";
    }

    const animate = () => {
      if (!startedRef.current) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      if (!animatedRef.current) {
        doMorph();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      startedRef.current = true;

      // Make visible and set initial morphing state
      if (text1Ref.current) {
        text1Ref.current.style.visibility = "visible";
        text1Ref.current.textContent = texts[0] || texts;
        text1Ref.current.style.filter = `blur(${maxBlurAmount}px) contrast(0.5)`;
        text1Ref.current.style.opacity = "100%";
      }
      if (text2Ref.current) {
        text2Ref.current.style.opacity = "0%";
        text2Ref.current.style.visibility = "visible";
      }
    };

    if (shouldStart) {
      // Start after delay
      delayTimeoutId = setTimeout(startAnimation, startDelay);
    }

    // Start animation loop
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (delayTimeoutId) {
        clearTimeout(delayTimeoutId);
      }
    };
  }, [doMorph, setStyles, texts, shouldStart]);

  return { text1Ref, text2Ref };
};

const Texts = ({ texts, shouldStart, startDelay, morphTime }) => {
  const { text1Ref, text2Ref } = useMorphingText(
    texts,
    shouldStart,
    startDelay,
    morphTime
  );

  return (
    <>
      <span
        className="text-center m-auto inline-block"
        ref={text1Ref}
        style={{
          position: "relative",
          display: "block",
          width: "100%",
          textAlign: "center",
          lineHeight: "1.2",
          overflowWrap: "break-word",
          wordWrap: "break-word",
          hyphens: "auto",
          left: "0",
          right: "0",
          margin: "0 auto",
          visibility: "hidden",
          opacity: "0",
        }}
      />
      <span
        className="text-center m-auto inline-block opacity-0"
        ref={text2Ref}
        style={{
          position: "absolute",
          display: "block",
          width: "100%",
          textAlign: "center",
          lineHeight: "1.2",
          overflowWrap: "break-word",
          wordWrap: "break-word",
          hyphens: "auto",
          left: "0",
          right: "0",
          margin: "0 auto",
          visibility: "hidden",
          opacity: "0",
        }}
      />
    </>
  );
};

const SvgFilters = () => (
  <svg
    id="filters"
    className="fixed h-0 w-0"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <filter id="threshold" x="-20%" y="-20%" width="140%" height="140%">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 255 -140"
        />
        <feGaussianBlur stdDeviation="1" />
        <feDropShadow dx="2" dy="2" stdDeviation="8" floodColor="#d9e6ff" />
      </filter>
    </defs>
  </svg>
);

export const MorphingText = ({
  id,
  texts,
  className,
  onAnimationComplete,
  delayStart = false,
  startDelay = 0,
  morphTime = 4,
  textSize = "text-[40pt] lg:text-[5rem]",
  style = {},
}) => {
  const textRef = useRef(null);

  // Check if animation is completed
  useEffect(() => {
    if (!onAnimationComplete) return;

    const animationCheckInterval = setInterval(() => {
      const textElement = textRef.current;
      if (textElement) {
        const animatedElements = textElement.querySelectorAll("span");
        if (
          animatedElements[0] &&
          animatedElements[0].style.filter === "none"
        ) {
          onAnimationComplete();
          clearInterval(animationCheckInterval);
        }
      }
    }, 100);

    return () => clearInterval(animationCheckInterval);
  }, [onAnimationComplete]);

  return (
    <div
      id={id}
      ref={textRef}
      className={cn(
        `morphed-text-container relative mx-auto h-auto w-full text-center font-sans ${textSize} leading-tight [filter:url(#threshold)]`,
        className
      )}
      style={{
        opacity: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        whiteSpace: "normal",
        minHeight: "auto",
        padding: "0",
        boxSizing: "border-box",
        maxWidth: "100%",
        overflowWrap: "break-word",
        textAlign: "center",
        margin: "0 auto",
        left: "0",
        right: "0",
        willChange: "filter",
        ...style,
      }}
    >
      <Texts
        texts={texts}
        shouldStart={!delayStart}
        startDelay={startDelay}
        morphTime={morphTime}
      />
      <SvgFilters />
    </div>
  );
};
