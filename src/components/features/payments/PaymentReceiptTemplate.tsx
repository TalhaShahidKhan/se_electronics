import { BankInfo, PaymentDataType } from "@/types";
import { formatDate } from "@/utils";

interface PaymentReceiptTemplateProps {
    bgImage: string;
    invoiceNumber: string;
    date: Date;
    description: string | null;
    staffId: string;
    transactionId: string | null;
    paymentId: string;
    paymentMethod: "cash" | "bkash" | "nagad" | "rocket" | "bank";
    senderWalletNumber: string | null;
    senderBankInfo: BankInfo | null;
    receiverWalletNumber: string | null;
    receiverBankInfo: BankInfo | null;
    amount: number;
    staff: {
        name: string;
    };
}

export default function PaymentReceiptTemplate({ data }: { data: PaymentReceiptTemplateProps }) {
    return (
        <div
            className="relative w-[210mm] h-[297mm] mx-auto bg-white"
            style={{
                backgroundImage: `url(${data.bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                fontFamily: `Inter, Tiro Bangla`
            }}
        >
            <div className="absolute top-[200px] left-[40px] right-[40px] px-20">
                {/* Date */}
                <div className="text-right text-sm font-semibold">
                    Date: {formatDate(data.date)}
                </div>

                {/* Sender Information */}
                <div className="font-bold mb-3 mt-6">Sender Information</div>
                <table className="w-full border-collapse mb-6">
                    <tbody>
                        <tr>
                            <td className="border border-black px-3 py-2 font-semibold w-2/5 align-top">Company Name :</td>
                            <td className="border border-black px-3 py-2 w-3/5 break-all whitespace-normal">SE ELECTRONICS</td>
                        </tr>
                        <tr>
                            <td className="border border-black px-3 py-2 font-semibold align-top">Payment Method :</td>
                            <td className="border border-black px-3 py-2 break-all whitespace-normal">{data.paymentMethod.toUpperCase()}</td>
                        </tr>
                        {data.paymentMethod === 'bank' && data.senderBankInfo && (
                            <>
                                <tr>
                                    <td className="border border-black px-3 py-2 font-semibold align-top">Bank Name :</td>
                                    <td className="border border-black px-3 py-2 break-all whitespace-normal">{data.senderBankInfo.bankName}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black px-3 py-2 font-semibold align-top">Account Holder :</td>
                                    <td className="border border-black px-3 py-2 break-all whitespace-normal">{data.senderBankInfo.accountHolderName}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black px-3 py-2 font-semibold align-top">Account Number :</td>
                                    <td className="border border-black px-3 py-2 break-all whitespace-normal">{data.senderBankInfo.accountNumber}</td>
                                </tr>
                            </>
                        )}
                        {data.paymentMethod !== 'bank' && data.senderWalletNumber && data.transactionId && (
                            <>
                                <tr>
                                    <td className="border border-black px-3 py-2 font-semibold align-top">Sender Number :</td>
                                    <td className="border border-black px-3 py-2 break-all whitespace-normal">{data.senderWalletNumber}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black px-3 py-2 font-semibold align-top">Transaction ID :</td>
                                    <td className="border border-black px-3 py-2 break-all whitespace-normal">{data.transactionId}</td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>

                {/* Receipt Information */}
                <div className="font-bold mb-3 mt-6">Receipt Information</div>
                <table className="w-full border-collapse">
                    <tbody>
                        <tr>
                            <td className="border border-black px-3 py-2 font-semibold w-2/5 align-top">Employee Name :</td>
                            <td className="border border-black px-3 py-2 w-3/5 break-all whitespace-normal">{data.staff?.name}</td>
                        </tr>
                        <tr>
                            <td className="border border-black px-3 py-2 font-semibold align-top">Employee ID :</td>
                            <td className="border border-black px-3 py-2 break-all whitespace-normal">{data.staffId}</td>
                        </tr>
                        {data.paymentMethod === 'bank' && data.receiverBankInfo && (
                            <>
                                <tr>
                                    <td className="border border-black px-3 py-2 font-semibold align-top">Bank Name :</td>
                                    <td className="border border-black px-3 py-2 break-all whitespace-normal">{data.receiverBankInfo.bankName}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black px-3 py-2 font-semibold align-top">Account Holder :</td>
                                    <td className="border border-black px-3 py-2 break-all whitespace-normal">{data.receiverBankInfo.accountHolderName}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black px-3 py-2 font-semibold align-top">Account Number :</td>
                                    <td className="border border-black px-3 py-2 break-all whitespace-normal">{data.receiverBankInfo.accountNumber}</td>
                                </tr>
                            </>
                        )}
                        {data.paymentMethod !== 'bank' && data.receiverWalletNumber && data.transactionId && (
                            <>
                                <tr>
                                    <td className="border border-black px-3 py-2 font-semibold align-top">Receiver Number :</td>
                                    <td className="border border-black px-3 py-2 break-all whitespace-normal">{data.receiverWalletNumber}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black px-3 py-2 font-semibold align-top">Transaction ID :</td>
                                    <td className="border border-black px-3 py-2 break-all whitespace-normal">{data.transactionId}</td>
                                </tr>
                            </>
                        )}
                        {data.description && (
                            <>
                                <tr>
                                    <td className="border border-black px-3 py-2 font-semibold align-top">Description :</td>
                                    <td className="border border-black px-3 py-2 break-all whitespace-normal">{data.description}</td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}