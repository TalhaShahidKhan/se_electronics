'use client'

import { useEffect, useState } from 'react'
import { WifiOff, Wifi } from 'lucide-react'
import { clsx } from 'clsx'

export default function ConnectivityAlert() {
    const [status, setStatus] = useState<'online' | 'offline' | 'back-online'>('online')
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const handleOffline = () => {
            setStatus('offline')
            setIsVisible(true)
        }

        const handleOnline = () => {
            setStatus('back-online')
            setIsVisible(true)
            setTimeout(() => {
                setIsVisible(false)
                setStatus('online')
            }, 3000)
        }

        window.addEventListener('offline', handleOffline)
        window.addEventListener('online', handleOnline)

        // Initial check
        if (!navigator.onLine) {
            handleOffline()
        }

        return () => {
            window.removeEventListener('offline', handleOffline)
            window.removeEventListener('online', handleOnline)
        }
    }, [])

    if (!isVisible) return null

    return (
        <div className={clsx(
            "fixed top-0 left-0 right-0 z-[9999] p-2 text-center text-sm font-bold transition-all duration-500",
            status === 'offline' ? "bg-red-500 text-white" : "bg-green-500 text-white"
        )}>
            <div className="flex items-center justify-center gap-2">
                {status === 'offline' ? (
                    <>
                        <WifiOff className="size-4 animate-pulse" />
                        <span>আপনি অফলাইনে আছেন। ইন্টারনেট সংযোগ পরীক্ষা করুন।</span>
                    </>
                ) : (
                    <>
                        <Wifi className="size-4" />
                        <span>ইন্টারনেট ফিরে এসেছে!</span>
                    </>
                )}
            </div>
        </div>
    )
}
