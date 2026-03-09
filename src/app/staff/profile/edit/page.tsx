'use client'

import { updateMyProfile } from "@/actions/staffActions";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function EditProfilePage() {
    const router = useRouter();
    const [state, action, isPending] = useActionState(updateMyProfile, undefined);

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

                <form action={action} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                className="w-full border rounded p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">District</label>
                            <input
                                type="text"
                                name="currentDistrict"
                                className="w-full border rounded p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Police Station</label>
                            <input
                                type="text"
                                name="currentPoliceStation"
                                className="w-full border rounded p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Post Office</label>
                            <input
                                type="text"
                                name="currentPostOffice"
                                className="w-full border rounded p-2"
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Street Address</label>
                            <textarea
                                name="currentStreetAddress"
                                className="w-full border rounded p-2"
                                rows={3}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Skills (comma-separated)</label>
                            <input
                                type="text"
                                name="skills"
                                className="w-full border rounded p-2"
                                placeholder="e.g., IPS Repair, Battery Replacement, Installation"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Bio / Short Description</label>
                            <input
                                type="text"
                                name="bio"
                                className="w-full border rounded p-2"
                                placeholder="Brief description about yourself"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Profile Photo (optional - leave blank to keep current)</label>
                            <input
                                type="file"
                                name="photo"
                                accept="image/*"
                                className="w-full border rounded p-2"
                            />
                        </div>
                    </div>

                    {state && (
                        <div className={`p-3 rounded ${state.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {state.message}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-green-300"
                        >
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
