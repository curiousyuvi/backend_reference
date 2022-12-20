import AutoLoad from '@fastify/autoload'
import fastifyEnv from '@fastify/env'
import fastifyCors from '@fastify/cors'
import * as dotenv from 'dotenv'

import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const envSchema = {
	type: 'object',
	required: ['PORT', 'JWT_SECRET', 'MONGODB_URI'],
	properties: {
		PORT: {
			type: 'number'
		},
		JWT_SECRET: {
			type: 'string'
		},
		MONGODB_URI: {
			type: 'string'
		},
		EMAIL: {
			type: 'string'
		},
		WORD: {
			type: 'string'
		},
		PAYMENT_KEY_ID: {
			type: 'string'
		},
		PAYMENT_KEY_SECRET: {
			type: 'string'
		},
		FRONTEND_ORIGIN: {
			type: 'string'
		},
		DISCORD_SECRET: {
			type: 'string'
		}
	}
}

const envOptions = {
	confKey: 'config',
	schema: envSchema,
	dotenv: true,
	data: process.env
}

dotenv.config()

export default async (fastify, opts) => {
	fastify.register(fastifyEnv, envOptions)
	// const whitelist = ["http://localhost:3000", "https://kurukshetra.vercel.app"];

	fastify.register(fastifyCors, {
		// origin: "http://localhost:3000",
		origin: 'https://www.kurukshetraesports.com',
		// origin: fastify.config.FRONTEND_ORIGIN,
		// origin: function (origin, callback) {
		//   if (whitelist.indexOf(origin) !== -1) {
		//     callback(null, true);
		//   } else {
		//     callback(new Error("Not allowed by CORS"));
		//   }
		// },

		optionsSuccessStatus: 200,
		methods: ['POST', 'GET', 'PUT', 'PATCH', 'OPTIONS']
	})

	fastify.register(AutoLoad, {
		dir: join(__dirname, 'src/plugins'),
		options: Object.assign({}, opts)
	})

	fastify.register(AutoLoad, {
		dir: join(__dirname, 'src/routes'),
		options: Object.assign({}, opts)
	})
}
