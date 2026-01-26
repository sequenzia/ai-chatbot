import { useState, useEffect } from 'react';

export function useVirtualKeyboard() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      // Detect keyboard by comparing viewport height
      // When keyboard opens, visualViewport.height becomes smaller than window.innerHeight
      const keyboardOpen = window.visualViewport!.height < window.innerHeight * 0.75;
      setIsKeyboardOpen(keyboardOpen);
    };

    window.visualViewport.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  return isKeyboardOpen;
}
