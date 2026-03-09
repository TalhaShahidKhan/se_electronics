import { getStaffs, getStaffsMetadata } from "@/actions";
import { StaffActionButtons, StaffToolbarActionButtons, Toolbar } from "@/components";
import { SearchParams } from "@/types";
import Image from "next/image";

export default async function Technicians({ params, searchParams }: {
    params: Promise<{ role: 'technicians' | 'electricians' }>
    searchParams?: Promise<SearchParams>
}) {
    const prms = await params
    const sp = await searchParams
    const role = prms.role === 'technicians' ? 'technician' : 'electrician'
    const title = prms.role === 'technicians' ? 'Technicians' : 'Electricians'

    const pagination = await getStaffsMetadata({ ...sp, role: role })
    const response = await getStaffs({ ...sp, role: role })

    if (!response.success) {
        return <div className="text-center py-4 text-red-600">
            <p>{response.message}</p>
        </div>
    }

    const staffs = response.data

    return <div className="flex-1 overflow-hidden flex flex-col gap-4">
        <Toolbar title={title} actions={<StaffToolbarActionButtons />} pagination={pagination} />
        {staffs?.length > 0 ?
            <div className="overflow-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
                {staffs.map(staff =>
                    <div key={staff.id} className="bg-white border p-6 rounded-lg text-center">
                        <div className="size-44 rounded-full overflow-hidden __center mx-auto">
                            <Image src={staff.photoUrl} alt="" width={176} height={176} />
                        </div>
                        <div className="flex flex-col mt-5">
                            <div className="flex gap-1 self-center items-center">
                                <span className="text-xl font-semibold">{staff.name} </span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </div>
                            <span className="text-gray-600">{staff.phone}</span>
                            <span className="text-gray-600">{staff.currentDistrict}</span>
                        </div>
                        <StaffActionButtons staffData={staff} />
                    </div>
                )}
            </div>
            :
            <div className="text-center py-4 text-gray-600">
                <p>No data</p>
            </div>
        }
    </div>
}