import S from 'fluent-json-schema'

export const safeUser = S.object()
  .id('#safeUser')
  .prop('_id', S.string())
  .prop('username', S.string())
  .prop('email', S.string())
  .prop('isEmailVerified', S.boolean())
  .prop('isEnrolledInTournament', S.boolean())
