import S from 'fluent-json-schema'

export default async function (fastify, opts) {
	const handler = async (req, reply) => {
		try {
			const { tournamentId, updatedFields } = req.body

			await req.user.editEnrollment(tournamentId, updatedFields)

			reply.status(200).send({
				message: 'Your enrolment has been successfully updated !'
			})
		} catch (error) {
			reply.status(400).send(error)
		}
	}

	fastify.route({
		method: ['PATCH'],
		url: '/',
		schema: {
			body: bodySchema,
			response: {
				'2xx': responseSchema
			}
		},
		preHandler: fastify.auth([fastify.verifyUserToken]),
		logLevel: 'warn',
		handler
	})
}

const playerSchema = S.object()
	.id('#playerSchema')
	.prop('playerRole', S.string())
	.prop('realName', S.string())
	.prop('inGamePlayerName', S.string())
	.prop('gameId', S.string())
	.prop('email', S.string().format(S.FORMATS.EMAIL).required())
	.prop('discordUsername', S.string())

const tournamentEnrollment = S.object()
	.id('#tournamentEnrollment')
	.prop('teamName', S.string())
	.prop('phoneNumber', S.string())
	.prop('firstPerson', S.ref('bodySchema#playerSchema'))
	.prop('secondPerson', S.ref('bodySchema#playerSchema'))
	.prop('thirdPerson', S.ref('bodySchema#playerSchema'))
	.prop('fourthPerson', S.ref('bodySchema#playerSchema'))

const bodySchema = S.object()
	.id('bodySchema')

	.definition('playerSchema', playerSchema)
	.definition('tournamentEnrollment', tournamentEnrollment)

	.prop('tournamentId', S.string())
	.required()
	.prop('updatedFields', S.ref('bodySchema#tournamentEnrollment'))

const responseSchema = S.object().prop('message', S.string())
