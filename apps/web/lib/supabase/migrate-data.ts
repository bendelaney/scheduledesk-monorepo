// Migration script to populate Supabase with existing data
// Run this with: npx tsx lib/supabase/migrate-data.ts

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import jobHighlightsData from '../../data/jobHighlightsData';
import teamMemberHighlightsData from '../../data/teamMemberHighlightsData';
import appSettings from '../../data/appSettings';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Extract raw data from your teamMembersData.ts file
// This is the jobberData constant from your file
const jobberData = {
  "data": {
    "users": {
      "edges": [
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY4Mzkz",
            "name": {
              "first": "Ben",
              "last": "Delaney",
              "full": "Ben Delaney"
            },
            "email": {
              "raw": "bendelaney@gmail.com"
            },
            "phone": {
              "friendly": "(509) 879-3344"
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY5NTE2",
            "name": {
              "first": "Isaiah",
              "last": "Crandall",
              "full": "Isaiah Crandall"
            },
            "email": {
              "raw": "isaiahcrandall@rocketmail.com"
            },
            "phone": {
              "friendly": "(509) 413-9809"
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY4Mzkx",
            "name": {
              "first": "Kelly",
              "last": "Chadwick",
              "full": "Kelly Chadwick"
            },
            "email": {
              "raw": "k@spiritpruners.com"
            },
            "phone": {
              "friendly": "(***) ***-3062"
            }
          }
        }
        // Add more users as needed - I'll include a few key ones for testing
      ]
    }
  }
};

// This is the nonJobberData from your file  
const nonJobberData = [
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY4Mzkz",
    "name": {
      "first": "Ben",
      "last": "Delaney",
      "full": "Ben Delaney"
    },
    "avatarUri": "/data/teamMemberAvatars/ben.png",
    "defaultHighlightId": "1"
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY5NTE2",
    "name": {
      "first": "Isaiah",
      "last": "Crandall",
      "full": "Isaiah Crandall"
    },
    "avatarUri": "/data/teamMemberAvatars/isaiah.png",
    "highlightId": "3"
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY4Mzkx",
    "name": {
      "first": "Kelly",
      "last": "Chadwick",
      "full": "Kelly Chadwick"
    },
    "avatarUri": "/data/teamMemberAvatars/kelly.png",
    "highlightId": "3"
  }
];

async function migrateJobberUsers() {
  console.log('🔄 Migrating Jobber users data...');
  
  try {
    const jobberUsers = jobberData.data.users.edges.map(edge => ({
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
  }
}

async function migrateTeamMembersData() {
  console.log('🔄 Migrating internal team members data...');
  
  try {
    const teamMembers = nonJobberData.map(member => ({
      first_name: member.name.first,
      last_name: member.name.last,
      display_name: member.name.full,
      avatar_uri: member.avatarUri,
      jobber_user_id: member.jobberId
    }));

    const { data, error } = await supabase
      .from('team_members')
      .insert(teamMembers);

    if (error) throw error;
    console.log(`✅ Migrated ${teamMembers.length} team members`);
    
  } catch (error: any) {
    console.error('❌ Team members migration failed:', error.message);
  }
}

async function migrateJobHighlights() {
  console.log('🔄 Migrating job highlights...');
  
  try {
    const { data, error } = await supabase
      .from('job_highlights')
      .insert(
        jobHighlightsData.map((highlight, index) => ({
          name: highlight.name,
          priority_order: index + 1
        }))
      );

    if (error) throw error;
    console.log('✅ Job highlights migrated successfully');
    
  } catch (error) {
    console.error('❌ Job highlights migration failed:', error);
  }
}

async function migrateTeamMemberHighlights() {
  console.log('🔄 Migrating team member highlights...');
  
  try {
    const { data, error } = await supabase
      .from('team_member_highlights')
      .insert(
        teamMemberHighlightsData.map(highlight => ({
          name: highlight.name,
          category: null
        }))
      );

    if (error) throw error;
    console.log('✅ Team member highlights migrated successfully');
    
  } catch (error) {
    console.error('❌ Team member highlights migration failed:', error);
  }
}

async function migrateAvailabilityEvents() {
  console.log('🔄 Migrating availability events...');
  
  try {
    // First, we need team member IDs from the database
    // For now, we'll skip this until team members are migrated
    console.log('⚠️  Availability events migration depends on team members being migrated first');
    
  } catch (error) {
    console.error('❌ Availability events migration failed:', error);
  }
}

async function migrateAppSettings() {
  console.log('🔄 Migrating app settings...');
  
  try {
    const settingsEntries = Object.entries(appSettings).map(([key, value]) => ({
      key,
      value: value as any,
      type: typeof value === 'object' ? 'object' : typeof value
    }));

    const { data, error } = await supabase
      .from('app_settings')
      .insert(settingsEntries);

    if (error) throw error;
    console.log('✅ App settings migrated successfully');
    
  } catch (error) {
    console.error('❌ App settings migration failed:', error);
  }
}

async function runAllMigrations() {
  console.log('🚀 Starting data migration to Supabase...\n');
  
  await migrateJobHighlights();
  await migrateTeamMemberHighlights();
  await migrateAppSettings();
  await migrateJobberUsers();
  await migrateTeamMembersData();
  // Skip availability events for now - needs team member IDs
  
  console.log('\n🎉 Migration complete!');
}

// Only run if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runAllMigrations();
}

export {
  migrateJobHighlights,
  migrateTeamMemberHighlights,
  migrateAppSettings,
  migrateJobberUsers,
  migrateTeamMembersData,
  runAllMigrations
};