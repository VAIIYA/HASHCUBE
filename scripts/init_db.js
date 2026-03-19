const { createClient } = require('@libsql/client');

const url = 'libsql://hashcube-database-vercel-icfg-0vyxp162wkhvc2jdpllhcmmn.aws-us-east-1.turso.io';
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzAzMjg2OTYsImlkIjoiNDBlODQ4ZTItZDkyNi00NGNmLWI2MzctMjFkNGUyODMzMWJkIiwicmlkIjoiZGJlNGQ0OTgtNDRmZi00MzZhLTgxN2QtMjRlZWU0NGQwY2NhIn0.tJGi7FpjzoNWqp72t39shiNaC0DV6QPj6SnPHnTr1kcNqnuRjPnrEPC9R6b6f4cTvMLAwxOT07QKN_nSDSjsAA';

const client = createClient({
    url,
    authToken,
});

async function init() {
    console.log('Initializing Turso database...');

    try {
        await client.execute(`
      CREATE TABLE IF NOT EXISTS links (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('ipfs')),
          value TEXT NOT NULL,
          description TEXT,
          parentId TEXT,
          isOp INTEGER DEFAULT 1,
          repliesCount INTEGER DEFAULT 0,
          lastReplyAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parentId) REFERENCES links(id)
      );
    `);

        await client.execute(`CREATE INDEX IF NOT EXISTS idx_links_parentId ON links(parentId);`);
        await client.execute(`CREATE INDEX IF NOT EXISTS idx_links_lastReplyAt ON links(lastReplyAt DESC);`);
        await client.execute(`CREATE INDEX IF NOT EXISTS idx_links_isOp_lastReplyAt ON links(isOp, lastReplyAt DESC);`);

        console.log('Database initialized successfully.');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        process.exit(0);
    }
}

init();
