import React, { useEffect, useState } from 'react'

// Define an interface for the component's props
interface ParallaxImageProps {
  src: string // URL of the image
  alt: string // Description of the image
}

function ParallaxImage({ src, alt }: ParallaxImageProps) {
  const [offset, setOffset] = useState(0)

  const handleScroll = () => {
    const newOffset = window.pageYOffset
    setOffset(newOffset)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      style={{
        overflow: 'hidden',
        position: 'relative',
        height: '800px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '29%',
          transform: 'translateX(-50%)',
          width: '500px',
          fontSize: '1.25rem',
          zIndex: 1,
          whiteSpace: 'normal',
        }}
      >
        <h3>The Dawn of a New Era in Astronomy</h3>
        <p className="usa-paragraph text-base-lightest">
          Multimessenger and time-domain astrophysics are opening entirely new
          windows on the Universe. The Astrophysics Cross-Observatory Science
          Support (ACROSS) center is an initiative to facilitate communication,
          coordination, and collaboration in this new era of astronomy.
        </p>
      </div>
      <img
        src={src}
        alt={alt}
        style={{
          position: 'absolute',
          width: '100%',
          top: '-10%',
          bottom: '-5%',
          transform: `translateY(${offset * 0.5}px)`,
        }}
      />
    </div>
  )
}

export default ParallaxImage
