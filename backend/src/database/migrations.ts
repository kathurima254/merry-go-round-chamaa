import { pool } from './connection';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    logger.info('Running database migrations...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    
    // Split and execute individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      await client.query(statement);
    }
    
    logger.info('✓ Database migrations completed');
  } catch (error) {
    logger.error('Migration error:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  runMigrations().catch(err => {
    logger.error('Fatal migration error:', err);
    process.exit(1);
  });
}
