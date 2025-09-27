'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function TestDBPage() {
  const [status, setStatus] = useState('Testing...');
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Check environment variables
        setEnvVars({
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
          key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
          urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
        });

        // Test simple query
        const { data, error } = await supabase
          .from('team_members')
          .select('id, first_name')
          .limit(1);

        if (error) {
          setStatus(`Database Error: ${error.message}`);
        } else {
          setStatus(`Database Connected! Found ${data?.length || 0} team members`);
        }
      } catch (err: any) {
        setStatus(`Connection Error: ${err.message}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Database Connection Test</h1>

      <h2>Environment Variables:</h2>
      <ul>
        <li>NEXT_PUBLIC_SUPABASE_URL: {envVars.url}</li>
        <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {envVars.key}</li>
        <li>URL Preview: {envVars.urlValue}</li>
      </ul>

      <h2>Connection Status:</h2>
      <p style={{
        color: status.includes('Connected') ? 'green' : 'red',
        fontWeight: 'bold'
      }}>
        {status}
      </p>

      <h2>Current Environment:</h2>
      <p>typeof window: {typeof window}</p>
      <p>User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'}</p>
    </div>
  );
}