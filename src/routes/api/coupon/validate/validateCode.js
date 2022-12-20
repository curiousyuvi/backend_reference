import S from 'fluent-json-schema'
import Coupon from '../../../../models/coupon.js'

export default async function (fastify, opts) {
	const bodySchema = S.object()
		.prop('code', S.string().required())
		.prop('amount', S.number().required())

	const metaSchema = S.object()
		.id('#metaSchema')
		.prop('description', S.string())
		.prop('code', S.string())
		.prop('amount', S.number())

	const responseSchema = S.object()
		.id('responseSchema')
		.definition('metaSchema', metaSchema)
		.prop('message', S.string())
		.prop('meta', S.ref('responseSchema#metaSchema'))

	const handler = async (req, reply) => {
		try {
			const { description, amount, code } =
				await Coupon.findByCodeAndGenerateDiscount(
					req.body.code,
					req.body.amount
				)

			reply.status(200).send({
				message: 'Coupon has been verified!',
				meta: {
					description,
					amount,
					code
				}
			})
		} catch (error) {
			reply.status(400).send(error)
		}
	}

	fastify.route({
		method: ['POST'],
		url: '/validateCode',
		schema: {
			response: {
				'2xx': responseSchema
			},
			body: bodySchema
		},
		logLevel: 'warn',
		preHandler: fastify.auth([fastify.verifyUserToken]),
		handler
	})
}
