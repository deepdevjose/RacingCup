'use client'

import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function ScrollManager() {
    useLayoutEffect(() => {
        gsap.registerPlugin(ScrollTrigger)
    }, [])

    return null
}
