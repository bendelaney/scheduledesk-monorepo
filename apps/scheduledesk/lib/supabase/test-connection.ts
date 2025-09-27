// Test script to verify Supabase connection
// Run this with: npx tsx lib/supabase/test-connection.ts

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure .env.local contains:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseAnonKey.substring(0, 20) + '...');
    
    // Test basic connection first - just ping the API
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Auth connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Basic Supabase connection successful!');
    
    // Test database connection with better error handling
    console.log('Testing database tables...');
    
    const { data: teamMembers, error: dbError } = await supabase
      .from('team_members')
      .select('id, first_name')
      .limit(5);
      
    if (dbError) {
      console.error('❌ Database query failed:', dbError.message);
      console.error('   Details:', dbError.details);
      console.error('   Hint:', dbError.hint);
      return false;
    } else {
      console.log('✅ Database connection successful!');
      console.log(`   Found ${teamMembers?.length || 0} team members in database`);
      if (teamMembers && teamMembers.length > 0) {
        console.log('   Sample:', teamMembers[0]);
      }
    }
    
    return true;
    
  } catch (err: any) {
    console.error('❌ Connection test failed:');
    console.error('   Error:', err.message);
    if (err.cause) {
      console.error('   Cause:', err.cause.message);
    }
    return false;
  }
}

// Only run if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  testConnection();
}

export { testConnection };