'use client'

import { Check, TriangleAlert } from "lucide-react"
import { notFound, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import generatePDF from "./actions/generatePDF"
import { DocType } from "@/types"

export default function DocDownloadPage() {
    const searchParams = useSearchParams()
    const [finishedDownload, setFinishedDownload] = useState(false)
    const [error, setError] = useState<string>()

    const token = searchParams.get('token')
    const docType = searchParams.get('type') as DocType
    const id = searchParams.get('id')

    if (!((docType && id) || token)) {
        notFound()
    }

    async function download() {
        const response = await generatePDF({
            docType: docType ?? 'invoice',
            id: id ?? '',
            token: token ?? ''
        })

        if (!response.success) {
            setError(response.message)
            return
        }

        const blob = new Blob([response.pdfBuffer!], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url

        switch (response.docType) {
            case 'id-card':
                a.download = 'ID_CARD.pdf'
                break
            case 'payment':
                a.download = 'SE_ELECTRONICS_PAYMENT_RECEIPT.pdf'
                break
            case 'invoice':
                a.download = 'SE_ELECTRONICS_INVOICE.pdf'
                break
            case 'certificate':
                a.download = 'SE_ELECTRONICS_CERTIFICATE.pdf'
                break
            case 'complaint':
                a.download = 'SE_ELECTRONICS_COMPLAINT.pdf'
                break
            case 'hearing-notice':
                a.download = 'SE_ELECTRONICS_HEARING_NOTICE.pdf'
                break
            case 'completion-notice':
                a.download = 'SE_ELECTRONICS_RESOLUTION_LETTER.pdf'
                break
        }

        a.click()

        URL.revokeObjectURL(url)
        setFinishedDownload(true)
    }

    useEffect(() => {
        download()
    }, [])
    return <div className="min-h-screen flex items-center justify-center p-4">
        {!error ?
            finishedDownload ?
                <div className="flex flex-col items-center gap-6">
                    <div className="size-36 text-green-500 bg-green-200 rounded-full flex items-center justify-center">
                        <Check size={50} />
                    </div>
                    <h1 className="text-2xl text-gray-800 mb-2">
                        Download Completed
                    </h1>
                </div>
                : <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-6" />
                    <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                        Downloading Your File
                    </h1>
                    <p className="text-gray-600">
                        Please wait...
                    </p>
                </div> :
            <div className="flex flex-col items-center">
                <div className="size-36 text-red-500 bg-red-200 rounded-full flex items-center justify-center mb-6">
                    <TriangleAlert size={50} />
                </div>
                <h1 className="text-2xl text-gray-800 mb-2">
                    {error}
                </h1>
            </div>
        }
    </div>
}