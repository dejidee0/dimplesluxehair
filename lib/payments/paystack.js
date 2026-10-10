// Paystack integration for Nigerian and international payments
export const initializePaystackPayment = async (orderData) => {
  try {
    const response = await fetch('/api/payments/paystack/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    const data = await response.json()
    
    if (!data.status) {
      throw new Error(data.message || 'Payment initialization failed')
    }

    // Redirect to Paystack checkout
    window.location.href = data.data.authorization_url
    
    return data
  } catch (error) {
    console.error('Paystack initialization error:', error)
    throw error
  }
}

export const verifyPaystackPayment = async (reference) => {
  try {
    const response = await fetch(`/api/payments/paystack/verify/${reference}`)
    const data = await response.json()
    
    return data
  } catch (error) {
    console.error('Paystack verification error:', error)
    throw error
  }
}

// Convert GBP to NGN for Paystack (which primarily works with NGN)
export const convertToNGN = (gbpAmount, exchangeRate = 1850) => {
  return Math.round(gbpAmount * exchangeRate * 100) // Convert to kobo
}