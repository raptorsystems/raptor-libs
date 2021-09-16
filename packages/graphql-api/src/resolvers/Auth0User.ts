import { objectType } from 'nexus'

export const Auth0UserIdentityObjectType = objectType({
  name: 'UserIdentity',
  nonNullDefaults: { output: false },
  definition(t) {
    t.string('connection')
    t.string('user_id')
    t.string('provider')
    t.boolean('isSocial')
    // t.string('access_token')
  },
})

export const Auth0UserObjectType = objectType({
  name: 'User',
  nonNullDefaults: { output: false },
  definition(t) {
    t.string('email')
    t.boolean('email_verified')
    t.string('username')
    // t.string('phone_number')
    // t.boolean('phone_verified')
    t.string('user_id')
    t.string('created_at')
    t.string('updated_at')
    t.list.nonNull.field('identities', { type: 'UserIdentity' })
    // t.field('app_metadata', { type: 'AppMetadata' })
    // t.field('user_metadata', { type: 'UserMetadata' })
    t.string('picture')
    t.string('name')
    t.string('nickname')
    t.string('multifactor')
    t.string('last_ip')
    t.string('last_login')
    t.string('last_password_reset')
    t.int('logins_count')
    t.boolean('blocked')
    t.string('given_name')
    t.string('family_name')
  },
})
