'use client';

import Script from 'next/script';

/**
 * Axeptio cookie consent — project ID: 69ceba880901893d94ab50ef
 * No cookiesVersion set → Axeptio uses the latest published version automatically.
 */
export default function CookieConsent() {
  return (
    <>
      <Script id="axeptio-settings" strategy="afterInteractive">
        {`window.axeptioSettings = { clientId: "69ceba880901893d94ab50ef" };`}
      </Script>
      <Script
        id="axeptio-sdk"
        src="//static.axept.io/sdk.js"
        strategy="afterInteractive"
        async
      />
    </>
  );
}
