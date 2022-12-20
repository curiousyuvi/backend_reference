import fp from 'fastify-plugin'
import { sentenceCase } from 'change-case'

export default fp(async (fastify, opts) => {
	fastify.setErrorHandler(function (error, request, reply) {
		try {
			const { statusCode, validation } = error

			reply.status(statusCode || 400)

			if (!validation) return reply.send(error)

			let response

			for (const { keyword, params, instancePath, message } of validation) {
				if (keyword === 'required') {
					response = {
						message: `${params.missingProperty} is required !`
					}

					break
				} else if (keyword === 'format') {
					response = {
						message: `${params.format} is invalid !`
					}

					break
				} else if (keyword === 'minLength') {
					const field = instancePath.replace('/', '')

					response = {
						message: `${field} should be at least 8 characters long !`
					}

					break
				} else if (keyword === 'type') {
					if (instancePath === '') {
						response = {
							message: 'body is required and should be object!'
						}
					}

					break
				} else {
					response = { message: message, errors: validation }

					break
				}
			}

			return reply.send({
				message: sentenceCase(response.message),
				...response
			})
		} catch (error) {
			return error
		}
	})
})
