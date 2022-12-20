import S from 'fluent-json-schema'
import User from '../../../models/user.js'

export default async function (fastify, opts) {
	const bodySchema = S.object().prop(
		'email',
		S.string().format(S.FORMATS.EMAIL).required()
	)

	const responseSchema = S.object()
		.prop('message', S.string())
		.prop('isOTPSent', S.boolean())

	const handlerByToken = async (req, reply) => {
		try {
			const user = req.user

			const { isOTPSent } = await fastify.generateOTP(user)

			reply.status(201).send({
				message: isOTPSent
					? 'OTP has been sent to your email!'
					: 'Unable to sent OTP!',
				isOTPSent
			})
		} catch (error) {
			reply.status(400).send(error)
		}
	}

	const handlerByEmail = async (req, reply) => {
		try {
			const user = await User.findOne({ email: req.body.email })

			if (!user) throw new Error('User with this email is not available !')

			const { isOTPSent } = await fastify.generateOTP(user)

			reply.status(201).send({
				message: 'OTP has been sent to your email!',
				isOTPSent
			})
		} catch (error) {
			reply.status(400).send(error)
		}
	}

	fastify.route({
		method: ['POST'],
		url: '/generateOTP',
		logLevel: 'warn',
		schema: {
			body: bodySchema,
			response: {
				'2xx': responseSchema
			}
		},
		handler: handlerByEmail
	})

	fastify.route({
		method: ['GET'],
		url: '/generateOTP',
		logLevel: 'warn',
		schema: {
			response: {
				'2xx': responseSchema
			}
		},
		preHandler: fastify.auth([fastify.verifyUserToken]),
		handler: handlerByToken
	})
}
