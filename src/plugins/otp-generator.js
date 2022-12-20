import fp from 'fastify-plugin'

export default fp(async fastify => {
	try {
		function getOTP() {
			const digits = '0123456789'
			let OTP = ''
			for (let i = 0; i < 6; i++) {
				OTP += digits[Math.floor(Math.random() * 10)]
			}
			return OTP
		}

		fastify.decorate('generateOTP', async user => {
			try {
				const otp = getOTP()

				const res = await fastify.sendMail({
					from: fastify.config.EMAIL,
					to: user.email,
					subject: 'Your OTP is ' + otp,
					text: otp,
					template: 'OTP',
					context: {
						otp
					}
				})

				user.setOtp(otp)

				return {
					otp,
					isOTPSent: true,
					res
				}
			} catch (error) {
				return {
					isOTPSent: false,
					error
				}
			}
		})
	} catch (error) {
		fastify.log.error(error)
	}
})
