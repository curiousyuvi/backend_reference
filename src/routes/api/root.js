export default async function (fastify, opts) {
	fastify.get('/', async function (request, reply) {
		return { root: true, message: 'Welcome to Kurukshetra backend api system' }
	})
}
