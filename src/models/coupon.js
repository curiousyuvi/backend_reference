import mongoose from 'mongoose'
import validateExpiryDate from '../helper/validateExpiryDate.js'
import wordCapitalize from '../helper/wordCapitalize.js'
import User from './user.js'

const couponSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	code: {
		type: String,
		required: true,
		index: true,
		unique: true
	},
	description: {
		type: String,
		required: true
	},
	numberOfUsers: {
		type: Number,
		default: 0
	},
	limitOfUsers: {
		type: Number,
		required: true
	},
	limitOfAmount: {
		type: Number,
		required: true
	},
	discountPercentage: {
		type: Number,
		required: true
	},
	expireAt: {
		type: Date
	},
	createdAt: {
		default: Date.now(),
		type: Date
	}
})

couponSchema.methods.validateNumberOfUsers = async function () {
	const coupon = this

	const { code } = coupon

	const user = await User.aggregate([
		{ $unwind: '$tournamentEnrollments' },
		{
			$match: {
				'tournamentEnrollments.payment_meta.isPaid': true,
				'tournamentEnrollments.payment_meta.coupon': code
			}
		},
		{
			$group: {
				_id: '$tournamentEnrollments.payment_meta.coupon',
				count: { $sum: 1 }
			}
		},
		{
			$project: {
				field: '$_id',
				count: 1,
				_id: 0
			}
		}
	])

	coupon.numberOfUsers = user?.[0]?.count ? user?.[0]?.count : 0

	coupon.save()

	return user
}

couponSchema.methods.update = async function (data) {
	const coupon = this

	const setValue = (primary, secondary) => (primary ? primary : secondary)

	coupon.name = setValue(data?.name, coupon?.name)
	coupon.description = setValue(data?.description, coupon?.description)
	coupon.discountPercentage = setValue(
		data?.discountPercentage,
		coupon?.discountPercentage
	)
	coupon.limitOfUsers = setValue(data?.limitOfUsers, coupon?.limitOfUsers)
	coupon.limitOfAmount = setValue(data?.limitOfAmount, coupon?.limitOfAmount)
	coupon.expireAt = setValue(data?.expireAt, coupon?.expireAt)

	await coupon.save()
	return coupon
}

couponSchema.statics.findByCode = async code => {
	const coupon = await Coupon.findOne({ code })

	if (!coupon) {
		throw new Error('Unable to find this coupon code. Invalid coupon code!')
	}

	return coupon
}

couponSchema.statics.findByCodeAndGenerateDiscount = async (code, amount) => {
	const coupon = await Coupon.findOne({ code })

	if (!coupon) {
		throw new Error('Unable to find this coupon code. Invalid coupon code!')
	}

	const numberOfUsers = await coupon.validateNumberOfUsers()

	if (numberOfUsers > coupon.limitOfUsers) {
		throw new Error('Registration for this coupon code is full !')
	}

	const isExpired = validateExpiryDate(coupon.expireAt)

	if (isExpired) {
		throw new Error('This Coupon is expired !')
	}

	const limitOfAmountInPaisa = coupon.limitOfAmount * 100

	let discountedAmount // the amount which will be subtracted from the original amount
	let newAmount // the amount which will be final

	discountedAmount = (amount / 100) * coupon.discountPercentage

	if (limitOfAmountInPaisa <= discountedAmount) {
		newAmount = amount - limitOfAmountInPaisa
	} else {
		newAmount = amount - discountedAmount
	}

	return {
		name: coupon.name,
		code: coupon.code,
		description: coupon.description,
		amount: newAmount
	}
}

couponSchema.post('save', function (error, doc, next) {
	if (error.name === 'MongoServerError' && error.code === 11000) {
		const keyPath = String(Object.keys(error?.keyPattern)[0])
		const keyPathCapitalize = wordCapitalize(keyPath)

		next(new Error(`${keyPathCapitalize} already exist !`))
	} else {
		next()
	}
})

const Coupon = mongoose.model('coupon', couponSchema)

export default Coupon
