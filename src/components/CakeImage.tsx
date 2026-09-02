"use client";

import { useState } from "react";
import Image from "next/image";
import { Cake as CakeIcon } from "lucide-react";

interface CakeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

export function CakeImage({
  src,
  alt,
  fill = false,
  width,
  height,
  priority = false,
  className = "",
}: CakeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`bg-neutral-100 flex flex-col items-center justify-center text-neutral-400 select-none ${className}`}
        style={!fill && width && height ? { width, height } : undefined}
      >
        <CakeIcon className="w-10 h-10 stroke-[1.5] mb-1" />
        <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">111 Bakery</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${fill ? "w-full h-full" : ""} ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 hover:scale-105"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
