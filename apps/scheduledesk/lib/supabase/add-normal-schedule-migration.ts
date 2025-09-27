import { supabase } from './client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runNormalScheduleMigration() {
  try {
    console.log('Running normal schedule events table migration...');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'add-normal-schedule-events-table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split SQL into individual statements and execute each one
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...');
      const { error } = await supabase.rpc('sql', { query: statement + ';' });

      if (error) {
        console.error('Statement failed:', statement.substring(0, 100));
        console.error('Error:', error);
        throw error;
      }
    }

    console.log('Normal schedule events table created successfully!');
    console.log('You can now use the normal schedule functionality.');

  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

export { runNormalScheduleMigration };

// Run the migration
runNormalScheduleMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });