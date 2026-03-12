import { formatDate } from "@/utils";

type ComplaintTemplateProps = {
  data: {
    complaintId: string;
    customer: { name: string; customerId: string; phone: string; address: string };
    staff: { name: string; phone: string; role: string };
    serviceId?: string | null;
    subject: string;
    description: string;
    status: string;
    adminNote?: string | null;
    createdAt: Date;
    bgImage: string;
  };
};

export default function ComplaintTemplate({ data }: ComplaintTemplateProps) {
  return (
    <div
      className="relative w-[210mm] h-[297mm] mx-auto bg-white bg-center bg-no-repeat bg-cover"
      style={{
        backgroundImage: `url(${data.bgImage})`,
        fontFamily: `Inter, Tiro Bangla`,
      }}
    >
      <div className="absolute top-[200px] left-[40px] right-[40px]">
        <div className="text-right text-xl font-bold tracking-wide mb-8">STAFF COMPLAINT REPORT</div>
        
        <div className="flex justify-between mb-8 text-sm">
          <div className="space-y-1.5">
            <div><span className="font-bold text-gray-600 uppercase text-[10px] tracking-wider block">Customer Information</span></div>
            <div className="text-lg font-bold text-gray-900">{data.customer.name}</div>
            <div className="text-gray-600">ID: {data.customer.customerId}</div>
            <div className="text-gray-600">Phone: {data.customer.phone}</div>
            <div className="text-gray-600 max-w-[300px]">{data.customer.address}</div>
          </div>
          <div className="text-right space-y-1.5">
            <div><span className="font-bold text-gray-600 uppercase text-[10px] tracking-wider block">Complaint Details</span></div>
            <div><span className="font-semibold">Report #</span> {data.complaintId}</div>
            <div><span className="font-semibold">Date :</span> {formatDate(data.createdAt)}</div>
            <div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${data.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {data.status}
              </span>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
            <h3 className="font-bold text-gray-700 tracking-tight uppercase text-xs">Reported Staff Member</h3>
          </div>
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <div className="text-base font-bold text-red-600 italic">@{data.staff.name}</div>
              <div className="text-xs text-gray-500 uppercase tracking-tighter">{data.staff.role}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{data.staff.phone}</div>
              {data.serviceId && (
                <div className="text-xs text-gray-500 font-mono mt-1">
                  Linked Service: {data.serviceId}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-l-4 border-rose-500 pl-6 py-2">
            <h3 className="text-sm font-bold text-rose-600 uppercase tracking-widest mb-2">Subject</h3>
            <p className="text-lg font-bold text-gray-900">{data.subject}</p>
          </div>

          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 italic">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 not-italic">Customer Complaint Description</h3>
            <p className="text-gray-700 leading-relaxed text-sm">
              "{data.description}"
            </p>
          </div>

          {data.adminNote && (
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Admin Resolution Note</h3>
              <p className="text-blue-800 leading-relaxed text-sm font-medium">
                {data.adminNote}
              </p>
            </div>
          )}
        </div>

        <div className="mt-20 pt-10 border-t border-gray-100 flex justify-between items-end">
          <div className="text-[10px] text-gray-400 font-medium">
            This is a system generated complaint document.<br />
            SE ELECTRONICS © {new Date().getFullYear()}
          </div>
          <div className="text-center w-40">
            <div className="h-px bg-gray-300 mb-2"></div>
            <div className="text-[10px] font-bold text-gray-500 uppercase">Authorized Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
}
