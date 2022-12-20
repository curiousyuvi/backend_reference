import { Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import wordCapitalize from '../helper/wordCapitalize.js'
import moment from 'moment'

const userSchema = new Schema({
	username: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		index: true,
		unique: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error('Invalid Email')
			}
		}
	},
	otp: {
		type: Number
	},
	otpExpireAt: {
		type: Date
	},
	isEmailVerified: {
		type: Boolean,
		default: false
	},
	password: {
		type: String,
		required: true
	},
	tokens: [
		{
			token: {
				type: String,
				required: true
			}
		}
	],
	isEnrolledInTournament: {
		type: Boolean,
		default: false
	},
	tournamentEnrollments: [
		{
			tournamentId: {
				type: String,
				required: true,
				index: true
			},
			teamName: {
				type: String,
				required: true
			},
			phoneNumber: {
				type: String,
				required: true
			},
			firstPerson: {
				playerRole: {
					type: String,
					required: true
				},
				realName: {
					type: String,
					required: true
				},
				inGamePlayerName: {
					type: String,
					required: true,
					index: true
				},
				gameId: {
					type: String,
					required: true
				},
				email: {
					type: String,
					required: true
				},
				discordUsername: {
					type: String,
					required: true
				}
			},
			secondPerson: {
				playerRole: {
					type: String,
					required: true
				},
				realName: {
					type: String,
					required: true
				},
				inGamePlayerName: {
					type: String,
					required: true,
					index: true
				},
				gameId: {
					type: String,
					required: true
				},
				email: {
					type: String,
					required: true
				},
				discordUsername: {
					type: String,
					required: true
				}
			},
			thirdPerson: {
				playerRole: {
					type: String,
					required: true
				},
				realName: {
					type: String,
					required: true
				},
				inGamePlayerName: {
					type: String,
					required: true,
					index: true
				},
				gameId: {
					type: String,
					required: true
				},
				email: {
					type: String,
					required: true
				},
				discordUsername: {
					type: String,
					required: true
				}
			},
			fourthPerson: {
				playerRole: {
					type: String,
					required: true
				},
				realName: {
					type: String,
					required: true
				},
				inGamePlayerName: {
					type: String,
					required: true,
					index: true
				},
				gameId: {
					type: String,
					required: true
				},
				email: {
					type: String,
					required: true
				},
				discordUsername: {
					type: String,
					required: true
				}
			},
			payment_meta: {
				order_id: String,
				payment_id: String,
				coupon: {
					type: String,
					default: '',
					index: true
				},
				amount: Number,
				isPaid: {
					type: Boolean,
					default: false,
					index: true
				}
			},
			meta: {
				roundId: {
					type: String,
					default: '',
					index: true
				},
				roomId: {
					type: String,
					default: '',
					index: true
				},
				roomName: {
					type: String,
					default: ''
				},
				roomScore: {
					type: Number,
					default: 0
				},
				totalScore: {
					type: Number,
					default: 0
				},
				isDisqualified: {
					type: Boolean,
					default: false,
					index: true
				},
				isTournamentOver: {
					type: Boolean,
					default: false
				}
			},
			participationDate: {
				default: Date.now(),
				type: Date
			}
		}
	]
})

userSchema.pre('save', async function (next) {
	const user = this
	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8)
	}
	if (user.isModified('email')) {
		user.isEmailVerified = false
	}
	next()
})

// enrollments -------------------------->
userSchema.methods.enrolInTournament = async function (tournamentId, data) {
	const user = this

	const tournamentEnrollment = {
		tournamentId,
		teamName: data.teamName,
		phoneNumber: data.phoneNumber,
		payment_meta: {
			order_id: data.order_id,
			payment_id: data.payment_id,
			coupon: data?.coupon ? data.coupon : '',
			isPaid: false,
			amount: data?.amount
		},
		meta: {
			roundId: '',
			roomId: '',
			roomName: '',
			roomScore: 0,
			totalScore: 0,
			isDisqualified: false,
			isTournamentOver: false
		},
		firstPerson: {
			playerRole: data.firstPerson.playerRole,
			realName: data.firstPerson.realName,
			inGamePlayerName: data.firstPerson.inGamePlayerName,
			gameId: data.firstPerson.gameId,
			email: data.firstPerson.email,
			discordUsername: data.firstPerson.discordUsername
		},
		secondPerson: {
			playerRole: data.secondPerson.playerRole,
			realName: data.secondPerson.realName,
			inGamePlayerName: data.secondPerson.inGamePlayerName,
			gameId: data.secondPerson.gameId,
			email: data.secondPerson.email,
			discordUsername: data.secondPerson.discordUsername
		},
		thirdPerson: {
			playerRole: data.thirdPerson.playerRole,
			realName: data.thirdPerson.realName,
			inGamePlayerName: data.thirdPerson.inGamePlayerName,
			gameId: data.thirdPerson.gameId,
			email: data.thirdPerson.email,
			discordUsername: data.thirdPerson.discordUsername
		},
		fourthPerson: {
			playerRole: data.fourthPerson.playerRole,
			realName: data.fourthPerson.realName,
			inGamePlayerName: data.fourthPerson.inGamePlayerName,
			gameId: data.fourthPerson.gameId,
			email: data.fourthPerson.email,
			discordUsername: data.fourthPerson.discordUsername
		}
	}

	const existingTournamentEnrollment = user.isEnrolledInTournament
		? user.tournamentEnrollments.find(
				item => item.tournamentId === tournamentId
		  )
		: null

	if (existingTournamentEnrollment?.payment_meta?.isPaid) {
		throw new Error('You have Already enrolled in this tournament !')
	}

	user.isEnrolledInTournament = true

	if (existingTournamentEnrollment) {
		user.tournamentEnrollments = user.tournamentEnrollments.filter(
			tournament => tournament.tournamentId !== tournamentId
		)
	}

	user.tournamentEnrollments =
		user.tournamentEnrollments.concat(tournamentEnrollment)

	await user.save()

	return tournamentEnrollment
}

