import React, { useEffect } from 'react';

function GoogleTranslate() {
  useEffect(() => {
    function googleTranslateElementInit() {
      new window.google.translate.TranslateElement({ pageLanguage: 'en', layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL }, 'google_translate_element');
    }
    

    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div id="google_translate_element" style={{ display: 'inline-block' }}></div>;
}

export default GoogleTranslate;
