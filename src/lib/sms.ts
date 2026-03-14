import "server-only";

export class SMSError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SMSError";
  }
}

export const sendSMS = async (phoneNumber: string, message: string) => {
  try {
    const shouldSendRealSMS =
      process.env.NODE_ENV === "production" ||
      process.env.SMS_SEND_IN_DEV === "true";

    if (
      shouldSendRealSMS &&
      process.env.SMS_API_BASE_ENDPOINT &&
      process.env.SMS_API_KEY
    ) {
      const res = await fetch(process.env.SMS_API_BASE_ENDPOINT + "/smsapi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: process.env.SMS_API_KEY,
          senderid: process.env.SMS_SENDER_ID,
          number: phoneNumber,
          message: message,
        }),
      });
      const jsonRes = await res.json();
      if (jsonRes.response_code != 202) {
        const errMsg = jsonRes.error_message || JSON.stringify(jsonRes);
        throw new SMSError("SMS Service Error - " + errMsg);
      }
      return jsonRes;
    } else {
      // Development: log to console (set SMS_SEND_IN_DEV=true in .env to send real SMS)
      console.log(`
[SMS Service] ${shouldSendRealSMS ? "(would send but missing SMS_API_BASE_ENDPOINT or SMS_API_KEY)" : "(dev mode - set SMS_SEND_IN_DEV=true to send real SMS)"}
Phone: ${phoneNumber}
Message: ${message}
`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSMSBalance = async (): Promise<number | null> => {
  try {
    const endpoint = process.env.SMS_API_BASE_ENDPOINT;
    const apiKey = process.env.SMS_API_KEY;
    if (!endpoint || !apiKey) {
      return null;
    }
    const res = await fetch(endpoint + "/getBalanceApi?api_key=" + apiKey);
    const jsonRes = await res.json();
    if (jsonRes.response_code === 1005) {
      throw new SMSError("[SMS Service Error]:" + jsonRes.error_message);
    }
    return jsonRes.balance;
  } catch (error) {
    // Silently return null on network/API errors - don't crash the layout
    return null;
  }
};