userSchema.methods.verifyTournamentEnrollment = async function (
	tournamentId,
	payment
) {
	const user = this

	const existingTournamentEnrollment = user.isEnrolledInTournament
		? user.tournamentEnrollments.find(
				item => item.tournamentId === tournamentId
		  )
		: null

	if (existingTournamentEnrollment?.payment_meta?.isPaid) {
		throw new Error('You have Already Paid for this tournament !')
	}

	user.isEnrolledInTournament = true

	if (existingTournamentEnrollment) {
		user.tournamentEnrollments = user.tournamentEnrollments.map(tournament =>
			tournament.tournamentId === tournamentId
				? {
						...tournament,
						payment_meta: {
							...tournament.payment_meta,
							order_id: payment.order_id,
							payment_id: payment.payment_id,
							isPaid: true
						}
				  }
				: tournament
		)
	}

	await user.save()

	return user.tournamentEnrollments.find(
		item => item.tournamentId === tournamentId
	)
}

userSchema.methods.editEnrollment = async function (tournamentId, data) {
	const user = this

	const tournamentEnrollment = data

	const existingTournamentEnrollment = user.isEnrolledInTournament
		? user.tournamentEnrollments.find(
				item => item.tournamentId === tournamentId
		  )
		: null

	if (!existingTournamentEnrollment) {
		throw new Error('You have not enrolled in this tournament !')
	}

	user.isEnrolledInTournament = true

	user.tournamentEnrollments = user.tournamentEnrollments.map(tournament =>
		tournament.tournamentId === tournamentId
			? {
					...tournament,
					...tournamentEnrollment
			  }
			: tournament
	)

	await user.save()

	return user.tournamentEnrollments.find(
		item => item.tournamentId === tournamentId
	)
}

userSchema.methods.setRoom = async function ({
	tournamentId,
	roomId,
	roomName
}) {
	const user = this

	user.tournamentEnrollments = user.tournamentEnrollments.map(
		tournamentEnrollment =>
			tournamentEnrollment.tournamentId === tournamentId
				? {
						...tournamentEnrollment,
						meta: {
							roomId: roomId,
							roomName: roomName
						}
				  }
				: tournamentEnrollment
	)

	await user.save()
}
// enrollments -------------------------->

// Auth -------------------------->
userSchema.methods.generateToken = async function () {
	const user = this

	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
		expiresIn: '1440h'
	})

	user.tokens = user.tokens.concat({ token })
	await user.save()
	return token
}

userSchema.methods.verifyEmailByOtp = async function (otp) {
	const user = this
	const currentMoment = moment()
	const expireMoment = moment(user.otpExpireAt)

	const isExpired = expireMoment.isBefore(currentMoment)

	if (isExpired) throw new Error('Your OTP was expired !')

	if (user.otp !== otp) throw new Error('Invalid OTP !')
	else user.isEmailVerified = user.otp === otp

	await user.save()

	return user.isEmailVerified
}

userSchema.methods.setOtp = async function (otp) {
	const user = this

	user.otp = otp
	user.otpExpireAt = moment().add(5, 'minute').toDate()

	await user.save()
	return otp
}

userSchema.statics.findByToken = async function (token) {
	const User = this
	let decoded

	if (!token) {
		return new Error('Missing token header')
	}

	decoded = jwt.verify(token, process.env.JWT_SECRET)

	return await User.findOne({
		_id: decoded._id,
		'tokens.token': token
	})
}

userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email })
	if (!user) {
		throw new Error('Unable to login. Wrong email or Password!')
	}
	const isMatch = await bcrypt.compare(password, user.password)
	if (!isMatch) {
		throw new Error('Unable to login. Wrong email or Password!')
	}
	return user
}
// Auth -------------------------->

userSchema.post('save', function (error, doc, next) {
	if (error.name === 'MongoServerError' && error.code === 11000) {
		const keyPath = String(Object.keys(error?.keyPattern)[0])
		const keyPathCapitalize = wordCapitalize(keyPath)

		next(new Error(`${keyPathCapitalize} already exist !`))
	} else {
		next()
	}
})

const User = model('user', userSchema)

export default User
