
import React, { useState, useEffect } from 'react';

interface AnnouncerProps {
  message?: string;
  assertive?: boolean;
}

/**
 * A component to announce dynamic content changes to screen readers
 */
const A11yAnnouncer: React.FC<AnnouncerProps> = ({
  message = '',
  assertive = false,
}) => {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  
  useEffect(() => {
    if (!message) return;
    
    // Add the message to the announcements queue
    setAnnouncements(prev => [...prev, message]);
    
    // Remove message after it's been announced (typical screen reader delay)
    const timeoutId = setTimeout(() => {
      setAnnouncements(prev => prev.filter(item => item !== message));
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [message]);
  
  return (
    <div className="sr-only" aria-live={assertive ? 'assertive' : 'polite'}>
      {announcements.map((announcement, i) => (
        <p key={`${announcement}-${i}`}>{announcement}</p>
      ))}
    </div>
  );
};

export default A11yAnnouncer;

// Helper hook to use the announcer
export const useAnnouncer = () => {
  const [message, setMessage] = useState('');
  const [assertive, setAssertive] = useState(false);
  
  const announce = (text: string, isAssertive = false) => {
    setMessage(text);
    setAssertive(isAssertive);
    
    // Clear the message after a short delay
    setTimeout(() => setMessage(''), 100);
  };
  
  return {
    announcer: <A11yAnnouncer message={message} assertive={assertive} />,
    announce,
  };
};
