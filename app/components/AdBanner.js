'use client';
import { useEffect } from 'react';

const PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-XXXXXXXXXXXXXXXX';

// Replace these slot IDs after creating ad units in AdSense dashboard
const AD_SLOTS = {
  banner: '1234567890',     // Leaderboard 728x90
  rectangle: '0987654321', // Rectangle 300x250
  sidebar: '1122334455',   // Sidebar 300x600
};

export function AdBanner({ type = 'banner', className = '' }) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  const slotId = AD_SLOTS[type] || AD_SLOTS.banner;
  const styles = {
    banner:    { display: 'inline-block', width: '100%', height: '90px' },
    rectangle: { display: 'inline-block', width: '300px', height: '250px' },
    sidebar:   { display: 'inline-block', width: '300px', height: '600px' },
  };

  return (
    <div className={`ad-unit ${className}`} style={{ overflow: 'hidden', textAlign: 'center' }}>
      <ins
        className="adsbygoogle"
        style={styles[type] || styles.banner}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
