import S from 'fluent-json-schema'
import User from '../../../models/user.js'

export default async function (fastify, opts) {
  const bodySchema = S.object()
    .prop('email', S.string().format(S.FORMATS.EMAIL).required())
    .prop('otp', S.number().required())
    .prop('password', S.string().minLength(8).required())

  const responseSchema = S.object().prop('message', S.string())

  const handler = async (req, reply) => {
    try {
      const user = await User.findOne({ email: req.body.email })

      if (!user) throw new Error('User with this email is not available !')

      const isVerified = await user.verifyEmailByOtp(req.body.otp)

      user.password = req.body.password

      if (isVerified) await user.save()

      reply.status(200).send({
        message: 'Password has been changed successfully !'
      })
    } catch (error) {
      reply.status(400).send(error)
    }
  }

  fastify.route({
    method: ['POST'],
    url: '/changePassword',
    logLevel: 'warn',
    schema: {
      body: bodySchema,
      response: {
        '2xx': responseSchema
      }
    },
    handler
  })
}
