// src/components/layout/StaffDashboardLayout.tsx
import { Fragment, ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import {
  HomeIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
  UserGroupIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { useSupabase } from "../../context/SupabaseContext";

interface StaffDashboardLayoutProps {
  children: ReactNode;
}

export const StaffDashboardLayout = ({
  children,
}: StaffDashboardLayoutProps) => {
  const location = useLocation();
  // const navigate = useNavigate();
  const { user, profile, signOut } = useSupabase();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/staff/dashboard", icon: HomeIcon },
    {
      name: "All Devices",
      href: "/staff/devices",
      icon: DevicePhoneMobileIcon,
    },
    // { name: 'Verify Devices', href: '/staff/verify', icon: ClipboardDocumentCheckIcon },
    { name: "Reports & Analytics", href: "/staff/reports", icon: ChartBarIcon },
    {
      name: "Student Management",
      href: "/staff/students",
      icon: UserGroupIcon,
    },
  ];

  const NavigationContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200 bg-blue-700">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-white">gadgify</span>
          <span className="ml-2 px-2 py-1 text-xs font-semibold bg-blue-800 text-white rounded-md">
            Staff Portal
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-3 py-4 space-y-1 bg-gradient-to-b from-blue-50 to-white">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-blue-600"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );

  const ProfileDropdown = () => (
    <Menu as="div" className="relative">
      <div className="flex items-center">
        {/* Notifications */}
        <button className="p-2 text-gray-500 hover:text-gray-700 relative">
          <BellIcon className="h-6 w-6" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-400" />
        </button>

        {/* Profile Menu */}
        <Menu.Button className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 ml-2">
          <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "?"}
            </span>
          </div>
          <span className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium text-gray-900">
              {profile?.full_name || "Staff"}
            </span>
            <span className="text-xs text-gray-500">{profile?.role || ""}</span>
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
          <Menu.Items className="absolute right-0 mt-12 w-48 origin-top-right rounded-lg bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/staff/profile"
                  className={`${
                    active ? "bg-gray-50" : ""
                  } block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50`}
                >
                  Your Profile
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/staff/settings"
                  className={`${
                    active ? "bg-gray-50" : ""
                  } block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50`}
                >
                  Settings
                </Link>
              )}
            </Menu.Item>
            <div className="border-t border-gray-100 my-1" />
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => signOut()}
                  className={`${
                    active ? "bg-gray-50" : ""
                  } block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50`}
                >
                  Sign out
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </div>
    </Menu>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar panel */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-white transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <NavigationContent />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-72 lg:block lg:bg-white lg:shadow-lg">
        <div className="flex flex-col h-full">
          <NavigationContent />
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
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

              {/* Search bar could go here */}
              <div className="flex-1 px-4" />

              {/* Profile Dropdown */}
              <div className="ml-auto">
                <ProfileDropdown />
              </div>
            </div>
          </div>
        </div>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};
