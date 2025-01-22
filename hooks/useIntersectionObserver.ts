"use client";

import { useRef, useCallback } from 'react';

export function useIntersectionObserver(callback: IntersectionObserverCallback) {
  const observer = useRef<IntersectionObserver | null>(null);

  const getObserver = useCallback(() => {
    if (!observer.current) {
      observer.current = new IntersectionObserver(callback, {
        threshold: [0, 1]
      });
    }
    return observer.current;
  }, [callback]);

  const observeElement = useCallback((element: Element) => {
    const observer = getObserver();
    observer.observe(element);
  }, [getObserver]);

  const unobserveElement = useCallback((element: Element) => {
    const observer = getObserver();
    observer.unobserve(element);
  }, [getObserver]);

  return { observeElement, unobserveElement };
}