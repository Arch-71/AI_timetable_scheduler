
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env.local');

// Simple dotenv parser
function loadEnv() {
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const env = {};
        content.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim();
                env[key] = value;
            }
        });
        return env;
    }
    return {};
}

const env = loadEnv();

const config = {
    host: env.DB_HOST || 'localhost',
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '',
    database: env.DB_NAME || 'ai_timetable',
};

async function main() {
    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log('Connected.');

        // Get 30 most recent schedules
        const [rows] = await connection.execute(`
      SELECT s.id, s.is_extra, c.name as course, f.name as faculty, s.created_at 
      FROM schedules s
      JOIN courses c ON s.course_id = c.id
      JOIN faculties f ON s.faculty_id = f.id
      ORDER BY s.id DESC 
      LIMIT 30
    `);

        console.log('Recent schedules:');
        rows.forEach(r => {
            console.log(`[${r.id}] ${r.course} (${r.faculty}) - Extra: ${r.is_extra} - ${r.created_at}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

main();
