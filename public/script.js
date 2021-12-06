async function comprar() {
  const products = [
    { id: 1, cantidad: 2 },
    { id: 2, cantidad: 3 },
  ]

  const responseData = await fetch('/preparar-pago', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(products),
  })
  const response = await responseData.json()
  if (!responseData.ok) return alert(response.message)
  location.href = response.payWithCard
}

async function response() {
  let url = window.location.href
  url = new URL(url)
  const id = url.searchParams.get('id')
  const clientTxId = url.searchParams.get('clientTransactionId')

  const responseData = await fetch('/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id,
      clientTxId,
    }),
  })
  const response = await responseData.json()
  console.log(response)
}
