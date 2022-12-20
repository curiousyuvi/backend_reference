import S from 'fluent-json-schema'
import tournament from '../../../config/tournament.js'
import Coupon from '../../../models/coupon.js'

export default async function (fastify, opts) {
	const handler = async (req, reply) => {
		try {
			const { tournamentId, currency, receipt } = tournament

			let notes = {
				description: tournament.description
			}

			let lastAmount = tournament.amount
			let isCouponUsed = false

			if (req?.body?.coupon) {
				const code = req?.body?.coupon
				const { description, amount } =
					await Coupon.findByCodeAndGenerateDiscount(code, lastAmount)
				fastify.log.info(lastAmount)
				notes.description = description
				lastAmount = amount
				isCouponUsed = true
			}

			if (!req.user.isEmailVerified) {
				throw new Error(
					'Please verify your email first to enroll in our tournament !'
				)
			}

			const paymentResponse = await fastify.razorpayInstance.orders.create({
				amount: lastAmount,
				currency,
				receipt,
				notes
			})

			if (!paymentResponse) throw new Error('Some thing went wrong !')

			await req.user.enrolInTournament(tournamentId, {
				order_id: paymentResponse.id,
				payment_id: '',
				amount: lastAmount,
				coupon: req?.body?.coupon,
				...req.body
			})

			reply.status(200).send({
				message:
					'Your enrolment listed successfully please proceed with payments to continue !',
				isCouponUsed,
				payment: {
					key: fastify.config.PAYMENT_KEY_ID,
					order_id: paymentResponse.id,
					...paymentResponse
				}
			})
		} catch (error) {
			reply.status(400).send(error)
		}
	}

	fastify.route({
		method: ['POST'],
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

const notesSchema = S.object()
	.id('#notesSchema')
	.prop('description', S.string())

const paymentSchema = S.object()
	.id('#paymentSchema')
	.prop('key', S.string())
	.prop('order_id', S.string())
	.prop('entity', S.string())
	.prop('amount', S.number())
	.prop('amount_paid', S.number())
	.prop('amount_due', S.number())
	.prop('currency', S.string())
	.prop('receipt', S.string())
	.prop('offer_id', S.null())
	.prop('status', S.string())
	.prop('attempts', S.number())
	.prop('notes', S.ref('tournamentResponse#notesSchema'))
	.prop('created_at', S.number())

const bodySchema = S.object()
	.id('tournamentBody')
	.prop('coupon', S.string())
	.prop('teamName', S.string().required())
	.prop('phoneNumber', S.string().required())
	.definition('playerSchema', playerSchema)
	.prop('firstPerson', S.ref('tournamentBody#playerSchema'))
	.prop('secondPerson', S.ref('tournamentBody#playerSchema'))
	.prop('thirdPerson', S.ref('tournamentBody#playerSchema'))
	.prop('fourthPerson', S.ref('tournamentBody#playerSchema'))

const responseSchema = S.object()
	.id('tournamentResponse')
	.prop('message', S.string())
	.prop('isCouponUsed', S.boolean())
	.definition('paymentSchema', paymentSchema)
	.definition('notesSchema', notesSchema)
	.prop('payment', S.ref('tournamentResponse#paymentSchema'))
