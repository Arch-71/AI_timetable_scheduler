
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

        console.log('Resetting is_extra=0 for old data (before 2026)...');
        // Using a safe cutoff. Adjust if needed.
        const [result] = await connection.execute("UPDATE schedules SET is_extra = 0 WHERE created_at < '2026-01-01'");
        console.log('Hidden old schedules count:', result.affectedRows);

        // Verify what remains as extra
        const [remaining] = await connection.execute("SELECT id, created_at, is_extra FROM schedules WHERE is_extra = 1");
        console.log('Remaining extra classes:', remaining);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

main();
