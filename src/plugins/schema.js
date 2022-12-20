import S from 'fluent-json-schema'
import fp from 'fastify-plugin'
import { safeUser } from '../schema/user.js'

export default fp(async (fastify) => {
  const commonSchemas = S.object()
    .id('global')
    .definition('safeUser', safeUser)

  fastify.addSchema(commonSchemas)
})
