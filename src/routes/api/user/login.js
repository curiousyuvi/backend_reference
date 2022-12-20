import S from 'fluent-json-schema'

export default async function (fastify) {
	const bodySchema = S.object()
		.prop('email', S.string().format(S.FORMATS.EMAIL).required())
		.prop('password', S.string().required())

	const responseSchema = S.object()
		.prop('message', S.string())
		.prop('token', S.string())
		.prop('user', S.ref('global#safeUser'))

	const handler = async (req, reply) => {
		const token = await req.user.generateToken()

		const user = req.user

		if (
			user.isEnrolledInTournament &&
			user.tournamentEnrollments?.[0]?.payment_meta?.isPaid
		)
			req.user.isEnrolledInTournament = true
		else req.user.isEnrolledInTournament = false

		reply.status(200).send({
			message: 'Logged in successfully !',
			user: req.user,
			token
		})
	}

	fastify.route({
		method: ['POST'],
		url: '/login',
		logLevel: 'warn',
		schema: {
			body: bodySchema,
			response: {
				'2xx': responseSchema
			}
		},
		preHandler: fastify.auth([fastify.verifyUserCredentials]),
		handler
	})
}
