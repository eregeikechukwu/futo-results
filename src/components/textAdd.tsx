"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * TextAdd Component
 *
 * A typewriter effect component that animates text character by character
 * with a blinking cursor. After typing completes, it backspaces the text
 * before retyping in a continuous loop.
 *
 * @param children - The text string to animate
 */
export function TextAdd({ children }: { children: string }) {
  // State for currently visible characters
  const [textVis, setVisState] = useState<string[]>([""]);

  // State for cursor blink animation
  const [cursor, setCursor] = useState(true);

  // Refs to store interval IDs for cleanup
  const typeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const backspaceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cursorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const loopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Split text into character array once
  const characters = useRef(children.split("")).current;

  /**
   * Clears all active intervals and timeouts to prevent memory leaks
   */
  const clearAllIntervals = useCallback(() => {
    if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    if (backspaceIntervalRef.current)
      clearInterval(backspaceIntervalRef.current);
    if (cursorIntervalRef.current) clearInterval(cursorIntervalRef.current);
    if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
  }, []);

  /**
   * Animates the backspace effect, removing characters one by one
   * @param onComplete - Callback function to execute after backspace completes
   */
  const animateBackspace = useCallback((onComplete: () => void) => {
    // Clear any existing backspace animation
    if (backspaceIntervalRef.current)
      clearInterval(backspaceIntervalRef.current);

    backspaceIntervalRef.current = setInterval(() => {
      setVisState((prev) => {
        if (prev.length > 0) {
          // Remove last character
          return prev.slice(0, -1);
        } else {
          // Backspace complete, clean up and trigger callback
          if (backspaceIntervalRef.current)
            clearInterval(backspaceIntervalRef.current);
          onComplete();
          return prev;
        }
      });
    }, 50); // 50ms per character deletion (faster than typing)
  }, []);

  /**
   * Animates the typewriter effect character by character
   * @param onComplete - Callback function to execute after typing completes
   */
  const animateTyping = useCallback(
    (onComplete: () => void) => {
      let charIndex = 0;

      // Clear any existing typing animation
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);

      // Reset visible text
      setVisState([]);

      // Type each character with delay
      typeIntervalRef.current = setInterval(() => {
        if (charIndex < characters.length) {
          setVisState((prev) => [...prev, characters[charIndex - 1]]);
          charIndex++;
        } else {
          // Typing complete, clean up and trigger callback
          if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
          onComplete();
        }
      }, 100); // 100ms per character for smooth typing
    },
    [characters],
  );

  /**
   * Runs the complete animation cycle: type -> pause -> backspace -> repeat
   */
  const runAnimationCycle = useCallback(() => {
    // Step 1: Type the text
    animateTyping(() => {
      // Step 2: Pause after typing completes
      loopTimeoutRef.current = setTimeout(() => {
        // Step 3: Backspace the text
        animateBackspace(() => {
          // Step 4: Brief pause before retyping
          loopTimeoutRef.current = setTimeout(() => {
            // Step 5: Restart the cycle
            runAnimationCycle();
          }, 500); // 500ms pause before retyping
        });
      }, 2000); // 2 second pause after typing completes
    });
  }, [animateTyping, animateBackspace]);

  /**
   * Initialize animations on mount
   */
  useEffect(() => {
    // Start cursor blink animation
    cursorIntervalRef.current = setInterval(() => {
      setCursor((prev) => !prev);
    }, 500); // Blink every 500ms

    // Start the animation cycle
    runAnimationCycle();

    // Cleanup all intervals on unmount
    return () => {
      clearAllIntervals();
    };
  }, [runAnimationCycle, clearAllIntervals]);

  return (
    <span className="relative inline-flex items-center leading-none">
      <span>{textVis.join("")}</span>

      <span
        className={`absolute left-full ml-[2px] top-1/2 -translate-y-1/2 w-[2px] h-[1em] bg-current transition-opacity duration-100 ${
          cursor ? "opacity-100" : "opacity-0"
        } ${textVis.length === 0 && "md:!translate-y-[-3rem] -translate-y-7!"}`}
        aria-hidden="true"
      />
    </span>
  );
}
