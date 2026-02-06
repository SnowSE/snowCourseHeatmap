import Database from 'better-sqlite3'

let dbInstance: Database.Database | null = null

export const getDatabase = () => {
  if (!dbInstance) {
    dbInstance = new Database('app.db')
    initializeSchema(dbInstance)
  }
  return dbInstance
}

const initializeSchema = (db: Database.Database) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS terms (
      term_code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS courses (
      term_code TEXT NOT NULL,
      course_data JSONB NOT NULL,
      FOREIGN KEY (term_code) REFERENCES terms(term_code)
    );
  `)
}

export const closeDatabase = () => {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

export const withDatabase = <T>(operation: (db: Database.Database) => T): T => {
  const db = getDatabase()
  try {
    return operation(db)
  } catch (error) {
    throw error
  }
}
