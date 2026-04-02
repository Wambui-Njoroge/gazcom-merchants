const axios = require('axios');

class MpesaService {
    constructor() {
        this.consumerKey = process.env.MPESA_CONSUMER_KEY;
        this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        this.passkey = process.env.MPESA_PASSKEY;
        this.shortCode = process.env.MPESA_SHORTCODE;
        this.environment = process.env.MPESA_ENVIRONMENT || 'sandbox';
        
        this.baseURL = this.environment === 'production' 
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }
    
    async getAccessToken() {
        const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
        
        try {
            const response = await axios.get(
                `${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
                {
                    headers: {
                        'Authorization': `Basic ${auth}`
                    }
                }
            );
            return response.data.access_token;
        } catch (error) {
            console.error('Error getting M-Pesa token:', error);
            throw error;
        }
    }
    
    async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc) {
        const token = await this.getAccessToken();
        const timestamp = this.getTimestamp();
        const password = Buffer.from(`${this.shortCode}${this.passkey}${timestamp}`).toString('base64');
        
        const data = {
            BusinessShortCode: this.shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: this.shortCode,
            PhoneNumber: phoneNumber,
            CallBackURL: `${process.env.BASE_URL}/api/mpesa/callback`,
            AccountReference: accountReference,
            TransactionDesc: transactionDesc
        };
        
        try {
            const response = await axios.post(
                `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error initiating STK push:', error);
            throw error;
        }
    }
    
    getTimestamp() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    }
}

module.exports = new MpesaService();