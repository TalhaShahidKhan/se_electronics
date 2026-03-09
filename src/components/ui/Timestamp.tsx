'use client'

import { formatDate } from "@/utils"

interface ClientTimestampProps {
    timestamp: string | Date
}

export default function Timestamp({ timestamp }: ClientTimestampProps) {
    return (
        <span className="text-xs opacity-60">
            {formatDate(timestamp, true)}
        </span>
    )
}