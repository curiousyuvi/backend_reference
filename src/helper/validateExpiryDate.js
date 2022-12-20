import moment from "moment"

const validateExpiryDate = expiryDate => {
	const currentMoment = moment()
	const expireMoment = moment(expiryDate)

	const isExpired = expireMoment.isBefore(currentMoment)

	return isExpired
}

export default validateExpiryDate
