import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export const createStripeCheckoutSession = async (orderData) => {
  try {
    const response = await fetch('/api/payments/stripe/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    const session = await response.json()
    
    if (session.error) {
      throw new Error(session.error)
    }

    const stripe = await stripePromise
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    })

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Stripe checkout error:', error)
    throw error
  }
}

export const createStripePaymentIntent = async (amount, currency, metadata) => {
  try {
    const response = await fetch('/api/payments/stripe/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata,
      }),
    })

    const paymentIntent = await response.json()
    
    if (paymentIntent.error) {
      throw new Error(paymentIntent.error)
    }

    return paymentIntent
  } catch (error) {
    console.error('Stripe payment intent error:', error)
    throw error
  }
}

export { stripePromise }