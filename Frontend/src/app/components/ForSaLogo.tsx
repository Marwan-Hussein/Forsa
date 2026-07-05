export function ForSaLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src="/forsa-logo.png"
      alt="ForSa"
      width={280}
      height={250}
      decoding="async"
      className={`w-auto max-w-[min(360px,72vw)] object-contain object-left shrink-0 ${className}`}
    />
  );
}
