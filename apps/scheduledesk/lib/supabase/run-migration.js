/**
 * Simple migration script to add custom_event_name column
 * Run with: node lib/supabase/run-migration.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Service Key:', supabaseServiceKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addColumn() {
  console.log('🔧 Attempting to add custom_event_name column...');

  try {
    // Try to add the column using a function call
    const { data, error } = await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE availability_events ADD COLUMN IF NOT EXISTS custom_event_name TEXT;'
    });

    if (error) {
      console.log('⚠️  exec_sql not available, trying alternative approach...');

      // Alternative: try to insert a test record to see if column exists
      const { error: testError } = await supabase
        .from('availability_events')
        .select('custom_event_name')
        .limit(1);

      if (testError && testError.message.includes('custom_event_name')) {
        console.log('❌ Column does not exist and cannot be added programmatically');
        console.log(`
🔧 MANUAL MIGRATION REQUIRED:

Please run this SQL in your Supabase SQL Editor:

ALTER TABLE availability_events ADD COLUMN IF NOT EXISTS custom_event_name TEXT;
        `);
      } else {
        console.log('✅ Column appears to already exist');
      }
    } else {
      console.log('✅ Column added successfully');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log(`
🔧 MANUAL MIGRATION REQUIRED:

Please run this SQL in your Supabase SQL Editor:

ALTER TABLE availability_events ADD COLUMN IF NOT EXISTS custom_event_name TEXT;
    `);
  }
}

addColumn().then(() => process.exit(0));