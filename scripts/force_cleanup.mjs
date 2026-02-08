
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env.local');

// Simple dotenv parser
// (Omitting reuse for brevity, same setup)
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

        // 1. Get IDs of extra classes to delete
        const [rows] = await connection.execute('SELECT id FROM schedules WHERE is_extra = 1');
        const ids = rows.map(r => r.id);

        if (ids.length === 0) {
            console.log('No extra classes to delete.');
            return;
        }

        const idList = ids.join(',');
        console.log(`Found ${ids.length} extra classes to delete.`);

        // 2. Delete from child table version_schedules
        console.log('Deleting from version_schedules...');
        await connection.execute(`DELETE FROM version_schedules WHERE schedule_id IN (${idList})`);

        // 3. Delete from schedules
        console.log('Deleting from schedules...');
        await connection.execute(`DELETE FROM schedules WHERE id IN (${idList})`);

        console.log('Successfully purged extra classes.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

main();
