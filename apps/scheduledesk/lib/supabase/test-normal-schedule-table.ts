import { supabase } from './client';

async function testNormalScheduleTable() {
  try {
    console.log('Testing normal_schedule_events table...');

    // Try to query the table
    const { data, error } = await supabase
      .from('normal_schedule_events')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Table does not exist or there is a permission issue:', error);
      console.log('Please run the SQL migration in your Supabase SQL Editor.');
      return false;
    }

    console.log('✅ normal_schedule_events table exists and is accessible');
    console.log('Current records:', data?.length || 0);
    return true;

  } catch (error) {
    console.error('Connection error:', error);
    return false;
  }
}

export { testNormalScheduleTable };

// Run test if called directly
testNormalScheduleTable();