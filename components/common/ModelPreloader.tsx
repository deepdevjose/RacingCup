'use client'

import { useEffect } from 'react'

/**
 * Model preloader component
 * Starts loading 3D models immediately and caches them using the Cache API
 * for faster subsequent visits
 */

const MODELS_TO_PRELOAD = [
    '/3dmodels/rc_shvan_-_low_poly_model.glb'
]

const CACHE_NAME = 'racing-cup-3d-models-v1'

async function preloadAndCacheModels() {
    // Check if Cache API is available
    if (!('caches' in window)) {
        // Fallback: just fetch to warm up browser cache
        MODELS_TO_PRELOAD.forEach(url => {
            fetch(url).catch(() => { })
        })
        return
    }

    try {
        const cache = await caches.open(CACHE_NAME)

        for (const modelUrl of MODELS_TO_PRELOAD) {
            // Check if already cached
            const cachedResponse = await cache.match(modelUrl)

            if (!cachedResponse) {
                // Fetch and cache the model
                const response = await fetch(modelUrl)
                if (response.ok) {
                    await cache.put(modelUrl, response.clone())
                    console.log(`[ModelPreloader] Cached: ${modelUrl}`)
                }
            } else {
                console.log(`[ModelPreloader] Already cached: ${modelUrl}`)
            }
        }
    } catch (error) {
        console.warn('[ModelPreloader] Cache failed, using standard fetch:', error)
        // Fallback to standard preload
        MODELS_TO_PRELOAD.forEach(url => {
            fetch(url).catch(() => { })
        })
    }
}

export default function ModelPreloader() {
    useEffect(() => {
        // Start preloading immediately on mount
        preloadAndCacheModels()
    }, [])

    // This component renders nothing
    return null
}
