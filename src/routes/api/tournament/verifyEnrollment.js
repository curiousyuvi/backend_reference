import S from 'fluent-json-schema'
import crypto from 'crypto'
import tournament from '../../../config/tournament.js'

export default async function (fastify, opts) {
	const handler = async (req, reply) => {
		reply.header('Access-Control-Allow-Origin', '*')
		reply.header(
			'Access-Control-Allow-Headers',
			'x-razorpay-signature, authorization, Origin, X-Requested-With, Content-Type, Accept'
		)

		try {
			const { order_id, payment_id } = req.body
			const razorpay_signature = req.headers['x-razorpay-signature']

			const hmac = crypto.createHmac(
				'sha256',
				fastify.config.PAYMENT_KEY_SECRET
			)

			hmac.update(order_id + '|' + payment_id)

			const generated_signature = hmac.digest('hex')

			if (razorpay_signature !== generated_signature) {
				throw new Error('Payment verification failed')
			}

			const tournamentEnrollment = await req.user.verifyTournamentEnrollment(
				tournament.tournamentId,
				{
					order_id,
					payment_id
				}
			)

			await fastify.sendMail({
				from: fastify.config.EMAIL,
				to: req.user.email,
				subject: 'Registered Successfully',
				text: 'Registered Successfully',
				template: 'RegisteredSuccessfully'
			})

			await fastify.sendMail({
				from: fastify.config.EMAIL,
				to: tournamentEnrollment.firstPerson.email,
				subject: 'Registered Successfully',
				text: 'Registered Successfully',
				template: 'RegisteredSuccessfully'
			})
      
			await fastify.sendMail({
				from: fastify.config.EMAIL,
				to: tournamentEnrollment.secondPerson.email,
				subject: 'Registered Successfully',
				text: 'Registered Successfully',
				template: 'RegisteredSuccessfully'
			})
      
			await fastify.sendMail({
				from: fastify.config.EMAIL,
				to: tournamentEnrollment.thirdPerson.email,
				subject: 'Registered Successfully',
				text: 'Registered Successfully',
				template: 'RegisteredSuccessfully'
			})

			await fastify.sendMail({
				from: fastify.config.EMAIL,
				to: tournamentEnrollment.fourthPerson.email,
				subject: 'Registered Successfully',
				text: 'Registered Successfully',
				template: 'RegisteredSuccessfully'
			})

			reply.status(200).send({
				message: 'Payment has been verified !',
				isVerified: tournamentEnrollment?.payment_meta?.isPaid
			})
		} catch (error) {
			reply.status(400).send(error)
		}
	}

	fastify.route({
		method: ['POST'],
		url: '/verifyEnrolment',
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

const bodySchema = S.object()
	.prop('order_id', S.string().required())
	.prop('payment_id', S.string().required())

const responseSchema = S.object()
	.id('tournamentResponse')
	.prop('message', S.string())
	.prop('isVerified', S.boolean())
