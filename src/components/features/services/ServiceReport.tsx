'use client'

import { useState } from "react"
import clsx from "clsx"
import { contactDetails, installCancelationReasons, serviceCancelationReasons } from "@/constants"
import { reportService } from "@/actions"
import { StaffServiveReport, Statuses } from "@/types"
import { toast } from "react-toastify"
import Link from "next/link"

export default function ServiceReport({ serviceData }: {
    serviceData: {
        serviceId: string
        serviceType: 'install' | 'repair'
        serviceStatus: Statuses
        statusArray: string[]
        customerName: string
        customerPhone: string
    }
}) {
    const { serviceId, serviceType, serviceStatus, statusArray, customerName, customerPhone } = serviceData

    // Screen control
    const [currentScreen, setCurrentScreen] = useState<'journey' | 'report' | 'success'>(
        statusArray.includes('staff_arrived') ? 'report' : 'journey'
    )

    // Whether to disable "আমি রওনা দিয়েছি" button
    const [disableDepartedButton, setDisableDepartedButton] = useState(serviceStatus === 'staff_departed')

    // Screen 1: Journey status
    const [journeyStatus, setJourneyStatus] = useState<'staff_departed' | 'staff_arrived'>()

    // Screen 2: Note mode
    const [showNoteForm, setShowNoteForm] = useState(false)
    const [note, setNote] = useState('')

    // Screen 2: Report data
    const [answer, setAnswer] = useState<'হ্যাঁ' | 'না'>()
    const [explanation, setExplanation] = useState('')
    const [travelCost, setTravelCost] = useState('')
    const [reason, setReason] = useState('')
    const [otherReason, setOtherReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleJourneyNext = async () => {
        if (journeyStatus && journeyStatus !== serviceStatus) {
            setIsSubmitting(true)
            const response = await reportService({
                serviceStatus: {
                    serviceId: serviceId,
                    status: journeyStatus,
                    statusType: 'system'
                }
            })
            setIsSubmitting(false)
            if (response.success) {
                setDisableDepartedButton(true)
                toast.success('Submitted')
                if (journeyStatus === 'staff_arrived') {
                    setCurrentScreen('report')
                }
            } else {
                toast.error(response.message)
            }
        }
    }

    const handleNoteSubmit = async () => {
        if (!note) {
            toast.error('অনুগ্রহ করে প্রয়োজনীয় তথ্য গুলো পূরণ করুন।')
            return
        }
        setIsSubmitting(true)
        const response = await reportService({
            serviceStatus: {
                serviceId: serviceId,
                statusType: 'custom',
                customLabel: serviceData.serviceType === 'install' ? 'ইলেক্ট্রিশিয়ান হোম ওয়ারিং টিম নোট' : 'টেকনিশিয়ান সার্ভিস টিম নোট',
                customNote: note
            }
        })
        setIsSubmitting(false)
        if (response.success) {
            toast.success('Note submitted')
            setNote('')
            setShowNoteForm(false)
        } else {
            toast.error(response.message)
        }
    }

    const handleNoteBack = () => {
        setNote('')
        setShowNoteForm(false)
    }

    const handleFinalSubmit = async () => {
        const data: StaffServiveReport = {
            resolved: answer === 'হ্যাঁ'
        }

        if (answer === 'হ্যাঁ') {
            if (!explanation || !travelCost) {
                toast.error('অনুগ্রহ করে প্রয়োজনীয় তথ্য গুলো পূরণ করুন।')
                return
            }
            data.explanation = explanation
            data.travelCost = Number(travelCost)
        } else if (answer === 'না') {
            if (!reason || (reason === 'others' && !otherReason)) {
                toast.error('অনুগ্রহ করে প্রয়োজনীয় তথ্য গুলো পূরণ করুন।')
                return
            }
            data.reason = reason === 'others' ? otherReason : reason
        }

        setIsSubmitting(true)
        await reportService({
            serviceStatus: {
                serviceId: serviceId,
                status: data.resolved ? 'completed' : serviceType === 'install' ? 'canceled' : 'service_center',
                statusType: 'system'
            },
            serviceReport: data,
            ...(data.resolved && {
                messageData: {
                    messageType: serviceType,
                    customerName: customerName,
                    customerPhone: customerPhone
                }
            })
        })
        setCurrentScreen('success')
    }

    // Screen 3: Success
    if (currentScreen === 'success') {
        return (
            <div className="absolute inset-0 flex flex-col gap-4 items-center text-center px-4 justify-start pt-32">
                <div className="text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="size-28">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>
                <p className="text-xl">সার্ভিসিং তথ্য প্রেরণ করা হয়েছে</p>
                <Link href="/staff/profile" className="__btn mt-4">
                    Back to Profile
                </Link>
            </div>
        )
    }

    // Screen 1: Journey Status
    if (currentScreen === 'journey') {
        return (
            <div className="mx-auto max-w-[600px] text-center p-4">
                <div className="h-full font-bold mb-4 flex flex-col gap-0.5 bg-[#e9f8ff] border-[#6EC1E4] border p-6 rounded-lg">
                    <div className="text-xl">গ্রাহক সেবা সার্ভিসিং তথ্য প্রদান করুন</div>
                    <div className="text-md">সার্ভিস : {serviceId}</div>
                    <div className="text-md">হেল্পলাইন : {contactDetails.customerCare}</div>
                    <div className="text-sm text-gray-500">হেড অফিস : {contactDetails.headOffice}</div>
                </div>

                <div className="flex flex-col gap-6 bg-[#e9f8ff] border-[#6EC1E4] border p-6 rounded-lg">
                    <p className="text-sm">
                        রওনা দেওয়ার সময় <i>"আমি রওনা দিয়েছি"</i> এবং পৌঁছানোর পর <i>"আমি পৌঁছেছি"</i> সিলেক্ট করুন
                    </p>

                    <div className="flex gap-4">
                        <button
                            disabled={disableDepartedButton}
                            onClick={() => setJourneyStatus('staff_departed')}
                            className={clsx(
                                '__btn flex-1 border border-[#6EC1E4] disabled:bg-gray-200 disabled:text-gray-400',
                                journeyStatus === 'staff_departed'
                                    ? 'bg-[#6EC1E4] text-white'
                                    : 'bg-transparent text-black hover:bg-[#6EC1E4] hover:text-white'
                            )}
                        >
                            আমি রওনা দিয়েছি
                        </button>
                        <button
                            onClick={() => setJourneyStatus('staff_arrived')}
                            className={clsx(
                                '__btn flex-1 border border-[#6EC1E4]',
                                journeyStatus === 'staff_arrived'
                                    ? 'bg-[#6EC1E4] text-white'
                                    : 'bg-transparent text-black hover:bg-[#6EC1E4] hover:text-white'
                            )}
                        >
                            আমি পৌঁছেছি
                        </button>
                    </div>

                    {journeyStatus && (
                        <button
                            disabled={isSubmitting}
                            onClick={handleJourneyNext}
                            className="__btn mx-auto w-64  text-white hover:bg-opacity-90"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    )}
                </div>
            </div>
        )
    }

    // Screen 2: Service Report
    return (
        <div className="mx-auto max-w-[600px] text-center p-4">
            <div className="h-full font-bold mb-4 flex flex-col gap-0.5 bg-[#e9f8ff] border-[#6EC1E4] border p-6 rounded-lg">
                <div className="text-xl">গ্রাহক সেবা সার্ভিসিং তথ্য প্রদান করুন</div>
                <div className="text-md">সার্ভিস : {serviceId}</div>
                <div className="text-md">হেল্পলাইন : {contactDetails.customerCare}</div>
                <div className="text-sm text-gray-500">হেড অফিস : {contactDetails.headOffice}</div>
            </div>

            <div className="flex flex-col gap-6 bg-[#e9f8ff] border-[#6EC1E4] border p-6 rounded-lg">
                {/* Add Note Form */}
                {showNoteForm ? (
                    <div className="flex flex-col gap-4">
                        <label htmlFor="note" className="text-left font-semibold">Note:</label>
                        <textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="নোট লিখুন"
                            className="__input h-36"
                            autoFocus
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={handleNoteBack}
                                className="__btn flex-1 border border-gray-400 bg-transparent text-black"
                            >
                                Back
                            </button>
                            <button disabled={isSubmitting}
                                onClick={handleNoteSubmit}
                                className="__btn flex-1"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Add Note Button */}
                        <button
                            onClick={() => setShowNoteForm(true)}
                            className="text-blue-500 hover:underline cursor-pointer self-end"
                        >
                            Add Note
                        </button>

                        {/* Main Question */}
                        <p className="border-[#6EC1E4] border p-1">
                            {serviceType === 'install'
                                ? 'কাস্টমার IPS প্যাকেজ টি হোম ইনস্টল করা হয়েছে?'
                                : 'কাস্টমারের পণ্যের সার্ভিসটি কি সম্পন্ন হয়েছে?'}
                        </p>

                        {/* Yes/No Buttons */}
                        <div className="flex gap-6">
                            <button
                                onClick={() => {
                                    setAnswer('হ্যাঁ')
                                    setReason('')
                                    setOtherReason('')
                                }}
                                className={clsx(
                                    '__btn flex-1 hover:bg-green-600 hover:text-white border border-green-600',
                                    answer === 'হ্যাঁ' ? 'bg-green-600 text-white' : 'bg-transparent text-black'
                                )}
                            >
                                হ্যাঁ
                            </button>
                            <button
                                onClick={() => {
                                    setAnswer('না')
                                    setExplanation('')
                                    setTravelCost('')
                                }}
                                className={clsx(
                                    '__btn flex-1 hover:bg-red-500 hover:text-white border border-red-500',
                                    answer === 'না' ? 'bg-red-500 text-white' : 'bg-transparent text-black'
                                )}
                            >
                                না
                            </button>
                        </div>

                        {/* Yes Form */}
                        {answer === 'হ্যাঁ' && (
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-4">
                                    <label htmlFor="explanation" className="text-center">
                                        {serviceType === 'install'
                                            ? 'তার ও অন্যান্য সামগ্রী কে দিয়েছে? এবং তার কতটুকু লেগেছে আর কি কি সামগ্রী ব্যবহার করেছেন তা নিম্নে লিখুন।'
                                            : 'প্রোডাক্ট এর কি সমস্যা ছিল এবং কি কি পার্টস ঠিক বা পরিবর্তন করতে হয়েছে?'}
                                        <span className="text-red-500 text-lg">*</span>
                                    </label>
                                    <textarea
                                        id="explanation"
                                        value={explanation}
                                        onChange={(e) => setExplanation(e.target.value)}
                                        placeholder={serviceType === 'install'
                                            ? 'কি কি সামগ্রী ব্যবহার করেছেন তা নিম্নে লিখুন'
                                            : 'কি কি পার্টস ঠিক বা পরিবর্তন করতে হয়েছে লিখুন'}
                                        className="__input h-36"
                                    />
                                </div>

                                <div className="flex flex-col gap-4">
                                    <label htmlFor="travelCost" className="text-center">
                                        যাতায়াত খরচ কত হয়েছে?
                                        <span className="text-red-500 text-lg">*</span>
                                    </label>
                                    <input
                                        id="travelCost"
                                        type="number"
                                        value={travelCost}
                                        onChange={(e) => setTravelCost(e.target.value)}
                                        placeholder="টাকার পরিমান"
                                        className="__input"
                                    />
                                </div>

                                <button disabled={isSubmitting} onClick={handleFinalSubmit} className="__btn">
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        )}

                        {/* No Form */}
                        {answer === 'না' && (
                            <div className="flex flex-col gap-4">
                                <div className="border-[#6EC1E4] border p-2">
                                    <span>
                                        {serviceType === 'install'
                                            ? 'কি কারণে ইনস্টল কাজ স্থগীত করা হয়েছে?'
                                            : 'পণ্যটি ঠিক না হওয়ার কারণ কি?'}
                                        <span className="text-red-500 text-lg">*</span>
                                    </span>
                                </div>

                                {(serviceType === 'install' ? installCancelationReasons : serviceCancelationReasons).map((r, index) => (
                                    <div key={r + index} className="flex text-sm gap-6 h-8 w-full">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="reason"
                                                id={r + index}
                                                checked={reason === r}
                                                onChange={() => {
                                                    setReason(r)
                                                    setOtherReason('')
                                                }}
                                                className="size-5"
                                            />
                                            <label htmlFor={r + index}>{r}</label>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex gap-6 text-sm h-8 w-full">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="reason"
                                            id="others"
                                            checked={reason === 'others'}
                                            onChange={() => setReason('others')}
                                            className="size-5"
                                        />
                                        <label htmlFor="others">অন্য কোনো কারণে</label>
                                    </div>
                                </div>

                                {reason === 'others' && (
                                    <textarea
                                        value={otherReason}
                                        onChange={(e) => setOtherReason(e.target.value)}
                                        placeholder="বিস্তারিত কারণ লিখুন"
                                        className="__input h-36"
                                        autoFocus
                                    />
                                )}

                                <button
                                    disabled={isSubmitting}
                                    onClick={handleFinalSubmit}
                                    className="__btn"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}