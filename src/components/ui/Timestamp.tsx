"use client";

import { formatDate } from "@/utils";

interface ClientTimestampProps {
  timestamp: string | Date;
}

export default function Timestamp({ timestamp }: ClientTimestampProps) {
  return (
    <span className="text-sm opacity-60">{formatDate(timestamp, true)}</span>
  );
}
