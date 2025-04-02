import React, { useState, useEffect } from "react"
import Image from 'next/image'
``

export function LoadingIcon({ className = "", width = 128, height = 128}) {
    const frames = [
        "/icons/doom-guy-look-left.png", 
        "/icons/doom-guy-look-right.png",
        "/icons/doom-guy-look-left.png", 
        "/icons/doom-guy-look-left.png", 
        "/icons/doom-guy-look-right.png",
        "/icons/doom-guy-look-right.png",
        "/icons/doom-guy-look-left.png", 
        "/icons/doom-guy-look-right.png",
        "/icons/doom-guy-look-forward.png",
        "/icons/doom-guy-look-forward.png",
        "/icons/doom-guy-grin-left.png",
        "/icons/doom-guy-grin-right.png",
        "/icons/doom-guy-grin-left.png",
        "/icons/doom-guy-grin-right.png",
    ]
    const [frameIndex, setFrameIndex] = useState(0)
  
    useEffect(() => {
      const intervalId = setInterval(() => {
        setFrameIndex(prev => (prev + 1) % frames.length)
      }, 500)
      return () => clearInterval(intervalId)
    }, [frames.length])

    return (
        <Image 
            className={`loading-icon w-10 h-10 ${className}`} alt="loading" 
            src={frames[frameIndex]}
            width={width}
            height={height}
        />
    )
}
