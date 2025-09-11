import "./App.css";
import "./fonts.css"; // Import custom fonts
import "./responsive.css"; // Import responsive styles
import ScrambledText from "./ScrambledText";
import TextType from "./TextType";
import VideoBackground from "./VideoBackground";
import ScrollIndicator from "./ScrollIndicator";
import ContactInfo from "./ContactInfo";
import ResponsiveWrapper from "./components/ResponsiveWrapper";
import useResponsive from "./hooks/useResponsive";
import { MorphingText } from "./components/magicui/morphing-text";
import "./components/magicui/morphing-text.css";
import "./morphed-text-overrides.css"; // Additional CSS overrides for morphed text
import React, { useEffect, useState } from "react";

// Stable arrays so MorphingText doesn't restart animation on re-renders
const brandTexts = ["Aevum Labs"];
const taglineTexts = ["Redefine Aging"];

function App() {
  const responsive = useResponsive();

  const [showTextType, setShowTextType] = useState(false);
  const [showMorphingText, setShowMorphingText] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [textTypeFading, setTextTypeFading] = useState(false);
  const [brandNameFading, setBrandNameFading] = useState(false); // kept for compatibility but no longer used to hide text
  const [brandRevealDone, setBrandRevealDone] = useState(false);
  const [taglineRevealDone, setTaglineRevealDone] = useState(false);

  useEffect(() => {
    // Listen for video3-fade-in and video3-fade-out events to control TextType visibility
    const handleVideo3FadeIn = () => {
      setShowTextType(true);
      // Reset states when video 3 starts
      setShowMorphingText(false);
      // setShowContactInfo(false);
      setTextTypeFading(false);
      setBrandNameFading(false);
      setBrandRevealDone(false);
      setTaglineRevealDone(false);
    };
    const handleVideo3FadeOut = () => {
      setShowTextType(false);
      // Hide all elements when video 3 ends
      setShowMorphingText(false);
      // setShowContactInfo(false);
      setTextTypeFading(false);
      setBrandNameFading(false);
      setBrandRevealDone(false);
      setTaglineRevealDone(false);
    };

    window.addEventListener("video3-fade-in", handleVideo3FadeIn);
    window.addEventListener("video3-fade-out", handleVideo3FadeOut);

    // Check if we're on video 3 on initial load
    setTimeout(() => {
      const badge = document.getElementById("badge");
      console.log(
        "App.js checking badge element:",
        badge ? badge.textContent : "badge not found"
      );
      if (badge && badge.textContent === "Video: 3") {
        console.log("Setting TextType visible because badge indicates Video 3");
        setShowTextType(true);
      }
    }, 1000);

    // We no longer fade the brand/tagline on scroll; once revealed they stay.

    return () => {
      window.removeEventListener("video3-fade-in", handleVideo3FadeIn);
      window.removeEventListener("video3-fade-out", handleVideo3FadeOut);
    };
  }, [showMorphingText]);

  // Show contact info only after both brand and tagline have fully revealed
  useEffect(() => {
    if (brandRevealDone && taglineRevealDone) {
      setShowContactInfo(true);
    }
  }, [brandRevealDone, taglineRevealDone]);

  return (
    <ResponsiveWrapper>
      {/* This component manages the video background */}
      <VideoBackground />

      {/* This is your main app content */}
      <div className="App" style={{ position: "relative", zIndex: 10 }}>
        <div className="overlay-content">
          <div
            className="hero-content"
            data-device={responsive.deviceType}
            data-orientation={responsive.orientation}
          >
            {/* Text for Video 1 */}
            <ScrambledText
              className="big-text"
              radius={30}
              duration={1.5}
              speed={0.4}
              scrambleChars=":."
            >
              EXTENDING HUMANITY'S HEALTHSPAN
            </ScrambledText>

            <ScrambledText
              className="small-text"
              radius={24}
              duration={1.3}
              speed={0.3}
              scrambleChars=":."
            >
              Aevum Labs was founded to redefine the limits of healthy aging and
              unlock longer, healthier lives for all.
            </ScrambledText>

            {/* Text for Video 3 */}
            {showTextType && (
              <div
                className="text-type-container"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: "100%",
                  height: "auto",
                  minHeight: "100%",
                  display: "flex",
                  alignItems:
                    "center" /* Always center align, we'll position the morphing text with its own properties */,
                  justifyContent: "center",
                  paddingTop: showMorphingText ? "0" : "0",
                  paddingBottom: showMorphingText ? "0" : "20vh",
                }}
              >
                <div
                  className="text-type-wrapper"
                  style={{
                    maxWidth: "90%",
                    textAlign: "center",
                    margin: "0 auto",
                    overflow: "visible",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ position: "relative", width: "100%" }}>
                    {/* TextType component with fade-out animation when complete */}
                    {!showMorphingText && (
                      <div
                        style={{
                          opacity: textTypeFading ? 0 : 1,
                          transition: "opacity 1.5s ease",
                          zIndex: 1,
                          width: "100%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <TextType
                          text={[
                            "Alzheimer's\nParkinson's\nCOPD\nIPF\nLiver Fibrosis\nCirrhosis\nChronic Kidney Disease\nCerebrovascular & Cardiovascular diseases",
                            "They all share common biological drivers.",
                            "A unified solution lies within:\n Modeling and simulating the root causes of disease.",
                          ]}
                          typingSpeed={25}
                          pauseDuration={
                            3500
                          } /* 3.5 seconds pause between texts */
                          deletingSpeed={10} /* Faster erasing */
                          showCursor={true}
                          cursorCharacter="_"
                          className="video3-text"
                          loop={false} /* Ensure it doesn't loop */
                          onSentenceComplete={(text, index) => {
                            // When the last sentence is completed (index 2), start the transition sequence
                            if (index === 2) {
                              // 1. Add a 4 second delay before starting the crossfade (increased from 1.5s)
                              setTimeout(() => {
                                // 2. Start the fade-out transition
                                setTextTypeFading(true);
                              }, 3500); // 2.5 seconds delay to allow more reading time

                              setTimeout(() => {
                                setTimeout(() => {
                                  setShowMorphingText(true);
                                }, 1); // Wait 1.5 seconds for crossfade to progress (increased from 1s)
                              }, 3000); // 2.5 seconds delay to allow more reading time
                            }
                          }}
                        />
                      </div>
                    )}

                    {/* MorphingText that fades in - positioned higher on the screen */}
                    {showMorphingText && (
                      <div
                        className="flex flex-col items-center justify-center gap-[20px] brand-name"
                        style={{
                          opacity: brandNameFading ? 0 : 1,
                          transition: "opacity 1.5s ease",
                        }}
                      >
                        <MorphingText
                          id="brand-name-styling"
                          texts={brandTexts}
                          className="brand-name"
                          textSize="text-[2.5rem] md:text-[4rem] lg:text-[5.2rem]"
                          style={{
                            position: "relative",
                            textAlign: "center",
                            width: "auto",
                            maxWidth: "90vw",
                            display: "inline-block",
                            marginLeft: "auto",
                            marginRight: "auto",
                          }}
                          onAnimationComplete={() => setBrandRevealDone(true)}
                        />

                        <MorphingText
                          id="tagline-name-styling"
                          texts={taglineTexts}
                          className="tagline-text"
                          textSize="text-[2rem] md:text-[3rem] lg:text-[3.8rem]"
                          style={{
                            position: "relative",
                            textAlign: "center",
                            width: "auto",
                            maxWidth: "90vw",
                            display: "inline-block",
                            marginLeft: "auto",
                            marginRight: "auto",
                          }}
                          onAnimationComplete={() => setTaglineRevealDone(true)}
                          startDelay={500}
                          morphTime={4}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Scroll indicator arrow */}
            <ScrollIndicator />
          </div>
        </div>
        {/* Contact information - shows only when tagline text animation completes  // showContactInfo state */}
        <ContactInfo visible={showContactInfo} />
      </div>
    </ResponsiveWrapper>
  );
}

export default App;
