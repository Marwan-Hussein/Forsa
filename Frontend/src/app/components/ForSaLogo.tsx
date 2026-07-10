import React from "react";
export function ForSaLogo({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <img
      src="/forsa-logo.png"
      alt="ForSa"
      width={280}
      height={250}
      decoding="async"
      style={style}
      className={`w-auto max-w-[min(360px,72vw)] object-contain object-left shrink-0 ${className}`}
    />
  );
}
