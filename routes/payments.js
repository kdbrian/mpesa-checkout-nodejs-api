const express = require('express')
const router = express.Router()
const {requestPayment, paymentCallbackHandler} = require('../payments/PaymentsController')

router.get('/', requestPayment)
.get('/payment-callback', paymentCallbackHandler)


module.exports = router
