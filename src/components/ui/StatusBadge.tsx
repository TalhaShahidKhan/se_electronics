import clsx from "clsx";

const STATUSES = {
    pending: {
        name: 'Pending',
        styles: 'text-yellow-500 bg-yellow-500 bg-opacity-10 px-2 py-0.5 rounded-md border border-yellow-500'
    },
    staff_departed: {
        name: 'Staff Departed',
        styles: 'text-yellow-500 bg-yellow-500 bg-opacity-10 px-2 py-0.5 rounded-md border border-yellow-500'
    },
    staff_arrived: {
        name: 'Staff Arrived',
        styles: 'text-yellow-500 bg-yellow-500 bg-opacity-10 px-2 py-0.5 rounded-md border border-yellow-500'
    },
    processing: {
        name: 'Processing',
        styles: 'text-blue-500 bg-blue-500 bg-opacity-10 px-2 py-0.5 rounded-md border border-blue-500'
    },
    in_progress: {
        name: 'In Progress',
        styles: 'text-blue-500 bg-blue-500 bg-opacity-10 px-2 py-0.5 rounded-md border border-blue-500'
    },
    service_center: {
        name: 'Service Center',
        styles: 'text-blue-500 bg-blue-500 bg-opacity-10 px-2 py-0.5 rounded-md border border-blue-500'
    },
    service_center_received: {
        name: 'Service Center',
        styles: 'text-blue-500 bg-blue-500 bg-opacity-10 px-2 py-0.5 rounded-md border border-blue-500'
    },
    appointment_retry: {
        name: 'Appoint Retry',
        styles: 'text-yellow-500 bg-yellow-500 bg-opacity-10 px-2 py-0.5 rounded-md border border-yellow-500'
    },
    approved: {
        name: 'Approved',
        styles: 'text-green-500 bg-green-500 bg-opacity-10 px-2 py-0.5 rounded-md border border-green-500'
    },
    completed: {
        name: 'Completed',
        styles: 'text-green-500 bg-green-500 bg-opacity-10 px-2 py-0.5 rounded-md border border-green-500'
    },
    canceled: {
        name: 'Canceled',
        styles: 'text-red-500 bg-red-500 bg-opacity-10 px-2 py-0.5 rounded-md border border-red-500'
    },
    rejected: {
        name: 'Rejected',
        styles: 'text-red-500 bg-red-500 bg-opacity-10 px-2 py-0.5 rounded-md border border-red-500'
    },
    valid: {
        name: 'Valid',
        styles: 'text-green-500 bg-green-500 bg-opacity-10 px-2 py-0.5 rounded-md border border-green-500'
    },
    expired: {
        name: 'Expired',
        styles: 'text-red-500 bg-red-500 bg-opacity-10 px-2 py-0.5 rounded-md border border-red-500'
    },
    custom: {
        name: 'Custom',
        styles: 'text-gray-500 bg-gray-500 bg-opacity-10 px-2 py-0.5 rounded-md border border-gray-500'
    }
}

export default function StatusBadge({ status }: { status: keyof typeof STATUSES }) {
    return <span className={clsx("text-xs sm:text-sm font-black uppercase tracking-wider px-2 py-0.5 rounded-md", STATUSES[status].styles)}>
        {STATUSES[status].name}
    </span>
}