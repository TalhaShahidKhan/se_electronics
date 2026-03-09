'use client'

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

export default function ImageWithLightbox(props: React.ImgHTMLAttributes<HTMLImageElement>) {
    const [openLightbox, setOpenLightbox] = useState(false)

    useEffect(() => {
        const original = document.body.style.overflow;
        if (openLightbox) document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = original;
        };
    }, [openLightbox]);

    if (!props.src) return null
    return <>
        {openLightbox &&
            createPortal(
                <div className={"bg-black bg-opacity-[0.8] inset-0 h-screen fixed z-10 __center overflow-auto"}>
                    <button className="absolute top-5 rounded-full p-2 right-5 text-white" onClick={() => setOpenLightbox(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="size-[95%] sm:size-[70%] __center">
                        <img src={props.src} className="h-full object-contain" alt="" />
                    </div>
                </div>,
                document.body
            )
        }
        <img onClick={() => setOpenLightbox(true)} {...props} />
        {/* <Image
            onClick={() => setOpenLightbox(true)}
            src={props.src}
            width={Number(props.width)}
            height={Number(props.height)}
            {...props}
        /> */}
    </>
}