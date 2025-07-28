import { useEffect, useRef, useState } from 'react'


interface IProps {
    className?: string
    children: React.ReactNode
}


export function LazyLoader({ 
    className="", 
    children 
}: IProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.1 }
        )

        if (ref.current)
            observer.observe(ref.current)

        return () => observer.disconnect()
    }, [])

    return (
        <div ref={ref} className={`${className}`}>
            {isVisible ? children : null}
        </div>
    )
}
