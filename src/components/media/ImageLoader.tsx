'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

/**
 * A wrapper around next/image that provides a fade-in animation on load.
 * It should be placed inside a container with `position: relative` and a placeholder background
 * with the shimmer effect class (`img-container`).
 */
export function ImageLoader(props: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Image
      {...props}
      className={cn(
        props.className,
        'transition-opacity duration-300 ease-in',
        isLoading ? 'opacity-0' : 'opacity-100'
      )}
      onLoadingComplete={() => setIsLoading(false)}
    />
  );
}
