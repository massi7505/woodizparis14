'use client';

import Script from 'next/script';

/**
 * Axeptio cookie consent — project ID: 69ceba880901893d94ab50ef
 * Loads the Axeptio SDK which handles the consent banner automatically.
 * The footer "Gérer les cookies" button calls window.openAxeptioCookies().
 */
export default function CookieConsent() {
  return (
    <>
      <Script id="axeptio-settings" strategy="afterInteractive">
        {`
          window.axeptioSettings = {
            clientId: "69ceba880901893d94ab50ef",
            cookiesVersion: "woodizparis14-fr",
          };
        `}
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
