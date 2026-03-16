'use client'

import { useState } from "react"
import clsx from "clsx"
import { contactDetails, installCancelationReasons, serviceCancelationReasons } from "@/constants"
import { reportService } from "@/actions"
import { StaffServiveReport, Statuses } from "@/types"
import { toast } from "react-toastify"
import Link from "next/link"
import { 
    Navigation, 
    UserCheck, 
    MessageSquare, 
    Send, 
    AlertCircle, 
    CheckCircle2, 
    ArrowRight,
    HelpCircle,
    Info,
    ChevronLeft
} from "lucide-react"

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

    if (currentScreen === 'success') {
        return (
            <div 
                className="flex flex-col items-center text-center py-12 px-4 animate-in fade-in zoom-in-95 duration-500"
            >
                <div className="size-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={48} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">সার্ভিস রিপোর্ট সফল হয়েছে</h3>
                <p className="text-gray-500 font-medium mb-8 max-w-xs">
                    আপনার প্রদানকৃত তথ্য সফলভাবে সিস্টেমে গ্রহণ করা হয়েছে।
                </p>
                <Link href="/staff/profile" className="w-full max-w-xs bg-brand text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
                    Back to Dashboard
                    <ArrowRight size={18} />
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Service Identity Card */}
            <div className="bg-brand rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Navigation size={120} />
                </div>
                <div className="relative z-10 flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Active Order</span>
                        <span className="text-white/40 font-mono text-xs">#{serviceId}</span>
                    </div>
                    <h2 className="text-xl font-bold">{customerName}</h2>
                    <p className="text-white/70 text-sm font-medium">{customerPhone}</p>
                    <div className="flex gap-4 mt-4 pt-4 border-t border-white/10 text-[10px] font-bold uppercase tracking-wider text-white/50">
                        <div className="flex items-center gap-1.5">
                            <HelpCircle size={12} />
                            Support: {contactDetails.customerCare}
                        </div>
                    </div>
                </div>
            </div>

            <div>
                {/* Screen 1: Journey Status */}
                {currentScreen === 'journey' && (
                    <div
                        className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
                    >
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                            <div className="flex gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 mb-2">
                                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] font-medium text-blue-700/80 leading-relaxed">
                                    রওনা দেওয়ার সময় "আমি রওনা দিয়েছি" এবং পৌঁছানোর পর "আমি পৌঁছেছি" সিলেক্ট করুন।
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    disabled={disableDepartedButton}
                                    onClick={() => setJourneyStatus('staff_departed')}
                                    className={clsx(
                                        'py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 transition-all active:scale-95 border-2',
                                        journeyStatus === 'staff_departed'
                                            ? 'bg-brand text-white border-brand shadow-lg'
                                            : 'bg-white text-gray-700 border-gray-100 hover:border-brand/30',
                                        disableDepartedButton && 'opacity-50 grayscale cursor-not-allowed'
                                    )}
                                >
                                    <div className={clsx(
                                        "size-10 rounded-full flex items-center justify-center",
                                        journeyStatus === 'staff_departed' ? 'bg-white/20' : 'bg-gray-50 text-gray-400'
                                    )}>
                                        <Navigation size={20} />
                                    </div>
                                    <span className="text-xs uppercase tracking-tight">আমি রওনা দিয়েছি</span>
                                </button>
                                <button
                                    onClick={() => setJourneyStatus('staff_arrived')}
                                    className={clsx(
                                        'py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 transition-all active:scale-95 border-2',
                                        journeyStatus === 'staff_arrived'
                                            ? 'bg-brand text-white border-brand shadow-lg'
                                            : 'bg-white text-gray-700 border-gray-100 hover:border-brand/30'
                                    )}
                                >
                                    <div className={clsx(
                                        "size-10 rounded-full flex items-center justify-center",
                                        journeyStatus === 'staff_arrived' ? 'bg-white/20' : 'bg-gray-50 text-gray-400'
                                    )}>
                                        <UserCheck size={20} />
                                    </div>
                                    <span className="text-xs uppercase tracking-tight">আমি পৌঁছেছি</span>
                                </button>
                            </div>

                            <button
                                disabled={isSubmitting || !journeyStatus}
                                onClick={handleJourneyNext}
                                className="w-full bg-brand text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-95 mt-4"
                            >
                                {isSubmitting ? 'প্রসেসিং হচ্ছে...' : (
                                    <>
                                        {journeyStatus === 'staff_arrived' ? 'রিপোর্ট পেইজে যান' : 'তথ্য আপডেট করুন'}
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Screen 2: Service Report */}
                {currentScreen === 'report' && (
                    <div
                        className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300"
                    >
                        {showNoteForm ? (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                     <button onClick={handleNoteBack} className="p-2 bg-gray-50 rounded-lg text-gray-400">
                                         <ChevronLeft size={20} />
                                     </button>
                                     <h3 className="font-bold text-gray-800">অ্যাডমিন নোট প্রদান করুন</h3>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="note" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">আপনার নোট</label>
                                    <textarea
                                        id="note"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="মতামত বা তথ্য এখানে লিখুন..."
                                        className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-brand h-40 outline-none transition-all"
                                        autoFocus
                                    />
                                </div>
                                <button 
                                    disabled={isSubmitting}
                                    onClick={handleNoteSubmit}
                                    className="w-full bg-brand text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                                >
                                    <Send size={18} />
                                    {isSubmitting ? 'সেভ হচ্ছে...' : 'সাবমিট করুন'}
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                                <div className="flex justify-between items-center px-1">
                                    <h3 className="text-sm font-bold text-gray-800">রিপোর্ট বিস্তারিত</h3>
                                    <button
                                        onClick={() => setShowNoteForm(true)}
                                        className="flex items-center gap-1.5 text-[10px] font-bold text-brand bg-brand/5 px-2 py-1 rounded-lg uppercase"
                                    >
                                        <MessageSquare size={12} />
                                        Team Note
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                        <p className="text-sm font-bold text-gray-700 leading-snug text-center">
                                            {serviceType === 'install'
                                                ? 'কাস্টমার IPS প্যাকেজ টি হোম ইনস্টল করা হয়েছে?'
                                                : 'কাস্টমারের পণ্যের সার্ভিসটি কি সম্পন্ন হয়েছে?'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => {
                                                setAnswer('হ্যাঁ')
                                                setReason('')
                                                setOtherReason('')
                                            }}
                                            className={clsx(
                                                'py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 transition-all active:scale-95 border-2',
                                                answer === 'হ্যাঁ' 
                                                    ? 'bg-green-600 text-white border-green-600 shadow-lg' 
                                                    : 'bg-white text-gray-700 border-gray-100 hover:border-green-600/30'
                                            )}
                                        >
                                            <div className={clsx(
                                                "size-10 rounded-full flex items-center justify-center",
                                                answer === 'হ্যাঁ' ? 'bg-white/20' : 'bg-green-50 text-green-600'
                                            )}>
                                                <CheckCircle2 size={20} />
                                            </div>
                                            <span className="text-xs uppercase">হ্যাঁ, সম্পন্ন হয়েছে</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setAnswer('না')
                                                setExplanation('')
                                                setTravelCost('')
                                            }}
                                            className={clsx(
                                                'py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 transition-all active:scale-95 border-2',
                                                answer === 'না' 
                                                    ? 'bg-red-500 text-white border-red-500 shadow-lg' 
                                                    : 'bg-white text-gray-700 border-gray-100 hover:border-red-500/30'
                                            )}
                                        >
                                            <div className={clsx(
                                                "size-10 rounded-full flex items-center justify-center",
                                                answer === 'না' ? 'bg-white/20' : 'bg-red-50 text-red-500'
                                            )}>
                                                <AlertCircle size={20} />
                                            </div>
                                            <span className="text-xs uppercase tracking-tight">না, বাকি আছে</span>
                                        </button>
                                    </div>

                                    {answer === 'হ্যাঁ' && (
                                        <div 
                                            className="space-y-4 pt-4 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
                                        >
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                                                    {serviceType === 'install'
                                                        ? 'ব্যবহৃত সামগ্রীর বিস্তারিত লিখুন'
                                                        : 'সমস্যা ও সমাধানের বিবরণ'}
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <textarea
                                                    value={explanation}
                                                    onChange={(e) => setExplanation(e.target.value)}
                                                    placeholder={serviceType === 'install'
                                                        ? 'কি কি সামগ্রী লেগেছে...'
                                                        : 'কি কি পার্টস পরিবর্তন করেছেন...'}
                                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-brand h-32 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                                                    যাতায়াত খরচ (টাকা)
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    value={travelCost}
                                                    onChange={(e) => setTravelCost(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-brand outline-none transition-all"
                                                />
                                            </div>
                                            <button 
                                                disabled={isSubmitting} 
                                                onClick={handleFinalSubmit} 
                                                className="w-full bg-brand text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all mt-2"
                                            >
                                                <Send size={18} />
                                                {isSubmitting ? 'সেভ হচ্ছে...' : 'রিপোর্ট সাবমিট করুন'}
                                            </button>
                                        </div>
                                    )}

                                    {answer === 'না' && (
                                        <div 
                                            className="space-y-4 pt-4 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
                                        >
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                                                অসম্পূর্ণ থাকার কারণ
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div className="grid gap-2">
                                                {(serviceType === 'install' ? installCancelationReasons : serviceCancelationReasons).map((r, index) => (
                                                    <button 
                                                        key={r + index}
                                                        onClick={() => {
                                                            setReason(r)
                                                            setOtherReason('')
                                                        }}
                                                        className={clsx(
                                                            "p-3 rounded-xl border text-xs font-bold text-left transition-all",
                                                            reason === r ? 'bg-brand/5 border-brand text-brand' : 'bg-gray-50 border-gray-100 text-gray-500'
                                                        )}
                                                    >
                                                        {r}
                                                    </button>
                                                ))}
                                                <button 
                                                    onClick={() => setReason('others')}
                                                    className={clsx(
                                                        "p-3 rounded-xl border text-xs font-bold text-left transition-all",
                                                        reason === 'others' ? 'bg-brand/5 border-brand text-brand' : 'bg-gray-50 border-gray-100 text-gray-500'
                                                    )}
                                                >
                                                    অন্যান্য কারণ
                                                </button>
                                            </div>

                                            {reason === 'others' && (
                                                <textarea
                                                    value={otherReason}
                                                    onChange={(e) => setOtherReason(e.target.value)}
                                                    placeholder="বিস্তারিত কারণ এখানে লিখুন..."
                                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-brand h-24 outline-none transition-all"
                                                    autoFocus
                                                />
                                            )}

                                            <button 
                                                disabled={isSubmitting} 
                                                onClick={handleFinalSubmit} 
                                                className="w-full bg-brand text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all mt-2"
                                            >
                                                <Send size={18} />
                                                {isSubmitting ? 'সেভ হচ্ছে...' : 'আপডেট সাবমিট করুন'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}