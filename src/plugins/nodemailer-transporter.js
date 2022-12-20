import fp from 'fastify-plugin'
import fastifyNodemailer from 'fastify-nodemailer'
import path from 'path'
import fs from 'fs'
import ejs from 'ejs'
import juice from 'juice'
import { htmlToText } from 'html-to-text'
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export default fp(async fastify => {
	try {
		fastify.register(fastifyNodemailer, {
			service: 'gmail',
			host: 'smtp.gmail.com',
			secure: process.env.NODE_ENV !== 'development',
			auth: {
				type: 'smtp',
				user: fastify.config.EMAIL,
				pass: fastify.config.WORD,
				expires: 1484314697598
			}
		})

		fastify.after(() => {
			const { nodemailer } = fastify

			const success = nodemailer.verify()
			if (success) fastify.log.info('Nodemailer connected successfully')
			else fastify.log.error('Nodemailer disconnected')
		})

		fastify.decorate(
			'sendMail',
			async ({ template: templateName, context, ...restOfOptions }) => {
				try {
					const templatePath = path.join(
						__dirname,
						`../Emails/${templateName}.html`
					)

					const options = {
						...restOfOptions
					}

					if (templateName && fs.existsSync(templatePath)) {
						const template = fs.readFileSync(templatePath, 'utf-8')
						const html = ejs.render(template, context)
						const text = htmlToText(html)
						const htmlWithStylesInlined = juice(html)

						options.html = htmlWithStylesInlined
						options.text = text
					}

					return await fastify.nodemailer.sendMail(options)
				} catch (error) {
					fastify.log.error(error)
				}
			}
		)
	} catch (error) {
		fastify.log.error(error)
	}
})
