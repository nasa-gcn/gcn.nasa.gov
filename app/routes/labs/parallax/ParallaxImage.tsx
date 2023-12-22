import type { CSSProperties, ReactNode } from 'react'
import React, { useState } from 'react'
import { useEventListener } from 'usehooks-ts'

// Define an interface for the component's props
interface ParallaxImageProps {
  src: string
  alt: string
  title?: string
  paragraph?: string
  containerStyle?: CSSProperties
  textStyle?: CSSProperties
  imageStyle?: CSSProperties
  children?: ReactNode
}

// Define a default container style
const defaultContainerStyle: CSSProperties = {
  overflow: 'hidden',
  position: 'relative',
  height: '800px',
}

// Define a default text style
const defaultTextStyle: CSSProperties = {
  position: 'absolute',
  top: '10%',
  left: '29%',
  transform: 'translateX(-50%)',
  width: '500px',
  fontSize: '1.25rem',
  zIndex: 1,
  whiteSpace: 'normal',
}

// Define a default image style
const defaultImageStyle: CSSProperties = {
  position: 'absolute',
  width: '100%',
  top: '-10%',
  bottom: '-5%',
}

export function ParallaxImage({
  src,
  alt,
  containerStyle = defaultContainerStyle,
  textStyle = defaultTextStyle,
  imageStyle = defaultImageStyle,
  children, // Add children here
}: ParallaxImageProps) {
  const [offset, setOffset] = useState(0)

  const handleScroll = () => {
    const newOffset = window.pageYOffset
    setOffset(newOffset)
  }

  // Using useEventListener hook
  useEventListener('scroll', handleScroll)

  return (
    <div style={containerStyle}>
      <div style={textStyle}>
        {children} {/* Use children instead of specific title and paragraph */}
      </div>
      <img
        src={src}
        alt={alt}
        style={{
          transform: `translateY(${offset * 0.5}px)`,
          ...imageStyle,
        }}
      />
    </div>
  )
}
