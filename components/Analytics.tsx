import Script from "next/script";

/**
 * Carrega Meta Pixel e Google Analytics — só se os IDs estiverem no .env.
 * Sem os IDs, não renderiza nada (zero impacto).
 *   NEXT_PUBLIC_FB_PIXEL_ID  → Meta (Facebook/Instagram) Pixel
 *   NEXT_PUBLIC_GA_ID        → Google Analytics 4 (G-XXXXXXX)
 */
const PIXEL = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const GA = process.env.NEXT_PUBLIC_GA_ID;

export default function Analytics() {
  return (
    <>
      {GA && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA}');`}
          </Script>
        </>
      )}

      {PIXEL && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
