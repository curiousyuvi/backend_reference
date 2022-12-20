import S from 'fluent-json-schema'

export default async function (fastify, opts) {
	const handler = async (req, reply) => {
		try {
			const { isEnrolledInTournament, tournamentEnrollments } = req.user

			let tournamentEnrollment
			let isTournamentEnrollment

			if (isEnrolledInTournament && tournamentEnrollments?.[0]?.payment_meta?.isPaid) {
				tournamentEnrollment = tournamentEnrollments[0]
				isTournamentEnrollment = true
			} else {
				isTournamentEnrollment = false
			}

			reply.status(200).send({
				message: 'Tournament Enrollments fetch successfully !',
				tournamentEnrollment,
				isTournamentEnrollment
			})
		} catch (error) {
			reply.status(400).send(error)
		}
	}

	fastify.route({
		method: ['GET'],
		url: '/',
		schema: {
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
	.prop('tournamentId', S.string().required())
	.prop('teamName', S.string().required())
	.prop('phoneNumber', S.string().required())
	.prop('firstPerson', S.ref('tournamentResponse#playerSchema'))
	.prop('secondPerson', S.ref('tournamentResponse#playerSchema'))
	.prop('thirdPerson', S.ref('tournamentResponse#playerSchema'))
	.prop('fourthPerson', S.ref('tournamentResponse#playerSchema'))

const responseSchema = S.object()
	.id('tournamentResponse')
	.prop('message', S.string())
	.definition('playerSchema', playerSchema)
	.definition('tournamentEnrollment', tournamentEnrollment)
	.prop('isTournamentEnrollment', S.boolean())
	.prop(
		'tournamentEnrollment',
		S.ref('tournamentResponse#tournamentEnrollment')
	)
