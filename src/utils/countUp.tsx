"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16); // 60fps ~ 16ms/frame

    const counter = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(counter);
      }
      setCount(+start.toFixed(2));
    }, 16);

    return () => clearInterval(counter);
  }, [end, duration]);

  return <span className={styles}>{count}</span>;
}

export default CountUp;
