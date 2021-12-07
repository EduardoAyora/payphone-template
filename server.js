require('dotenv').config()
const fetch = require('node-fetch')
const express = require('express')
const app = express()

const token = process.env.SECRET_TOKEN_PAYPHONE

const productsList = [
  { id: 1, precio: 1 },
  { id: 2, precio: 2 },
]

const paymentOrders = []

let contador = 30

app.use(express.json())
app.set('view engine', 'ejs')

// const suscribersRouter = require('./routes/suscribers')
// app.use('/subscribers', suscribersRouter)

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/response', (req, res) => {
  res.render('response')
})

app.post('/preparar-pago', async (req, res) => {
  const products = req.body
  let total = 0
  products.forEach((product) => {
    const completeProduct = productsList.find(
      (productInList) => productInList.id === product.id
    )
    total += completeProduct.precio * product.cantidad
  })
  total *= 100
  contador += 1
  try {
    const responseData = await fetch(
      'https://pay.payphonetodoesposible.com/api/button/Prepare',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: total,
          amountWithoutTax: total,
          currency: 'USD',
          clientTransactionId: contador,
          responseUrl: 'http://localhost:3000/response',
          cancellationUrl: 'http://localhost:3000/',
          lineItems: [
            {
              productName: 'Uno',
              unitPrice: 100,
              quantity: 2,
              totalAmount: 200,
            },
            {
              productName: 'Dos',
              unitPrice: 200,
              quantity: 3,
              totalAmount: 600,
            },
          ],
        }),
      }
    )
    const response = await responseData.json()
    if (!responseData.ok) {
      if ('message' in response) throw new Error(response.message)
      throw new Error('No ha sido posible comunicarse con PayPhone')
    }
    paymentOrders.push({ clientTransactionId: contador, products })
    res.json(response)
  } catch (e) {
    console.log(e.message)
    res.status(400).json({
      message: e.message,
    })
  }
})

app.post('/confirm', async (req, res) => {
  const id = req.body.id
  const clientTxId = req.body.clientTxId

  try {
    const responseData = await fetch(
      'https://pay.payphonetodoesposible.com/api/button/V2/Confirm',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id,
          clientTxId,
        }),
      }
    )
    const response = await responseData.json()
    if (!responseData.ok) {
      if ('message' in response) throw new Error(response.message)
      throw new Error('No ha sido posible confirmar el pago con PayPhone')
    }
    const purchase = paymentOrders.find(
      ({ clientTransactionId }) =>
        clientTransactionId == response.clientTransactionId
    )
    console.log('purchase', JSON.stringify(purchase, null, 2))
    res.json(response)
  } catch (e) {
    console.log(e.message)
    res.status(400).json({
      message: e.message,
    })
  }
})

app.listen(3000, () => {
  console.log('servidor iniciado')
})
