"use client";

import { useEffect, useRef, useState } from "react";

function CountUp({
  end,
  duration = 1500,
  styles,
}: {
  end: number;
  duration?: number;
  styles?: string;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasStarted = useRef(false);

  // Set up Intersection Observer to trigger animation when element enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Trigger animation when element becomes visible
          if (entry.isIntersecting && !hasStarted.current) {
            hasStarted.current = true;
            setIsVisible(true);
            // Unobserve after first intersection to avoid re-triggering
            observer.unobserve(entry.target);
          }
        });
      },
      {
        // Trigger callback when element is 10% visible in viewport
        threshold: 0.1,
        // Add margin to start animation slightly before element is in view
        rootMargin: "0px 0px -50px 0px",
      },
    );

    // Start observing the element
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    // Cleanup observer on unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  // Run count-up animation only when element becomes visible
  useEffect(() => {
    // Only start animation if element is visible and hasn't been counted yet
    if (!isVisible) {
      return;
    }

    let start = 0;
    const increment = end / (duration / 16); // 60fps ~ 16ms/frame

    // Animate the counter at 60fps (every ~16ms)
    const counter = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(counter);
      }
      // Round to 2 decimal places for clean display
      setCount(+start.toFixed(2) || 0);
    }, 16);

    // Cleanup interval on unmount or when animation completes
    return () => clearInterval(counter);
  }, [isVisible, end, duration]);

  return (
    <span ref={elementRef} className={styles}>
      {count ?? "0"}
    </span>
  );
}

export default CountUp;
