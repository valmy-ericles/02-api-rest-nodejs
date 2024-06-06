import { knex as setupKnex, Knex } from 'knex'
import { env } from './env'

export const config: Knex.Config = {
  client: 'pg',
  connection: 'postgres://ignite_nodejs_02_db_zscq_user:hfG68vWZ6Y2NANdrws3mF0Sew4eT0Vif@dpg-cpcsinm74orc73f507q0-a/ignite_nodejs_02_db_zscq',
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export const knex = setupKnex(config)
