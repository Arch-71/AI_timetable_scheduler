
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
    console.log('Connecting...');
    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log('Connected.');

        // 1. Add section column
        console.log('Adding section column...');
        try {
            await connection.execute(`
        ALTER TABLE schedules 
        ADD COLUMN section VARCHAR(10) DEFAULT NULL
      `);
            console.log('Column "section" added.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Column "section" already exists.');
            } else {
                throw err;
            }
        }

        // 2. Delete all EXTRA classes to start fresh
        console.log('Deleting all extra classes to purge ghost data...');
        const [result] = await connection.execute('DELETE FROM schedules WHERE is_extra = 1');
        console.log(`Deleted ${result.affectedRows} extra classes. Clean slate.`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

main();
