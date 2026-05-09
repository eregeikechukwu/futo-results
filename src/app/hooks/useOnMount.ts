import { useEffect, useState } from "react";

export function useOnMount() {
  const [isDomMounted, setIsDomMounted] = useState(false);

  useEffect(() => {
    setIsDomMounted(true);
  }, []);

  return isDomMounted;
}
