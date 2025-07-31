import { useState } from 'react'
import Image, { ImageProps } from 'next/image'


interface IImageLoaderProps extends Omit<ImageProps, "alt"> {
    src: any
    defaultSrc?: string
    alt?: string
    width?: number
    height?: number
    className?: string
}


export const ImageLoader = (props: IImageLoaderProps) => {
    const {
        src,
        alt,
        width=200,
        height=200,
        defaultSrc = "/doom-placeholder.jpeg",
    } = props
    const [imageSrc, setImageSrc] = useState<string>()
    const parentProps = { ...props }
    delete parentProps["defaultSrc"]

    function handleImageLoadError() {
        setImageSrc(src || defaultSrc || imageSrc || "")
    } // handleImageLoadError

    const ImgHtmlTag = (src as string)?.startsWith("blob") ? "img" : Image
    return (
        <ImgHtmlTag 
            key={(src || "img").toString()}
            alt={alt || ""}
            unoptimized
            width={width} 
            height={height} 
            onError={handleImageLoadError}
            { ...parentProps }
            src={src || defaultSrc || imageSrc || ""} 
            className={`${props.className}`}
        />
    )
}
