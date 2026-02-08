
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

        // Check what we are about to delete
        const [rows] = await connection.execute("SELECT id, is_extra FROM schedules WHERE is_extra = 1");
        console.log(`Found ${rows.length} extra classes hanging around.`);

        if (rows.length > 0) {
            const ids = rows.map(r => r.id).join(',');

            console.log('Removing dependencies from version_schedules...');
            await connection.execute(`DELETE FROM version_schedules WHERE schedule_id IN (${ids})`);

            console.log('Deleting from schedules...');
            await connection.execute(`DELETE FROM schedules WHERE id IN (${ids})`);

            console.log('Deleted all extra classes.');
        } else {
            console.log("No extra classes found to delete");
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

main();
