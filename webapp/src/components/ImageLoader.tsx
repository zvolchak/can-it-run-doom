import { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'


interface IImageLoaderProps extends Omit<ImageProps, "alt"> {
    defaultSrc?: string
    alt?: string
    className?: string
}


export const ImageLoader = (props: IImageLoaderProps) => {
    const {
        src,
        alt,
        defaultSrc = "/doom-placeholder.jpeg",
    } = props
    const [imageSrc, setImageSrc] = useState(src || defaultSrc)
    const parentProps = { ...props }
    delete parentProps["defaultSrc"]

    function handleImageLoadError() {
        setImageSrc(defaultSrc)
    } // handleImageLoadError

    
    return (
        <Image 
            key={src.toString()}
            alt={alt || "Image for an item"}
            width={130} 
            height={100} 
            onError={handleImageLoadError}
            { ...parentProps }
            src={imageSrc} 
            className={`object-contain hover:cursor-pointer max-h-80 ${props.className}`}
        />
    )
}
