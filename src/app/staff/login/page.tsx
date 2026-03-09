'use client'

import { staffLogin } from "@/actions";
import { useState } from "react";
import { toast } from "react-toastify";
import { useActionState } from "react";
import { useRouter } from "next/navigation";

export default function StaffLoginPage() {
    const [state, loginAction, isPending] = useActionState(staffLogin, undefined);
    const [username, setUsername] = useState('');
    const router = useRouter();

    const handleSubmit = () => {
        if (!username.trim()) {
            toast.error('Please enter your username');
            return;
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Staff Login</h1>
                    <p className="text-sm text-gray-500 mt-2">SE Electronics Service Team</p>
                </div>

                <form action={loginAction} className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {(state && !state.success) && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                            {state.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                    >
                        {isPending ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Technical & Electrician Staff Portal</p>
                    <p className="mt-1">Contact admin if you need assistance</p>
                </div>
            </div>
        </div>
    );
}
