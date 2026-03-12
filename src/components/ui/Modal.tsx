'use client'

import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Modal({ title, isVisible, onClose, width, children }: { title?: string, isVisible: boolean, width?: "500" | "600" | "700" | "800" | "900", onClose: () => void, children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    const widthVariants = {
        500: "sm:max-w-[500px]",
        600: "sm:max-w-[600px]",
        700: "sm:max-w-[700px]",
        800: "sm:max-w-[800px]",
        900: "sm:max-w-[900px]",
    }

    useEffect(() => {
        setMounted(true);
        if (isVisible) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isVisible]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0.5 }}
                        sm={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={clsx(
                            "relative w-full bg-white shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]",
                            "rounded-t-3xl sm:rounded-3xl",
                            width ? widthVariants[width] : "sm:max-w-[800px]"
                        )}
                    >
                        {/* Header */}
                        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0 bg-white sticky top-0 z-10">
                            <h3 className="font-extrabold text-lg sm:text-xl text-brand truncate pr-4">
                                {title || "Modal Title"}
                            </h3>
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-brand"
                            >
                                <X size={20} />
                            </button>
                        </header>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
