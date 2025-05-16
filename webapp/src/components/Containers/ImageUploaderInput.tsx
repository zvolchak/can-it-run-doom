import React, { ChangeEvent, useState } from "react"
import { FaRegWindowClose } from "react-icons/fa"
import { validateImageFile } from "@/src/utils"

type ImageUploaderInputProps = {
    onImageSelect?: (e: any) => void
    name?: string
    className?: string
}

export function ImageUploaderInput({
    onImageSelect = null,
    name = "previewImg",
    className = "",
}: ImageUploaderInputProps) {
    const [imageError, setImageError] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)


    // Function to handle file selection
    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return // Exit early if no file is selected

        processFile(file)
    } // handleFileChange


    // Function to process the file (resize if needed)
    function processFile(file: File) {
        const reader = new FileReader()

        reader.onload = function (event) {
            const img = new Image()
            img.onload = function () {
                if (img.width <= 400) {
                    // No resizing if at or below 400px
                    updateFileState(file)
                    return
                }

                resizeImage(file, img)
            } // onload

            img.onerror = function () {
                setImageError("Failed to load the image.")
            } // onerror

            img.src = event.target?.result as string
        } // onload

        reader.onerror = function () {
            setImageError("Failed to read the file.")
        } // onerror

        reader.readAsDataURL(file)
    } // processFile


    // Function to resize the image
    function resizeImage(file: File, img: HTMLImageElement) {
        const MAX_WIDTH = 400
        const scaleFactor = MAX_WIDTH / img.width
        const newWidth = MAX_WIDTH
        const newHeight = img.height * scaleFactor

        const canvas = document.createElement("canvas")
        canvas.width = newWidth
        canvas.height = newHeight
        const ctx = canvas.getContext("2d")
        if (!ctx) {
            setImageError("Failed to process the image.")
            return
        }

        ctx.drawImage(img, 0, 0, newWidth, newHeight)

        canvas.toBlob((blob) => {
            if (!blob) {
                setImageError("Failed to resize the image.")
                return
            }

            const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
            })

            validateAndSetFile(resizedFile)
        },
        file.type,
        0.9 // Quality (0.0 to 1.0, for JPEG/PNG)
        ) // toBlob
    } // resizeImage


    // Function to validate and update the file state
    function validateAndSetFile(file: File) {
        validateImageFile(file).then(function (isValid) {
            if (!isValid?.valid) {
                const defaultMessage =
                    "File should be: less than 400x400px, no more than 300kb, and in png, jpg or jpeg format."
                setImageError(isValid?.message || defaultMessage)
                setImageFile(null)
                return
            }

            updateFileState(file)
        })
    }


    // Function to update the file state and trigger the callback
    function updateFileState(file: File) {
        setImageError(null)
        setImageFile(file)
        onImageSelect?.({
            target: {
                name: name,
                files: [file],
            },
        })
    }


    // Function to clear the selected file
    function handleClearFile() {
        setImageFile(null)
        setImageError(null)
        onImageSelect?.({
            target: {
                name: name,
                files: [],
            },
        })
    }


    return (
        <div className={className}>
            <label className="block mb-3">Preview Image</label>

            {imageError && (
                <div className="doom-color-danger self-center mb-5">{imageError}</div>
            )}

            <div className="flex flex-row items-center">
                <div
                    className="doom-btn-default py-2 px-3"
                    onClick={() => document.getElementById("imgUrl-file-input")?.click()}
                >
                    {imageFile
                        ? `File: ${imageFile.name.slice(0, 30)}`
                        : "Upload Image"}
                    <input
                        id="imgUrl-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                {imageFile && (
                    <button
                        className="doom-btn ml-4"
                        onClick={handleClearFile}
                    >
                        <FaRegWindowClose size={24} />
                    </button>
                )}
            </div>
        </div>
    )
}

export default ImageUploaderInput
