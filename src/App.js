import './App.css';
import './fonts.css'; // Import custom fonts
import ScrambledText from './ScrambledText';
import TextType from './TextType';
import VideoBackground from './VideoBackground';
import ScrollIndicator from './ScrollIndicator';
import ContactInfo from './ContactInfo';
import React, { useEffect, useState } from 'react';

function App() {
  const [showTextType, setShowTextType] = useState(false);
  
  useEffect(() => {
    // Listen for video3-fade-in and video3-fade-out events to control TextType visibility
    const handleVideo3FadeIn = () => setShowTextType(true);
    const handleVideo3FadeOut = () => setShowTextType(false);
    
    window.addEventListener('video3-fade-in', handleVideo3FadeIn);
    window.addEventListener('video3-fade-out', handleVideo3FadeOut);
    
    // Check if we're on video 3 on initial load
    setTimeout(() => {
      const badge = document.getElementById('badge');
      if (badge && badge.textContent === "Video: 3") {
        setShowTextType(true);
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('video3-fade-in', handleVideo3FadeIn);
      window.removeEventListener('video3-fade-out', handleVideo3FadeOut);
    };
  }, []);
  
  return (
    <>
      {/* This component manages the video background */}
      <VideoBackground />
      
      {/* This is your main app content */}
      <div className="App" style={{ position: 'relative', zIndex: 10 }}>
        <div className="overlay-content">
          <div className="hero-content">
            {/* Text for Video 1 */}
            <ScrambledText
              className="big-text"
              radius={100}
              duration={1.5}
              speed={0.4}
              scrambleChars=":."
            >
              EXTENDING HUMANITY'S HEALTHSPAN
            </ScrambledText>
            
            <ScrambledText
              className="small-text"
              radius={80}
              duration={1.3}
              speed={0.3}
              scrambleChars=":."
            >
              Aevum Labs was founded to redefine the limits of healthy aging and unlock longer, healthier lives for all.
            </ScrambledText>
            
            {/* Text for Video 3 */}
            {showTextType && (
              <div className="text-type-container" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <TextType 
                  text={["Alzheimer's\nParkinson's\nCOPD\nIPF\nLiver Fibrosis\nCirrhosis\nChronic Kidney Disease\nCerebrovascular & Cardiovascular diseases", "They all share common biological roots.", "A unified solution lies within.", "Modeling the Foundations of Disease\n\nSimulating Its Root Causes\n\nDesigning the Future of Medicine"]}
                  typingSpeed={25}
                  pauseDuration={3500} /* Increased from 1500ms to 3500ms (3.5 seconds) */
                  deletingSpeed={10} /* Faster erasing (reduced from 30ms to 10ms) */
                  showCursor={true}
                  cursorCharacter="_"
                  className="video3-text"
                />
              </div>
            )}
            
            {/* Scroll indicator arrow */}
            <ScrollIndicator />
          </div>
        </div>
        {/* Contact information */}
        <ContactInfo />
      </div>
    </>
  );
}

export default App;