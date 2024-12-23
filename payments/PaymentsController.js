const { default: axios } = require("axios");
const crypto = require('crypto')


const {
    consumerKey,
    consumerSecret,
    authorizationUrl,
    processPaymentUrl
} = process.env

//?send from front end, given constants the do prevalidation
const transactionTypes = [
    "CustomerPayBillOnline",
    "CustomerBuyGoodsOnline"
]


let payBill  = transactionTypes[0]
let buyGoods = transactionTypes[1]

exports.requestPayment = async (req, res, next) => {

    try{

        const {phone, amount} = req.body
    
        console.log(`Paying ${amount} from ${phone}`)

        //get access token
        const accessToken = await getAccessToken(); 

        //make request to pay
        const transaction = new Transaction(amount, phone)
        console.log(transaction)
        const paymentResult = transaction.makePayBillPayment(
            accessToken,
            phone,
            amount
        )
        

    res.send({token : accessToken, data : {paymentResult}})

    }catch(e){
        console.log('error encountered.');
        
        next(e)
    }
    
    
}


const getAccessToken = async () => {

    const accessTokenResult = await axios.get(
        authorizationUrl,
        {
            auth : {
                username : consumerKey,
                password : consumerSecret
            }
        }
    )
    const {access_token} = accessTokenResult.data
    return access_token

}

class Transaction {

    constructor(amount,phone, transactionType){
        this.Amount = amount
        this.PartyA = phone 
        this.PhoneNumber = phone
        this.Timestamp = this.generateDate()
        this.BusinessShortCode=process.env.BusinessShortCode || '174379'
        this.PartyB=process.env.PartyB || '174379'
        this.CallBackURL = `${process.env.HOST}${process.env.CallBackURL}` || '/error'
        this.AccountReference = crypto.randomUUID()
        this.TransactionDesc = `Payment from ${phone} of ${amount}.`
        this.Password= this.generatePassword()
        this.TransactionType =transactionType == payBill ? payBill : buyGoods
    }

    generatePassword(){
        console.log(`${this.BusinessShortCode}\n${process.env.PassKey}\n${this.Timestamp}`)
        return Buffer.from(`${this.BusinessShortCode}${process.env.PassKey}${this.Timestamp}`).toString('base64')
    }

    generateDate(){
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
          
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    }

    async makePayBillPayment (token , phone, amount){
        
        console.log(this)

        const paymentResponse = await axios.post(
            processPaymentUrl,
            this,
            {
                headers : {
                    'Authorization' : `Bearer ${token}`
                }
            }
            
        )

        console.log(`Processed ${paymentResponse.data}`)
    }

    makeBuyGoodsPayment(token ,phone, amount){
        this.TransactionType = buyGoods
    }


}

exports.paymentCallbackHandler = async(req, res, next) => {
    console.log(`REturned ${req.body} ${req.url}`);
    
    res.send({
        success: true,
        response : `${req.body}`
    })

}