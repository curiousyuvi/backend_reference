import User from '../../../models/user.js'
import S from 'fluent-json-schema'

export default async function (fastify, opts) {
  const bodySchema = S.object()
    .prop('username', S.string().minLength(3).required())
    .prop('email', S.string().format(S.FORMATS.EMAIL).required())
    .prop('password', S.string().minLength(8).required())

  const responseSchema = S.object()
    .prop('message', S.string())
    .prop('token', S.string())
    .prop('isOTPSent', S.boolean())
    .prop('user', S.ref('global#safeUser'))

  const handler = async (req, reply) => {
    const user = new User(req.body)

    try {
      await user.save()

      const token = await user.generateToken()

      const { isOTPSent } = await fastify.generateOTP(user)

      reply.status(201).send({
        message: 'Your account has been created !',
        token,
        user,
        isOTPSent
      })
    } catch (error) {
      reply.status(400).send(error)
    }
  }

  fastify.route({
    method: ['POST'],
    url: '/register',
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
