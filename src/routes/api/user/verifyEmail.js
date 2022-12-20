import User from '../../../models/user.js'
import S from 'fluent-json-schema'

export default async function (fastify, opts) {
  const bodySchema = S.object()
    .prop('otp', S.number().required())
    .prop('email', S.string().format(S.FORMATS.EMAIL).required())

  const responseSchema = S.object()
    .prop('message', S.string())
    .prop('isVerified', S.boolean())

  const handler = async (req, reply) => {
    try {
      const user = await User.findOne({ email: req.body.email })

      const isVerified = await user.verifyEmailByOtp(req.body.otp)

      reply.status(201).send({
        message: 'Your email has been verified successfully !',
        isVerified
      })
    } catch (error) {
      reply.status(400).send(error)
    }
  }

  fastify.route({
    method: ['POST'],
    url: '/verifyEmail',
    schema: {
      body: bodySchema,
      response: {
        '2xx': responseSchema
      }
    },
    logLevel: 'warn',
    handler
  })
}
