import * as mysql from "mysql2/promise"

let connection: mysql.Connection | null = null

/**
 * getDb
 * - In normal operation returns a mysql2/promise Connection.
 * - When DEV_LOGIN=true (local dev without DB) returns a lightweight mock connection
 *   with an `execute` method that resolves to empty rows. This prevents the app
 *   from throwing ECONNREFUSED when you want to run UI flows without a DB.
 *
 * Note: the mock returns empty arrays for queries. If you need sample data,
 * add custom handling here (e.g. match SQL and return seeded rows).
 */
export async function getDb() {
  if (connection) {
    return connection
  }

  // Development mock: avoids connecting to MySQL when DEV_LOGIN is enabled.
  if (process.env.DEV_LOGIN === "true") {
    const mockConn = {
      // emulate execute(sql, params) -> Promise<[rows, fields]>
      execute: async (_sql: string, _params?: any[]) => {
        // Keep logs minimal but helpful for debugging
        // eslint-disable-next-line no-console
        console.debug("[dev-db] mock execute called", _sql)
        return [[], []]
      },
      // close connection
      end: async () => {
        return
      },
    } as unknown as mysql.Connection

    connection = mockConn
    return connection
  }

  connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })

  return connection
}

export async function closeDb() {
  if (connection) {
    try {
      // mock connection has end() but it may be a noop
      // @ts-ignore
      await connection.end()
    } catch (e) {
      // ignore
    }
    connection = null
  }
}
