'use client'

import dynamic from 'next/dynamic'

import { usePrefersReducedMotion } from '@/lib/hooks/use-prefers-reduced-motion'

const HeroScene = dynamic(() => import('./hero-scene'), {
  ssr: false,
  loading: () => <div className="hero-scene-fallback" aria-hidden="true" />,
})

export function HeroSceneMount() {
  const reducedMotion = usePrefersReducedMotion()

  if (reducedMotion) {
    return <div className="hero-scene-fallback" aria-hidden="true" />
  }

  return <HeroScene />
}
