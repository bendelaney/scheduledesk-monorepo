export default function Home() {
  return (
    <div>
      <h1>ScheduleDesk</h1>
      <p>Welcome to ScheduleDesk - your scheduling and team management platform.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>AppFrame Components</h2>
        <ul>
          <li>✅ TopBar with sidebar toggle</li>
          <li>✅ Collapsible Sidebar</li>
          <li>✅ Schedule List with sample data</li>
          <li>✅ Popover system for menus</li>
          <li>✅ Icon library (36+ icons)</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Test the features:</h3>
        <ul>
          <li>Click the sidebar toggle in the top bar</li>
          <li>Try the schedule menu buttons (shows alerts)</li>
          <li>Click "New Schedule" and "Sync with Jobber"</li>
        </ul>
      </div>
    </div>
  );
}