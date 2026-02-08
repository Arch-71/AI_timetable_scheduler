import { getDb } from "@/lib/db"
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST() {
  try {
    const db = await getDb()
    
    // Read the migration script
    const migrationPath = path.join(process.cwd(), 'scripts', '03-update-course-fields.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim())
    
    // Execute each statement
    const results = []
    for (const statement of statements) {
      try {
        await db.execute(statement)
        results.push({ statement: statement.substring(0, 50) + '...', status: 'success' })
      } catch (error: any) {
        // Ignore "duplicate column" errors since we're using IF NOT EXISTS
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_BAD_FIELD_ERROR') {
          results.push({ statement: statement.substring(0, 50) + '...', status: 'skipped', reason: 'Column already exists' })
        } else {
          results.push({ statement: statement.substring(0, 50) + '...', status: 'error', error: error.message })
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      results
    })
    
  } catch (error: any) {
    console.error('Migration failed:', error)
    return NextResponse.json(
      { 
        error: 'Migration failed', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}
