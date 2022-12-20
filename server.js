import Fastify from 'fastify'
// import appService from './app.js'
import closeWithGrace from 'close-with-grace'
import * as dotenv from 'dotenv'

const appService = await import('./app.js')

dotenv.config()

const envToLogger = {
	development: {
		transport: {
			target: 'pino-pretty',
			options: {
				translateTime: 'HH:MM:ss Z',
				ignore: 'pid,hostname'
			}
		}
	},
	production: true,
	test: false
}

const app = Fastify({
	logger: envToLogger[process.env.ENVIRONMENT]
})

app.register(appService)

const closeListeners = closeWithGrace(
	{ delay: process.env.FASTIFY_CLOSE_GRACE_DELAY || 500 },
	async function ({ signal, err, manual }) {
		if (err) {
			app.log.error(err)
		}
		await app.close()
	}
)

app.addHook('onClose', async (instance, done) => {
	closeListeners.uninstall()
	done()
})

app.listen({ port: process.env.PORT || 3000 }, err => {
	if (err) {
		app.log.error(err)
		process.exit(1)
	}
})
