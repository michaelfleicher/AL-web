import React, { useState, useEffect } from 'react';

const ResponsiveWrapper = ({ children }) => {
  const [deviceType, setDeviceType] = useState('desktop');
  const [orientation, setOrientation] = useState('landscape');
  
  useEffect(() => {
    // Function to determine device type based on screen width
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Set device type
      if (width <= 480) {
        setDeviceType('mobile');
      } else if (width <= 768) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
      
      // Set orientation
      setOrientation(width > height ? 'landscape' : 'portrait');
    };
    
    // Initial call
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Make device info available via data attributes
  return (
    <div 
      className="responsive-wrapper"
      data-device={deviceType}
      data-orientation={orientation}
    >
      {children}
    </div>
  );
};

export default ResponsiveWrapper;
