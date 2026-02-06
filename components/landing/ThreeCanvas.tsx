'use client'

import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Clone, useGLTF, Environment, ContactShadows } from '@react-three/drei'
import { ACESFilmicToneMapping } from 'three'

// Component for the 3D Model with mouse interaction
function CarModel() {
    const { scene } = useGLTF('/3dmodels/rc_shvan_-_low_poly_model.glb')
    const modelRef = useRef<any>(null)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            const x = (event.clientX / window.innerWidth) * 2 - 1
            const y = -(event.clientY / window.innerHeight) * 2 + 1
            setMousePosition({ x, y })
        }

        window.addEventListener('mousemove', handleMouseMove)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    useFrame(() => {
        if (modelRef.current) {
            const baseRotationY = -0.4 // Initial rotation offset
            const maxRotation = 0.3
            const targetRotationY = baseRotationY + (-mousePosition.x * maxRotation)
            const targetRotationX = mousePosition.y * maxRotation * 0.3

            modelRef.current.rotation.y += (targetRotationY - modelRef.current.rotation.y) * 0.05
            modelRef.current.rotation.x += (targetRotationX - modelRef.current.rotation.x) * 0.05
        }
    })

    return (
        <group ref={modelRef} rotation={[0, -0.4, 0]}>
            <Clone object={scene} scale={7} position={[0, -1, 0]} />
        </group>
    )
}

// Ground plane component
function Ground() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#29d1f4" />
        </mesh>
    )
}

// Preload the 3D model
useGLTF.preload('/3dmodels/rc_shvan_-_low_poly_model.glb')

export default function ThreeCanvas() {
    return (
        <Canvas
            camera={{ position: [0, 1.5, 6], fov: 50 }}
            style={{ width: '100%', height: '100%', background: 'transparent' }}
            gl={{
                toneMapping: ACESFilmicToneMapping,
                toneMappingExposure: 1.1,
                alpha: true
            }}
        >
            <Suspense fallback={null}>
                {/* Environment map for realistic reflections */}
                <Environment preset="sunset" background={false} />


                {/* Ground shadow */}
                <ContactShadows
                    position={[0, -0.99, 0]}
                    opacity={0.5}
                    scale={15}
                    blur={2}
                    far={5}
                    color="#000000"
                />

                {/* Lighting */}
                <ambientLight intensity={0.5} color="#ffffff" />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1.2}
                    color="#ffffff"
                />
                <directionalLight
                    position={[-5, 5, 5]}
                    intensity={0.8}
                    color="#ffffff"
                />

                <CarModel />
            </Suspense>
        </Canvas>
    )
}
