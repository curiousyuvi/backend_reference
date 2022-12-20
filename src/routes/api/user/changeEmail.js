import S from 'fluent-json-schema'

export default async function (fastify, opts) {
  const bodySchema = S.object()
    .prop('email', S.string().format(S.FORMATS.EMAIL).required())
    .prop('otp', S.number())

  const responseSchema = S.object().prop('message', S.string())

  const handler = async (req, reply) => {
    try {
      const user = req.user
      const isEmailVerified = req.user.isEmailVerified

      if (isEmailVerified && !req.body?.otp) { throw new Error('Otp is required !') }

      let isOTPVerified

      if (isEmailVerified) { isOTPVerified = await user.verifyEmailByOtp(req.body?.otp) }

      user.email = req.body.email

      if (isOTPVerified || !isEmailVerified) await user.save()

      reply.status(200).send({
        message: 'Email has been changed successfully !'
      })
    } catch (error) {
      reply.status(400).send(error)
    }
  }

  fastify.route({
    method: ['PATCH'],
    url: '/changeEmail',
    logLevel: 'warn',
    schema: {
      body: bodySchema,
      response: {
        '2xx': responseSchema
      }
    },
    preHandler: fastify.auth([fastify.verifyUserToken]),
    handler
  })
}
