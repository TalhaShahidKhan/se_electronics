import 'server-only'

export class SMSError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SMSError';
    }
}

export const sendSMS = async (phoneNumber: string, message: string) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            const res = await fetch(process.env.SMS_API_BASE_ENDPOINT! + '/smsapi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    api_key: process.env.SMS_API_KEY,
                    senderid: process.env.SMS_SENDER_ID,
                    number: phoneNumber,
                    message: message,
                })
            })
            const jsonRes = await res.json()
            if (jsonRes.response_code != 202) {
                throw new SMSError('SMS Service Error - ' + jsonRes.error_message)
            }
            return jsonRes
        } else {
            console.log(`
                [SMS Service]
                Phone Number: ${phoneNumber}
                Message: ${message}
                `);
        }
    } catch (error) {
        console.error(error)
    }
}

export const getSMSBalance = async (): Promise<number | null> => {
    try {
        const res = await fetch(process.env.SMS_API_BASE_ENDPOINT! + '/getBalanceApi?api_key=' + process.env.SMS_API_KEY)
        const jsonRes = await res.json()
        if (jsonRes.response_code === 1005) {
            throw new SMSError('[SMS Service Error]:' + jsonRes.error_message)
        }
        return jsonRes.balance
    } catch (error) {
        console.error(error)
        return null
    }
}