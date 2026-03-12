'use client'

import { InputFieldProps } from "@/types"
import clsx from "clsx"
import Image from "next/image"
import { useRef, useState } from "react"
import { toast } from "react-toastify"

export default function InputField({ label, required = true, src, ...restProps }: InputFieldProps) {
    const [previewImage, setPreviewImage] = useState<string | null>(src || null)
    const inputRef = useRef<HTMLInputElement | null>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) {
            setPreviewImage(null)
            return
        }

        const file = files[0]
        const maxSize = Number(process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE_MB!) * 1024 * 1024

        if (file.size > maxSize) {
            toast.error("ফাইল ২ MB-এর বেশি হতে পারবে না!")
            e.target.value = ""
            setPreviewImage(null)
            return
        }

        setPreviewImage(URL.createObjectURL(file))
    }

    return <div className="flex-1 text-start">
        {restProps.type === 'file' ?
            <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-500 text-lg">*</span>}
                </span>
                <div className="relative group">
                    <div className={clsx(
                        "w-full h-[200px] sm:h-[250px] lg:h-[300px] rounded-2xl overflow-hidden border-2 border-dashed transition-all duration-300",
                        previewImage ? "border-brand shadow-md" : "border-gray-300 hover:border-brand/50 bg-gray-50/50"
                    )}>
                        {previewImage ? (
                            <div className="relative w-full h-full">
                                <Image 
                                    src={previewImage} 
                                    alt="Preview" 
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPreviewImage(null);
                                        if (inputRef.current) inputRef.current.value = '';
                                    }}
                                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/70 transition-colors z-10"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-4 text-center">
                                <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                    </svg>
                                </div>
                                <span className="text-sm font-semibold text-gray-700 block mb-1">
                                    {restProps.placeholder || `Upload ${label}`}
                                </span>
                                <span className="text-xs text-gray-500">
                                    JPG, PNG or WebP (Max {process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE_MB}MB)
                                </span>
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    name={restProps.name}
                                    required={required}
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </label>
                        )}
                    </div>
                </div>
            </div>
            :
            <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-500 text-lg">*</span>}
                </span>
                <input 
                    {...restProps} 
                    required={required} 
                    className={clsx(
                        "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm transition-all focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none",
                        restProps.className
                    )} 
                    placeholder={restProps.placeholder || `Enter ${label.toLowerCase()}`} 
                />
            </label>
        }
    </div>
}