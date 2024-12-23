require('dotenv/config')
const morgan = require('morgan')
const express = require('express')
const https = require('https');
const fs = require('fs'); 
const paymentRouter = require('./routes/payments')
const port = 3000 || process.env.PORT

const app = express()


app.use(morgan('dev'))

// body parser
app.use(express.json());

app.use('/pay',paymentRouter)

app.use('/', (req, res)=>{
    res.send({message : 'secured.', code : 200})
})

app.all("*", (req, res)=>{
    res.send({message : 'nothing found.', code : 404})
})

app.listen(port, ()=>{
    //connect to db
    console.log(`Server started at port : ${port}`);
})

// Load SSL/TLS certificate and private key
// const options = {
//     key: fs.readFileSync('./signing/key.pem'),   // Private key
//     cert: fs.readFileSync('./signing/cert.pem') // Certificate
// };


// try {
//     https.createServer(options, app).listen(443, (err) => {
//         console.log('HTTPS Server running on port 443');
//     });
// }catch(e){
//     console.log(`err -> ${err}`);
    
// }




