import { useEffect, useState } from "react";
import { unsplash_tool } from "../utils/unsplash";
import { cn } from "./ui/utils";

const FALLBACK_SRC =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80";

export type ImageWithFallbackProps =
  | { alt: string; className?: string; src: string }
  | { alt: string; className?: string; query: string };

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const { alt, className } = props;
  const [imgSrc, setImgSrc] = useState(() =>
    "src" in props ? props.src : FALLBACK_SRC
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    if ("src" in props) {
      setImgSrc(props.src);
      return;
    }
    let cancelled = false;
    unsplash_tool(props.query).then((url) => {
      if (!cancelled) setImgSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, ["src" in props ? props.src : props.query]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={cn(
        "transition-opacity duration-500 ease-out",
        loaded ? "opacity-100" : "opacity-0",
        className,
      )}
      onLoad={() => setLoaded(true)}
      onError={() => setImgSrc(FALLBACK_SRC)}
    />
  );
}
