import { ProfileLinkButton } from "@/components/features/staff";
import { Modal } from "@/components/ui";
import { PaymentDataType } from "@/types";
import { formatDate } from "@/utils";

export default function PaymentViewModal({
  paymentData,
  onClose,
}: {
  paymentData: PaymentDataType;
  onClose: () => void;
}) {
  return (
    <Modal isVisible title="Payment info" onClose={onClose}>
      <div className="flex flex-col gap-6 mt-6">
        <div>
          <div className="font-semibold mb-2 p-1 bg-blue-100">
            Personal Info
          </div>
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x">
              <div className="flex border-b p-1">
                <span className="w-36 flex-shrink-0">Payment ID</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">{paymentData.paymentId}</span>
              </div>
              <div className="flex border-b p-1">
                <span className="w-36 flex-shrink-0">Payment Method</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">
                  {paymentData.paymentMethod.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x">
              <div className="flex border-b p-1">
                <span className="w-36 flex-shrink-0">Amount</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">{paymentData.amount} TK</span>
              </div>
              <div className="flex border-b p-1">
                <span className="w-36 flex-shrink-0">Payment Date</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">
                  {formatDate(paymentData.date)}
                </span>
              </div>
            </div>
            {paymentData.paymentMethod !== "bank" && (
              <div className="flex border-b p-1">
                <span className="w-36 flex-shrink-0">Transaction ID</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">
                  {paymentData.transactionId}
                </span>
              </div>
            )}
            <div className="flex border-b p-1">
              <span className="w-36 flex-shrink-0">Task Description</span>
              <span className="mr-4 flex-shrink-0">:</span>
              <span className="text-sm">{paymentData.description}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <div className="font-semibold mb-2 p-1 bg-blue-100">
              Receiver Transaction Info
            </div>
            <div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Receiver</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold">
                  <ProfileLinkButton
                    text={paymentData.staff!.name}
                    staffId={paymentData.staff!.staffId}
                  />
                </span>
              </div>
              {paymentData.paymentMethod === "bank" ? (
                <>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Bank Name</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {paymentData.receiverBankInfo?.bankName}
                    </span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Branch Name</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {paymentData.receiverBankInfo?.branchName}
                    </span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Account Name</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {paymentData.receiverBankInfo?.accountHolderName}
                    </span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Account Number</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {paymentData.receiverBankInfo?.accountNumber}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex border-b py-1">
                  <span className="w-32 flex-shrink-0">Wallet Number</span>
                  <span className="mr-4 flex-shrink-0">:</span>
                  <span className="font-semibold">
                    {paymentData.receiverWalletNumber}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2 p-1 bg-blue-100">
              Sender Transaction Info
            </div>
            <div>
              <div className="flex border-b py-1">
                <span className="w-32 flex-shrink-0">Sender</span>
                <span className="mr-4 flex-shrink-0">:</span>
                <span className="font-semibold text-gray-400">Admin</span>
              </div>
              {paymentData.paymentMethod === "bank" ? (
                <>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Bank Name</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {paymentData.senderBankInfo?.bankName}
                    </span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Branch Name</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {paymentData.senderBankInfo?.branchName}
                    </span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Account Name</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {paymentData.senderBankInfo?.accountHolderName}
                    </span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Account Number</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {paymentData.senderBankInfo?.accountNumber}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex border-b py-1">
                  <span className="w-32 flex-shrink-0">Wallet Number</span>
                  <span className="mr-4 flex-shrink-0">:</span>
                  <span className="font-semibold">
                    {paymentData.senderWalletNumber}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
