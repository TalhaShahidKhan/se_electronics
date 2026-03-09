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
            <>
                <span className="text-sm">{label} {required && <span className="text-red-500 text-lg">*</span>}</span>
                <div className="__center mb-4 w-full sm:max-w-[300px] h-[300px] rounded-lg relative overflow-hidden mt-1">
                    {previewImage &&
                        <div
                            onClick={() => {
                                setPreviewImage(src || null)
                                if (inputRef.current) inputRef.current.value = ''
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-500 text-white absolute top-3 cursor-pointer select-none right-3"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </div>
                    }
                    <label>
                        {previewImage ?
                            <Image src={previewImage} alt="" width={300} height={300} />
                            : <div className="inset-0 absolute cursor-pointer border-dashed border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center">
                                <span className="text-gray-400 text-sm">{restProps.placeholder || label}</span>
                                <span className="text-gray-400 text-xs">(Max size {process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE_MB} MB)</span>
                            </div>
                        }
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            name={restProps.name}
                            required={required}
                            onChange={handleFileChange}
                            className="absolute opacity-0 w-0 h-0"
                        />
                    </label>
                </div>
            </>
            :
            <label className="text-sm">
                {label} {required && <span className="text-red-500 text-lg">*</span>}
                <input {...restProps} required={required} className={clsx(restProps.className, "__input mt-1")} placeholder={restProps.placeholder || label} />
            </label>
        }
    </div>
}