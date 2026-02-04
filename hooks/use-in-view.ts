"use client"

import { useEffect, useState, RefObject } from "react"

interface UseInViewOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

export function useInView(
  ref: RefObject<Element | null>,
  options: UseInViewOptions = {}
): boolean {
  const { threshold = 0, rootMargin = "0px", once = true } = options
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          if (once) {
            observer.unobserve(element)
          }
        } else if (!once) {
          setIsInView(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [ref, threshold, rootMargin, once])

  return isInView
}
