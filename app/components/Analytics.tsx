"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    fbq: (...args: unknown[]) => void;
    ttq: {
      track: (event: string) => void;
    };
  }
}

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-XXXXXXXXXX', {
        page_path: pathname,
      });
    }

    // Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }

    // TikTok Pixel
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('PageView');
    }
  }, [pathname]);

  return null;
}

// Scripts à ajouter dans le head
export const AnalyticsScripts = () => (
  <>
    {/* Google Analytics */}
    <script
      async
      src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
    />
    <script
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXXXXXXX');
        `,
      }}
    />

    {/* Facebook Pixel */}
    <script
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(s,t)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', 'XXXXXXXXXX');
          fbq('track', 'PageView');
        `,
      }}
    />

    {/* TikTok Pixel */}
    <script
      dangerouslySetInnerHTML={{
        __html: `
          !function (w, d, t) {
            w[t] = w[t] || [];
            w[t].push({
              'ttq.load': 'XXXXXXXXXX',
              'ttq.track': 'PageView'
            });
            var s = d.createElement('script');
            s.src = 'https://analytics.tiktok.com/i18n/pixel/sdk.js?sdkid=XXXXXXXXXX';
            s.async = true;
            var e = d.getElementsByTagName('script')[0];
            e.parentNode.insertBefore(s, e);
          }(window, document, 'ttq');
        `,
      }}
    />
  </>
); 