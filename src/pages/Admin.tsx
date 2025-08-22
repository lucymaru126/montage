import React from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

const AdminDashboard: React.FC = () => {
  // Example state and effect for fetching data
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const { data: fetchedData, error } = await supabase
        .from('your_table_name')
        .select('*');

      if (error) console.error(error);
      else setData(fetchedData);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;