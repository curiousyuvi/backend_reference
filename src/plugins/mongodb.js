import fp from 'fastify-plugin'
import mongoose from 'mongoose'

export default fp(async fastify => {
	try {
		mongoose.connection.on('connected', () => {
			fastify.log.info('MongoDB connected successfully')
		})

		mongoose.connection.on('disconnected', () => {
			fastify.log.error('MongoDB disconnected')
		})

		await mongoose.connect(fastify.config.MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		})

		fastify.addHook('onClose', (app, done) => {
			fastify.mongoose.connection.on('close', function () {
				done()
			})
			fastify.mongoose.connection.close()
		})

		fastify.decorate('mongoose', mongoose)
	} catch (error) {
		fastify.log.error(error)
	}
})
