// Apple Pay integration
export const isApplePayAvailable = () => {
  return window.ApplePaySession && ApplePaySession.canMakePayments()
}

export const initializeApplePay = async (orderData) => {
  if (!isApplePayAvailable()) {
    throw new Error('Apple Pay is not available on this device')
  }

  const paymentRequest = {
    countryCode: 'GB',
    currencyCode: orderData.currency,
    supportedNetworks: ['visa', 'masterCard', 'amex'],
    merchantCapabilities: ['supports3DS'],
    total: {
      label: 'Dimplesluxe',
      amount: orderData.total.toString(),
    },
    lineItems: orderData.items.map(item => ({
      label: item.name,
      amount: (item.price * item.quantity).toString(),
    })),
  }

  const session = new ApplePaySession(3, paymentRequest)

  return new Promise((resolve, reject) => {
    session.onvalidatemerchant = async (event) => {
      try {
        const response = await fetch('/api/payments/applepay/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            validationURL: event.validationURL,
            displayName: 'Dimplesluxe',
          }),
        })

        const merchantSession = await response.json()
        session.completeMerchantValidation(merchantSession)
      } catch (error) {
        session.abort()
        reject(error)
      }
    }

    session.onpaymentauthorized = async (event) => {
      try {
        const response = await fetch('/api/payments/applepay/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment: event.payment,
            orderData,
          }),
        })

        const result = await response.json()

        if (result.success) {
          session.completePayment(ApplePaySession.STATUS_SUCCESS)
          resolve(result)
        } else {
          session.completePayment(ApplePaySession.STATUS_FAILURE)
          reject(new Error(result.error))
        }
      } catch (error) {
        session.completePayment(ApplePaySession.STATUS_FAILURE)
        reject(error)
      }
    }

    session.oncancel = () => {
      reject(new Error('Apple Pay cancelled by user'))
    }

    session.begin()
  })
}