'use client'

type PaymentType = 'bkash' | 'nagad' | 'rocket' | 'bank';

interface PaymentModalProps {
    isOpen: boolean;
    isSubmitting: boolean;
    onClose: () => void;
    paymentType: PaymentType;
    amount: number;
    paymentDetails: any;
}

const brandColors = {
    bkash: {
        primary: '#E2136E',
        secondary: '#FFF0F6',
        accent: '#C4105D'
    },
    nagad: {
        primary: '#EE4023',
        secondary: '#FFF5F3',
        accent: '#D63616'
    },
    rocket: {
        primary: '#8B3F96',
        secondary: '#F8F0F9',
        accent: '#762F81'
    },
    bank: {
        primary: '#1E40AF',
        secondary: '#EFF6FF',
        accent: '#1E3A8A'
    }
};

const brandNames = {
    bkash: 'bKash',
    nagad: 'Nagad',
    rocket: 'Rocket',
    bank: 'Bank Transfer'
};

export default function PaymentModal({ isOpen, isSubmitting, onClose, paymentType, amount, paymentDetails }: PaymentModalProps) {
    const colors = brandColors[paymentType];
    const brandName = brandNames[paymentType];

    if (!isOpen) return null;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 p-6 rounded-t-lg z-50" style={{ backgroundColor: colors.primary }}>
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white hover:opacity-80"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-2">{brandName}</div>
                        <div className="text-white text-sm opacity-90">
                            {paymentType === 'bank' ? 'Secure Bank Transfer' : 'Your trusted mobile financial service'}
                        </div>
                    </div>
                </div>

                {/* Amount Display */}
                <div className="p-6 text-center border-b relative">
                    <div className="absolute left-3 top-7 size-12 __center">
                        <img src={`/${paymentType}.png`} alt="" />
                    </div>
                    <div className="text-3xl font-bold" style={{ color: colors.primary }}>
                        ৳ {amount.toLocaleString()}
                    </div>
                    <div className="text-gray-600 mt-1">Payment to SE ELECTRONICS</div>
                </div>

                {/* Instructions */}
                <div className="p-6 border-b" style={{ backgroundColor: colors.secondary }}>
                    <div className="flex items-start gap-2 mb-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: colors.primary }}>
                            i
                        </div>
                        <span className="font-semibold">Payment Instructions</span>
                    </div>

                    {paymentType !== 'bank' ? (
                        <ol className="list-decimal list-inside text-start space-y-2 text-sm text-gray-700">
                            <li>{brandName} অ্যাপ খুলুন অথবা ডায়াল করুন *{paymentType === 'bkash' ? '247' : paymentType === 'nagad' ? '167' : '322'}#</li>
                            <li>{paymentType === 'bkash' ? "Payment" : "Send Money"} অপশনটি সিলেক্ট করুন</li>
                            <li className="flex items-center flex-wrap gap-2">
                                টাকা পাঠানোর জন্য নম্বরটি নির্ভুলভাবে ইনপুট করুন:
                                <span className="font-bold" style={{ color: colors.primary }}>
                                    {paymentDetails.number}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(paymentDetails.number)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs hover:opacity-80"
                                    style={{ backgroundColor: colors.secondary, color: colors.primary }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="9" y="9" width="13" height="13" rx="2" />
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                    Copy
                                </button>
                            </li>
                            <li>Amount লিখুন: <b>৳{amount.toLocaleString()}</b></li>
                            <li>আপনার PIN দিয়ে লেনদেনটি সম্পন্ন করুন</li>
                            <li>লেনদেনের তথ্য নিচে লিখে নিশ্চিত করুন</li>
                        </ol>
                    ) : (
                        <div className="space-y-3 text-sm">
                            <div className="bg-white p-3 rounded border">
                                <div className="grid grid-cols-2 gap-2 text-start">
                                    <div className="text-gray-600">Bank Name:</div>
                                    <div className="font-semibold">{paymentDetails.bankName}</div>

                                    <div className="text-gray-600">Account Number:</div>
                                    <div className="font-semibold flex items-center gap-2">
                                        {paymentDetails.accountNumber}
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(paymentDetails.accountNumber)}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs hover:opacity-80"
                                            style={{ backgroundColor: colors.secondary, color: colors.primary }}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="9" y="9" width="13" height="13" rx="2" />
                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="text-gray-600">Account Name:</div>
                                    <div className="font-semibold">{paymentDetails.accountHolder}</div>

                                    <div className="text-gray-600">Branch:</div>
                                    <div className="font-semibold">{paymentDetails.branch}</div>

                                    <div className="text-gray-600">Routing Number:</div>
                                    <div className="font-semibold">{paymentDetails.routingNumber}</div>

                                    <div className="text-gray-600">SWIFT Code:</div>
                                    <div className="font-semibold">{paymentDetails.swiftCode}</div>
                                </div>
                            </div>
                            <p className="text-gray-700">After transferring <b>৳{amount.toLocaleString()}</b>, enter your bank details below</p>
                        </div>
                    )}
                </div>

                {/* Input Fields */}
                <div className="p-6">
                    {paymentType !== 'bank' ? (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your {brandName} Number
                                </label>
                                <input
                                    type="tel"
                                    name="walletNumber"
                                    placeholder="01XXXXXXXXX"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transaction ID (TrxID)
                                </label>
                                <input
                                    type="text"
                                    name="transactionId"
                                    placeholder="8N67MA4KO2"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Bank Name
                                </label>
                                <input
                                    type="text"
                                    name="bankName"
                                    placeholder="e.g., DBBL, City Bank"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Account Holder Name
                                </label>
                                <input
                                    type="text"
                                    name="accountHolderName"
                                    placeholder="Your name"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Account Number
                                </label>
                                <input
                                    type="text"
                                    name="accountNumber"
                                    placeholder="1234567890"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Branch Name
                                </label>
                                <input
                                    type="text"
                                    name="branchName"
                                    placeholder="e.g., Sylhet Branch"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                />
                            </div>
                        </>
                    )}

                    <button
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        style={{ backgroundColor: colors.primary }}
                    >
                        {isSubmitting ? 'Submitting...' : 'Confirm Payment & Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
}