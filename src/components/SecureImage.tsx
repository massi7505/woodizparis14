'use client';

import Image, { ImageProps } from 'next/image';
import { buildProxySrc, shouldUseProxy } from '@/lib/image-proxy';

type Mode = 'safe' | 'secure';

interface SecureImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string;
  productName?: string;
  businessName?: string;
  mode?: Mode;
  /** Override the generated alt text */
  alt?: string;
}

/**
 * Drop-in replacement for next/image with optional URL obfuscation.
 *
 * mode="safe"   → renders exactly like <Image> (no proxy)
 * mode="secure" → routes the image through /api/image (production only by default)
 *
 * Alt text is auto-generated as "businessName - productName" when not provided.
 * Title is set to "businessName | productName" for SEO tooltip.
 * draggable={false} prevents casual right-click saves on mobile.
 */
export default function SecureImage({
  src,
  productName,
  businessName,
  mode,
  alt,
  ...props
}: SecureImageProps) {
  const resolvedSrc = shouldUseProxy(mode) ? buildProxySrc(src) : src;

  const autoAlt = alt
    ?? (businessName && productName
      ? `${businessName} - ${productName}`
      : productName ?? businessName ?? '');

  const title =
    businessName && productName
      ? `${businessName} | ${productName}`
      : undefined;

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={autoAlt}
      title={title}
      draggable={false}
    />
  );
}
