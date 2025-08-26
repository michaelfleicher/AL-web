import { useState, useEffect } from 'react';

// Custom hook for responsive design
const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const [deviceType, setDeviceType] = useState('desktop');
  const [orientation, setOrientation] = useState('portrait');

  useEffect(() => {
    // Function to update the state
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({
        width,
        height
      });

      // Set device type
      if (width < 480) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }

      // Set orientation
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away to set initial values
    handleResize();
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper functions for responsive values
  const getResponsiveValue = (mobileValue, tabletValue, desktopValue) => {
    if (deviceType === 'mobile') return mobileValue;
    if (deviceType === 'tablet') return tabletValue;
    return desktopValue;
  };

  return {
    windowSize,
    deviceType,
    orientation,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    getResponsiveValue
  };
};

export default useResponsive;
