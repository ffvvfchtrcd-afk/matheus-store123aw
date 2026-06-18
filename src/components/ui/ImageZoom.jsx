import { useRef, useState } from 'react'

export function ImageZoom({ src, alt, className = '' }) {
  const containerRef = useRef(null)
  const [zoom, setZoom] = useState(false)
  const [bgPos, setBgPos] = useState('0% 0%')

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setBgPos(`${x}% ${y}%`)
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-crosshair ${className}`}
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={handleMouseMove}
      role="img"
      aria-label={alt}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-300"
        style={{ opacity: zoom ? 0 : 1 }}
      />
      {zoom && (
        <div
          className="absolute inset-0 bg-no-repeat"
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: bgPos,
            backgroundSize: '200%',
          }}
        />
      )}
    </div>
  )
}
