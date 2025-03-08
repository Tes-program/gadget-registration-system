// src/components/layout/DashboardLayout.tsx
import { Fragment, ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { 
  HomeIcon, 
  DevicePhoneMobileIcon,
  PlusCircleIcon,
  ExclamationTriangleIcon,
  Bars3Icon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { useSupabase } from '../../context/SupabaseContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  // const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, signOut } = useSupabase();

  const navigation = [
    { name: 'Dashboard', href: '/student/dashboard', icon: HomeIcon },
    { name: 'My Devices', href: '/student/dashboard/devices', icon: DevicePhoneMobileIcon },
    { name: 'Register Device', href: '/student/dashboard/register-device', icon: PlusCircleIcon },
    { name: 'Report Lost Device', href: '/student/dashboard/report-lost', icon: ExclamationTriangleIcon },
  ];

  const NavigationContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-indigo-600">Gadify</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </>
  );

  const ProfileDropdown = () => (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center space-x-3 hover:opacity-80">
        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
          <span className="text-sm font-medium text-white">
            {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
          </span>
        </div>
        <span className="hidden md:flex flex-col items-start">
          <span className="text-sm font-medium text-gray-700">
            {profile?.full_name || 'User'}
          </span>
          <span className="text-xs text-gray-500">
            {profile?.matric_number || user?.email || ''}
          </span>
        </span>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/student/profile"
                className={`${
                  active ? 'bg-gray-100' : ''
                } block px-4 py-2 text-sm text-gray-700`}
              >
                Your Profile
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={signOut}
                className={`${
                  active ? 'bg-gray-100' : ''
                } block w-full text-left px-4 py-2 text-sm text-gray-700`}
              >
                Sign out
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar panel */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <NavigationContent />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-64 lg:block lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex flex-col h-full">
          <NavigationContent />
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="ml-auto">
                <ProfileDropdown />
              </div>
            </div>
          </div>
        </div>

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};