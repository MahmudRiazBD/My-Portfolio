import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Mail, Briefcase, Pencil, Users, Settings, UserCircle, Image, GraduationCap, User } from 'lucide-react';

const sidebarNavItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Inbox', href: '/admin/inbox', icon: Mail },
  { name: 'Media', href: '/admin/media', icon: Image },
  { name: 'Portfolio', href: '/admin/portfolio', icon: Briefcase },
  { name: 'Blog', href: '/admin/blog', icon: Pencil },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Education', href: '/admin/education', icon: GraduationCap },
  { name: 'Experience', href: '/admin/experience', icon: Briefcase },
  { name: 'My Account', href: '/admin/my-account', icon: User },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-center border-b dark:border-gray-700">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Admin</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {sidebarNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t dark:border-gray-700">
             <NavLink to="/admin/profile" className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                <UserCircle className="w-5 h-5 mr-3" />
                My Profile
             </NavLink>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-6">
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <div>{/* Header content like search bar or user menu can go here */}</div>
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet /> {/* Child routes will render here */}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
