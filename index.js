import crypto from 'crypto';
import fs from 'fs';

const TEMPL = fs.readFileSync('gen.md.template').toString();

let GEN = TEMPL;

const SEED = fs.readFileSync('seed.secret').toString().trim();
const STUDENTS = fs.readFileSync('students.secret')
    .toString()
    .trim()
    .split(/\r?\n/g)
    .map(t => t.trim());

const STUDENTS_PROCESSED = STUDENTS.map(stud => {
    const email = stud.toUpperCase();
    const username = email.split("@")[0];
    const db_name = `cs272_wp_${username}`
    const password = crypto.createHmac("SHA256", SEED).update(username).digest("hex").substring(0, 16);
    return { email, username, db_name, password }
})

console.log(JSON.stringify(STUDENTS_PROCESSED, null, 2))

GEN = GEN.replace("{MYSQL_STUDENT_DB_CREATION}", STUDENTS_PROCESSED.map(stud => `
CREATE DATABASE \`${stud.db_name}\`;
CREATE USER '${stud.username}'@'localhost' IDENTIFIED BY '${stud.password}';
GRANT ALL PRIVILEGES ON \`${stud.db_name}\`.* TO '${stud.username}'@'localhost';
`.trim()).join("\n\n"));

fs.writeFileSync("gen.md.secret", GEN)