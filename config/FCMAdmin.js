import admin from "firebase-admin"
import fs from 'fs'
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = JSON.parse(fs.readFileSync(resolve(__dirname, '../adminsdk.json'), 'utf8'))

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export default admin