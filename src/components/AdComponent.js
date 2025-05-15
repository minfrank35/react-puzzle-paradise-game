import React, { useEffect } from 'react';

const AdComponent = ({ adSlot, format = 'auto', responsive = true }) => {
  useEffect(() => {
    // AdSense 스크립트가 이미 로드되었는지 확인
    const hasAdScript = document.querySelector('script[src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
    
    // AdSense 스크립트가 로드되지 않았으면 로드
    if (!hasAdScript) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      // 실제 AdSense 계정 ID로 대체 필요
      script.dataset.adClient = 'ca-pub-XXXXXXXXXXXXXXXX';
      document.head.appendChild(script);
    }

    // 광고 실행
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense 광고 로드 실패:', e);
    }
  }, []);

  // 반응형 광고 스타일
  const adStyle = {
    display: 'block',
    textAlign: 'center',
  };

  return (
    <div className="ad-wrapper">
      <ins 
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // 실제 AdSense 계정 ID로 대체 필요
        data-ad-slot={adSlot} // 광고 슬롯 ID
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
};

export default AdComponent; 