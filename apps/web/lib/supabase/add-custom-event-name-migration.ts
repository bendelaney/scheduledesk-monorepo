/**
 * Migration script to add custom_event_name column to availability_events table
 * Run this script to add the missing column for Custom event types
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables should be loaded from your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addCustomEventNameColumn() {
  console.log('🔧 Adding custom_event_name column to availability_events table...');

  try {
    // First, let's check if the column already exists
    const { data: existingColumns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'availability_events')
      .eq('column_name', 'custom_event_name');

    if (checkError) {
      console.log('⚠️  Could not check existing columns (this is normal), proceeding with migration...');
    } else if (existingColumns && existingColumns.length > 0) {
      console.log('✅ Column custom_event_name already exists, no migration needed');
      return;
    }

    console.log('📝 Column does not exist, creating it...');

    // Since we can't easily run DDL through the client, let's provide instructions
    console.log(`
🔧 MANUAL MIGRATION REQUIRED:

Please run the following SQL in your Supabase SQL Editor:

ALTER TABLE availability_events
ADD COLUMN IF NOT EXISTS custom_event_name TEXT;

This will add the missing column needed for Custom event types.

Alternatively, you can run this in your terminal if you have psql connected:
psql "YOUR_DATABASE_CONNECTION_STRING" -c "ALTER TABLE availability_events ADD COLUMN IF NOT EXISTS custom_event_name TEXT;"
    `);

  } catch (error) {
    console.error('❌ Migration check failed:', error);
    console.log(`
🔧 MANUAL MIGRATION REQUIRED:

Please run the following SQL in your Supabase SQL Editor:

ALTER TABLE availability_events
ADD COLUMN IF NOT EXISTS custom_event_name TEXT;
    `);
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  addCustomEventNameColumn()
    .then(() => {
      console.log('🎉 Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

export { addCustomEventNameColumn };