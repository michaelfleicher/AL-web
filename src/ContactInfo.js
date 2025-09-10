import React from 'react';
import './ContactInfo.css';
import { RainbowButton } from './components/magicui/rainbow-button';

const ContactInfo = ({ visible }) => {
  return (
    <div className="contact-info" style={{ 
      visibility: visible ? 'visible' : 'hidden',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.5s ease-in-out'
    }}>
      <RainbowButton
        variant="white"
        size="sm"
        className="text-black text-xs"
        onClick={() => window.location.href = 'mailto:ask@aevumlabs.bio'}
      >
        Learn More: ask@aevumlabs.bio
      </RainbowButton>
    </div>
  );
};

export default ContactInfo;
