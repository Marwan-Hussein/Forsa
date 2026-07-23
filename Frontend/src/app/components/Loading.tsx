import { useLayoutEffect, useState } from "react";
import styled from "styled-components";

interface LoadingProps {
  isLoading?: boolean;
  message?: string;
  fullScreen?: boolean;
  backdrop?: boolean;
  className?: string;
}

export default function Loading({
  isLoading = false,
  message,
  fullScreen = false,
  backdrop = true,
  className,
}: LoadingProps) {
  if (!isLoading) return null;

  return (
    <StyledWrapper
      $fullScreen={fullScreen}
      $backdrop={backdrop}
      className={className}
    >
      <div className="content">
        <div className="spinner" aria-label={message ?? "Loading"} role="status">
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
        </div>
        {/* {message && <p>{message}</p>} */}
      </div>
    </StyledWrapper>
  );
}

export function GlobalRequestLoader() {
  const [pendingRequests, setPendingRequests] = useState(0);

  useLayoutEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      setPendingRequests((count) => count + 1);

      return originalFetch.call(window, input, init).finally(() => {
        setPendingRequests((count) => Math.max(0, count - 1));
      });
    }) as typeof window.fetch;

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <Loading isLoading={pendingRequests > 0} fullScreen/>;
}

const StyledWrapper = styled.div<{ $fullScreen: boolean; $backdrop: boolean }>`
  align-items: center;
  background: ${({ $fullScreen, $backdrop }) =>
    $fullScreen && $backdrop ? "rgba(255, 255, 255, 0.8)" : "transparent"};
  backdrop-filter: ${({ $fullScreen, $backdrop }) =>
    $fullScreen && $backdrop ? "blur(4px)" : "none"};
  display: flex;
  inset: ${({ $fullScreen }) => ($fullScreen ? "0" : "auto")};
  justify-content: center;
  min-height: ${({ $fullScreen }) => ($fullScreen ? "100vh" : "160px")};
  position: ${({ $fullScreen }) => ($fullScreen ? "fixed" : "relative")};
  width: 100%;
  z-index: ${({ $fullScreen }) => ($fullScreen ? "9999" : "auto")};

  .content {
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .spinner {
    --clr: #65abd2;
    --clr-alpha: rgba(117, 187, 226, 0.15);
    animation: spinner 2s infinite ease;
    height: 70.4px;
    position: relative;
    transform-style: preserve-3d;
    width: 70.4px;
  }

  .spinner > div {
    background-color: var(--clr-alpha);
    border: 3.5px solid var(--clr);
    height: 100%;
    position: absolute;
    width: 100%;
  }

  .spinner div:nth-of-type(1) {
    transform: translateZ(-35.2px) rotateY(180deg);
  }

  .spinner div:nth-of-type(2) {
    transform: rotateY(-270deg) translateX(50%);
    transform-origin: top right;
  }

  .spinner div:nth-of-type(3) {
    transform: rotateY(270deg) translateX(-50%);
    transform-origin: center left;
  }

  .spinner div:nth-of-type(4) {
    transform: rotateX(90deg) translateY(-50%);
    transform-origin: top center;
  }

  .spinner div:nth-of-type(5) {
    transform: rotateX(-90deg) translateY(50%);
    transform-origin: bottom center;
  }

  .spinner div:nth-of-type(6) {
    transform: translateZ(35.2px);
  }

  p {
    color: #0c3571;
    font-size: 14px;
    font-weight: 600;
    margin: 0;
  }

  @keyframes spinner {
    0% {
      transform: rotate(45deg) rotateX(-25deg) rotateY(25deg);
    }

    50% {
      transform: rotate(45deg) rotateX(-385deg) rotateY(25deg);
    }

    100% {
      transform: rotate(45deg) rotateX(-385deg) rotateY(385deg);
    }
  }
`;
