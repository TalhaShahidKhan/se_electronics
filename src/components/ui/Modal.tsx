'use client'

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Modal({ title, isVisible, onClose, width, children }: { title?: string, isVisible: boolean, width?: "500" | "600" | "700" | "800" | "900", onClose: () => void, children: React.ReactNode }) {
    const [shouldOverflow, setShouldOverflow] = useState(false)
    const containerRef = useRef<HTMLDivElement | null>(null)

    const widthVariants = {
        500: "sm:max-w-[500px]",
        600: "sm:max-w-[600px]",
        700: "sm:max-w-[700px]",
        800: "sm:max-w-[800px]",
        900: "sm:max-w-[900px]",
    }

    useEffect(() => {
        if (!isVisible || !containerRef.current) return;

        const container = containerRef.current;
        const resizeObserver = new ResizeObserver(() => {
            setShouldOverflow(container.clientHeight >= window.innerHeight);
        });

        resizeObserver.observe(container);

        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            resizeObserver.disconnect();
            document.body.style.overflow = original;
        };
    }, []);

    if (isVisible) {
        return createPortal(
            <div className={clsx(
                "bg-black bg-opacity-[0.3] inset-0 fixed z-10 __center overflow-auto",
                shouldOverflow && "sm:items-baseline sm:py-8"
            )}>
                <div ref={containerRef} className={clsx("p-4 sm:h-fit sm:rounded-md sm:mx-6 w-full h-full bg-white overflow-auto shadow-lg", width ? widthVariants[width] : `sm:max-w-[800px]`)}>
                    <header className="flex items-center justify-between mb-6">
                        <div className="font-medium text-xl">{title}</div>
                        <button onClick={onClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </header>
                    <div
                        className="h-auto">
                        {children}
                    </div>
                </div>
            </div>
            , document.body)
    } else {
        return null
    }
}
