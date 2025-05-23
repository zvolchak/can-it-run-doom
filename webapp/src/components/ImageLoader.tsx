import { useState } from 'react'
import Image, { ImageProps } from 'next/image'


interface IImageLoaderProps extends Omit<ImageProps, "alt"> {
    src: any
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
    const [imageSrc, setImageSrc] = useState<string>()
    const parentProps = { ...props }
    delete parentProps["defaultSrc"]

    function handleImageLoadError() {
        setImageSrc(src || defaultSrc || imageSrc || "")
    } // handleImageLoadError

    const Tag = (src as string)?.startsWith("blob") ? "img" : Image
    return (
        <Tag 
            key={(src || "img").toString()}
            alt={alt || ""}
            unoptimized
            width={130} 
            height={100} 
            onError={handleImageLoadError}
            { ...parentProps }
            src={src || defaultSrc || imageSrc || ""} 
            className={`object-contain hover:cursor-pointer max-h-80 ${props.className}`}
        />
    )
}
