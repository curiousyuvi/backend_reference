import FastifyAuth from '@fastify/auth'
import User from '../models/user.js'
import fp from 'fastify-plugin'

export default fp(async (fastify, opts) => {
  fastify.decorate('verifyUserToken', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', '*')
    reply.header(
      'Access-Control-Allow-Headers',
      'authorization, Origin, X-Requested-With, Content-Type, Accept'
    )
    try {
      if (!request.headers.authorization) {
        throw new Error('No token was sent')
      }

      const token = request.headers.authorization.replace('Bearer ', '')
      const user = await User.findByToken(token)

      if (!user) {
        throw new Error('Authentication failed login again !')
      }

      request.user = user
      request.token = token
    } catch (error) {
      reply.code(401).send(error)
    }
  })

  fastify.decorate('verifyUserCredentials', async (request, reply) => {
    try {
      if (!request.body) {
        throw new Error('email and Password is required!')
      }

      const user = await User.findByCredentials(
        request.body.email,
        request.body.password
      )

      request.user = user
    } catch (error) {
      reply.code(400).send(error)
    }
  })

  fastify.register(FastifyAuth)
})
