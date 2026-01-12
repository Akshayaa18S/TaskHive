require('dotenv').config();
const { Pool } = require('pg');

const initializeDatabase = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Creating database tables...');
    console.log('Connection string:', process.env.DATABASE_URL.split('@')[0] + '@...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Group" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        "createdBy" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add createdBy column if it doesn't exist (migration for existing databases)
    await pool.query(`
      ALTER TABLE "Group" 
      ADD COLUMN IF NOT EXISTS "createdBy" UUID REFERENCES "User"(id) ON DELETE CASCADE;
    `);


    await pool.query(`
      CREATE TABLE IF NOT EXISTS "GroupMember" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        "groupId" UUID NOT NULL REFERENCES "Group"(id) ON DELETE CASCADE,
        UNIQUE("userId", "groupId")
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Task" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'PENDING',
        "groupId" UUID NOT NULL REFERENCES "Group"(id) ON DELETE CASCADE,
        "assignedTo" UUID REFERENCES "User"(id) ON DELETE SET NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✓ Database tables created successfully');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating tables:', error.message);
    await pool.end();
    process.exit(1);
  }
};

initializeDatabase();
