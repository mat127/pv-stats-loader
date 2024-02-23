import { Pool } from 'pg'

if(!process.env.DB_URL) {
    throw new Error('DB_URL is not defined');
}

export const db = {

  pool: new Pool({
    connectionString: process.env.DB_URL
  }),
}
