import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { PlusCircle, Edit, Trash2, FolderKanban } from 'lucide-react';

const PortfolioList = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('portfolios')
          .select('id, title, status, category_id') // Fetching basic info for the list
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPortfolios(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const { error } = await supabase.from('portfolios').delete().match({ id });
        if (error) throw error;
        setPortfolios(portfolios.filter(p => p.id !== id));
      } catch (err) {
        alert('Error deleting portfolio item: ' + err.message);
      }
    }
  };

  if (loading) return <div>Loading portfolios...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <div className="flex gap-4">
            <Link
              to="/admin/portfolio/categories"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700"
            >
              <FolderKanban className="w-5 h-5 mr-2" />
              Manage Categories
            </Link>
            <Link
              to="/admin/portfolio/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Add New
            </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {portfolios.length > 0 ? portfolios.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">{item.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/admin/portfolio/edit/${item.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    <Edit className="w-5 h-5 inline" />
                  </Link>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-5 h-5 inline" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center">No portfolio items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioList;
