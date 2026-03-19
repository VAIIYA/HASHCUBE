import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || 'libsql://hashcube-database-vercel-icfg-0vyxp162wkhvc2jdpllhcmmn.aws-us-east-1.turso.io';
const authToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzAzMjg2OTYsImlkIjoiNDBlODQ4ZTItZDkyNi00NGNmLWI2MzctMjFkNGUyODMzMWJkIiwicmlkIjoiZGJlNGQ0OTgtNDRmZi00MzZhLTgxN2QtMjRlZWU0NGQwY2NhIn0.tJGi7FpjzoNWqp72t39shiNaC0DV6QPj6SnPHnTr1kcNqnuRjPnrEPC9R6b6f4cTvMLAwxOT07QKN_nSDSjsAA';

export const turso = createClient({
    url,
    authToken,
});

export default turso;
