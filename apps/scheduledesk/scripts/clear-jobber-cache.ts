/**
 * Clear Jobber users cache from Supabase
 * Run with: npx tsx scripts/clear-jobber-cache.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// ESM equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearJobberCache() {
  console.log('🧹 Clearing Jobber users cache...');

  const { error, count } = await supabase
    .from('jobber_users')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (neq with impossible ID)

  if (error) {
    console.error('❌ Error clearing cache:', error);
    process.exit(1);
  }

  console.log(`✅ Successfully cleared Jobber users cache`);
  console.log('💡 Next API call will fetch fresh data from Jobber and repopulate the cache');
}

clearJobberCache();
