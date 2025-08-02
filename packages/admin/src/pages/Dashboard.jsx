import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Users, Briefcase, Pencil, ShoppingBag } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
    <div className={`p-3 rounded-full mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    portfolios: 0,
    blogs: 0,
    orders: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats
        const { count: userCount, error: userError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        
        const { count: portfolioCount, error: portfolioError } = await supabase
          .from('portfolios')
          .select('*', { count: 'exact', head: true });

        const { count: blogCount, error: blogError } = await supabase
          .from('blogs')
          .select('*', { count: 'exact', head: true });

        // Fetch chart data
        const { data: signupData, error: signupError } = await supabase.rpc('get_daily_user_signups', { days_limit: 7 });

        if (userError || portfolioError || blogError || signupError) {
            console.error({userError, portfolioError, blogError, signupError});
            throw new Error('Failed to fetch dashboard data.');
        }
        
        // Format chart data
        const formattedChartData = signupData.map(d => ({
            date: new Date(d.signup_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            Signups: d.count,
        }));


        setStats({
          users: userCount,
          portfolios: portfolioCount,
          blogs: blogCount,
          orders: 0,
        });

        setChartData(formattedChartData);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.users}
          icon={<Users className="text-blue-500" />}
          color="bg-blue-100 dark:bg-blue-900"
        />
        <StatCard 
          title="Portfolio Items" 
          value={stats.portfolios}
          icon={<Briefcase className="text-green-500" />}
          color="bg-green-100 dark:bg-green-900"
        />
        <StatCard 
          title="Blog Posts" 
          value={stats.blogs}
          icon={<Pencil className="text-yellow-500" />}
          color="bg-yellow-100 dark:bg-yellow-900"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.orders}
          icon={<ShoppingBag className="text-red-500" />}
          color="bg-red-100 dark:bg-red-900"
        />
      </div>

      {/* Chart Section */}
      <div className="mt-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Last 7 Days Signups</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Signups" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
