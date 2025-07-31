import { useState, ReactNode } from "react"

interface CarouselProps {
    children: ReactNode[]
    itemsPerPage?: number
}

export const Carousel = ({ 
    children, 
    itemsPerPage = 1,
}: CarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0)

    const totalPages = Math.ceil(children.length / itemsPerPage)

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : totalPages - 1))
    }

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex < totalPages - 1 ? prevIndex + 1 : 0))
    }

    return (
        <div className="relative w-full overflow-hidden">
            <p className="text-white">
                {currentIndex}
            </p>
            <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ 
                    transform: `translateX(-${(currentIndex * 100) / itemsPerPage}%)`, 
                    width: `${(children.length * 100) / itemsPerPage}%` 
                }}
            >
                {children.map((child, index) => (
                    <div 
                        key={index} 
                        className={`flex-shrink-0 p-4`}
                        style={{
                            width: `${100 / itemsPerPage}%`
                        }}
                    >
                        {child}
                    </div>
                ))}
            </div>

            {/* Navigation buttons */}
            {
                currentIndex !== 0 &&
                <button
                    onClick={handlePrev}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 bg-gray-800 text-white"
                >
                    Prev
                </button>
            }

            {
                currentIndex !== totalPages - 1 &&
                <button
                    onClick={handleNext}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 bg-gray-800 text-white"
                >
                    Next
                </button>
            }
        </div>
    )
}
