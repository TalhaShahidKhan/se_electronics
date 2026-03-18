'use client'

import React from 'react';
import { User, Activity, Wallet, Wrench, Bell, Menu } from 'lucide-react';

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-white border-b border-gray-100 px-4 py-4 lg:px-8 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-gray-200 rounded-xl"></div>
                    <div className="hidden lg:block">
                        <div className="h-4 w-32 bg-gray-200 rounded-lg mb-2"></div>
                        <div className="h-3 w-20 bg-gray-100 rounded-lg"></div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="size-8 bg-gray-100 rounded-full"></div>
                    <div className="size-8 bg-gray-100 rounded-full"></div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-8 space-y-6">
                {/* Banner Skeleton */}
                <div className="w-full h-40 sm:h-64 bg-gray-200 rounded-3xl"></div>

                {/* Profile Card Skeleton */}
                <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-100 flex flex-col sm:flex-row justify-between gap-6">
                    <div className="space-y-4 flex-1">
                        <div className="h-4 w-24 bg-brand/10 rounded-lg"></div>
                        <div className="h-10 w-64 bg-gray-200 rounded-xl"></div>
                        <div className="flex gap-4">
                            <div className="h-6 w-32 bg-gray-100 rounded-lg"></div>
                            <div className="h-6 w-32 bg-gray-100 rounded-lg"></div>
                        </div>
                    </div>
                    <div className="size-20 lg:size-28 bg-gray-100 rounded-2xl self-center sm:self-auto"></div>
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 space-y-3">
                            <div className="size-10 bg-gray-50 rounded-xl"></div>
                            <div className="h-6 w-16 bg-gray-200 rounded-lg"></div>
                            <div className="h-3 w-24 bg-gray-100 rounded-lg"></div>
                        </div>
                    ))}
                </div>

                {/* Bottom Nav / Mobile Nav Peek */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-3xl shadow-2xl">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="size-8 bg-gray-100 rounded-xl"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
