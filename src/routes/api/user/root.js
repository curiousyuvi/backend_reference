import S from 'fluent-json-schema'

export default async function (fastify, opts) {
	const responseSchema = S.object()
		.prop('message', S.string())
		.prop('user', S.ref('global#safeUser'))

	fastify.route({
		method: ['GET'],
		url: '/',
		logLevel: 'warn',
		schema: {
			response: {
				'2xx': responseSchema
			}
		},
		preHandler: fastify.auth([fastify.verifyUserToken]),
		handler: async (req, reply) => {
			try {
				const user = req.user
				if (
					user.isEnrolledInTournament &&
					user.tournamentEnrollments?.[0]?.payment_meta?.isPaid
				)
					req.user.isEnrolledInTournament = true
				else req.user.isEnrolledInTournament = false
        
				reply.send({
					message: 'User data fetched successfully !',
					user: req.user
				})
			} catch (error) {
				reply.status(500).send(error)
			}
		}
	})

	fastify.route({
		method: ['POST', 'HEAD'],
		url: '/logout',
		logLevel: 'warn',
		preHandler: fastify.auth([fastify.verifyUserToken]),
		handler: async (req, reply) => {
			try {
				req.user.tokens = req.user.tokens.filter(token => {
					return token.token !== req.token
				})
				const loggedOutUser = await req.user.save()
				reply.send({ message: 'You are logged out!', user: loggedOutUser })
			} catch (error) {
				reply.status(400).send(error)
			}
		}
	})

	fastify.route({
		method: ['POST', 'HEAD'],
		url: '/logout-all',
		logLevel: 'warn',
		preHandler: fastify.auth([fastify.verifyUserToken]),
		handler: async (req, reply) => {
			try {
				req.user.tokens = req.user.tokens = []
				const loggedOutUser = await req.user.save()
				reply.send({ message: 'You are logged out!', user: loggedOutUser })
			} catch (error) {
				reply.status(400).send(error)
			}
		}
	})
}
