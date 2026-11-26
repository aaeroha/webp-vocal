import { useEffect, useRef, useState } from 'react';

interface UseRevealOptions {
  threshold?: number;
  once?: boolean;
  rootMargin?: string;
}

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  optionsOrThreshold: number | UseRevealOptions = {}
) {
  const options: UseRevealOptions =
    typeof optionsOrThreshold === 'number'
      ? { threshold: optionsOrThreshold }
      : optionsOrThreshold;

  const {
    threshold = 0.06,
    once = false,
    rootMargin = '0px 0px -24px 0px',
  } = options;

  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(node);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, once, rootMargin]);

  return { ref, isVisible };
}
