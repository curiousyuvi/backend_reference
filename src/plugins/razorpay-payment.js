import fp from 'fastify-plugin'
import fastifyNodemailer from 'fastify-nodemailer'
import Razorpay from 'razorpay'

// import User from "../models/user";
// const models = { User };

export default fp(async (fastify) => {
  try {
    const razorpayInstance = new Razorpay({
      key_id: fastify.config.PAYMENT_KEY_ID,
      key_secret: fastify.config.PAYMENT_KEY_SECRET
    })

    fastify.decorate('razorpayInstance', razorpayInstance)

    fastify.log.info('Razorpay Instance Created successfully')
  } catch (error) {
    fastify.log.error('Razorpay disconnected')
    console.error(error)
  }
})
