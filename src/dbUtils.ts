import Database from 'better-sqlite3'

let dbInstance: Database.Database | null = null

export const getDatabase = () => {
  if (!dbInstance) {
    const dbPath = process.env.DATABASE_PATH || 'storage/app.db'
    dbInstance = new Database(dbPath)
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

    CREATE TABLE IF NOT EXISTS student_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS student_classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      schedule_id INTEGER NOT NULL,
      department TEXT NOT NULL,
      course_name TEXT NOT NULL,
      FOREIGN KEY (schedule_id) REFERENCES student_schedules(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS course_change_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS course_changes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      crn TEXT NOT NULL,
      term TEXT NOT NULL,
      target_professor TEXT NOT NULL,
      meet_info TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (group_id) REFERENCES course_change_groups(id) ON DELETE CASCADE
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
