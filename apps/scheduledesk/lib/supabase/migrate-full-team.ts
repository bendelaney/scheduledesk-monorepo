// Full team migration script - extracts data dynamically from teamMembersData.ts
// Run this with: npx tsx lib/supabase/migrate-full-team.ts

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Import the actual data from the file - this will get the current live data
async function importTeamMembersData() {
  try {
    // Dynamic import to get the actual current data
    const { default: TeamMembersData } = await import('../../data/teamMembersData');
    
    // We also need to import the raw data - let's read the file directly
    const fs = await import('fs');
    const path = await import('path');
    
    const filePath = path.join(process.cwd(), 'data', 'teamMembersData.ts');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Extract jobberData and nonJobberData from the file
    // This is a bit hacky but works for now
    const jobberDataMatch = fileContent.match(/const jobberData = ({[\s\S]*?});/);
    const nonJobberDataMatch = fileContent.match(/let nonJobberData = (\[[\s\S]*?\]);/);
    
    if (!jobberDataMatch || !nonJobberDataMatch) {
      throw new Error('Could not extract jobberData or nonJobberData from file');
    }
    
    // Parse the extracted data
    const jobberData = eval('(' + jobberDataMatch[1] + ')');
    const nonJobberData = eval('(' + nonJobberDataMatch[1] + ')');
    
    return { jobberData, nonJobberData, TeamMembersData };
  } catch (error) {
    console.error('Error importing team members data:', error);
    throw error;
  }
}

async function clearExistingData() {
  console.log('🧹 Clearing existing team member data...');
  
  try {
    // Delete in correct order to avoid foreign key constraints
    await supabase.from('team_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('jobber_users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('✅ Existing data cleared');
  } catch (error: any) {
    console.error('❌ Error clearing data:', error.message);
    throw error;
  }
}

async function migrateJobberUsers(jobberData: any) {
  console.log('🔄 Migrating Jobber users data...');
  
  try {
    const jobberUsers = jobberData.data.users.edges.map((edge: any) => ({
      jobber_id: edge.node.id,
      name: edge.node.name,
      email: edge.node.email?.raw || null
    }));

    const { data, error } = await supabase
      .from('jobber_users')
      .insert(jobberUsers);

    if (error) throw error;
    console.log(`✅ Migrated ${jobberUsers.length} Jobber users`);
    
  } catch (error: any) {
    console.error('❌ Jobber users migration failed:', error.message);
    throw error;
  }
}

async function migrateTeamMembers(nonJobberData: any) {
  console.log('🔄 Migrating internal team members data...');
  
  try {
    const teamMembers = nonJobberData.map((member: any) => ({
      first_name: member.name.first,
      last_name: member.name.last,
      display_name: member.name.full,
      avatar_uri: member.avatarUri || null,
      jobber_user_id: member.jobberId
    }));

    const { data, error } = await supabase
      .from('team_members')
      .insert(teamMembers);

    if (error) throw error;
    console.log(`✅ Migrated ${teamMembers.length} internal team members`);
    
  } catch (error: any) {
    console.error('❌ Team members migration failed:', error.message);
    throw error;
  }
}

async function verifyMigration() {
  console.log('🔍 Verifying migration results...');
  
  try {
    const { count: jobberCount } = await supabase
      .from('jobber_users')
      .select('*', { count: 'exact', head: true });
      
    const { count: teamCount } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true });
      
    console.log(`📊 Results:`);
    console.log(`   - Jobber users: ${jobberCount}`);
    console.log(`   - Team members: ${teamCount}`);
    
    // Test the merge function
    const { data: merged } = await supabase.rpc('get_merged_team_members');
    console.log(`   - Successfully merged: ${merged?.length || 'N/A'} team members`);
    
  } catch (error: any) {
    console.error('⚠️ Verification error:', error.message);
  }
}

async function runFullMigration() {
  console.log('🚀 Starting full team migration...\n');
  
  try {
    // Import current data from the file
    const { jobberData, nonJobberData } = await importTeamMembersData();
    
    console.log(`📊 Found ${jobberData.data.users.edges.length} Jobber users`);
    console.log(`📊 Found ${nonJobberData.length} internal team member records\n`);
    
    // Clear existing data
    await clearExistingData();
    
    // Migrate fresh data
    await migrateJobberUsers(jobberData);
    await migrateTeamMembers(nonJobberData);
    
    // Verify results
    await verifyMigration();
    
    console.log('\n🎉 Full team migration complete!');
    
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runFullMigration();
}

export { runFullMigration };