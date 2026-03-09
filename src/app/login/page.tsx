'use client'

import { login } from "@/actions";
import Image from "next/image";
import { useActionState } from "react";
import { toast } from "react-toastify";
import { useEffect } from "react";

export default function LoginPage() {
    const [response, loginAction, isPending] = useActionState(login, undefined)

    useEffect(() => {
        if (!response?.success) {
            toast.error(response?.message)
        }
    }, [response])

    return (
        <div className="flex flex-col gap-10 items-center top-32 absolute inset-0">
            <div className="flex flex-col items-center w-[340px] gap-4">
                <Image src='/logo.jpg' alt="" width={150} height={150} />
                <span className="font-semibold text-xl">SE Electronics Dashoard</span>
            </div>
            <form action={loginAction} className="w-[275px] flex flex-col gap-3">
                <div className="flex flex-col gap-3">
                    <input
                        name="username"
                        autoCapitalize="off"
                        type="text"
                        placeholder="Username"
                        className="__input"
                        required
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        className="__input"
                        required
                    />
                </div>
                <button
                    disabled={isPending}
                    className="__btn w-full disabled:bg-opacity-50"
                >
                    {isPending ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}
