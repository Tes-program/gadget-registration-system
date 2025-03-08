// src/pages/staff/StaffSettings.tsx
import { useState } from 'react';
import { StaffDashboardLayout } from '../components/layout/StaffDashboardLayout';
import { BellIcon, ShieldCheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const StaffSettings = () => {
  // Notification settings
  const [notifications, setNotifications] = useState({
    newDevices: true,
    deviceVerifications: true,
    lostDevices: true,
    systemUpdates: false
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
    sessionTimeout: 30
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleNotificationChange = (setting: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    toast.success(`${setting} notifications ${notifications[setting] ? 'disabled' : 'enabled'}`);
  };

  const handleSecurityChange = (setting: 'twoFactorAuth' | 'loginNotifications') => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    toast.success(`${setting} ${securitySettings[setting] ? 'disabled' : 'enabled'}`);
  };

  const handleTimeoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSecuritySettings(prev => ({
      ...prev,
      sessionTimeout: parseInt(e.target.value)
    }));
    
    toast.success(`Session timeout updated to ${e.target.value} minutes`);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    // In a real app, this would be an API call
    console.log('Changing password:', passwordForm);
    toast.success('Password changed successfully');
    
    // Reset form
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <StaffDashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account settings and preferences
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Notification Settings */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center">
              <BellIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Notification Settings</h2>
            </div>
            <div className="p-6 space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {key === 'newDevices' && 'Receive notifications when new devices are registered'}
                      {key === 'deviceVerifications' && 'Receive notifications when devices are verified'}
                      {key === 'lostDevices' && 'Receive notifications when devices are reported lost or stolen'}
                      {key === 'systemUpdates' && 'Receive notifications about system updates and maintenance'}
                    </p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={value}
                        onChange={() => handleNotificationChange(key as keyof typeof notifications)}
                      />
                      <div className={`block w-14 h-8 rounded-full ${value ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-in-out ${value ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Security Settings */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center">
              <ShieldCheckIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={securitySettings.twoFactorAuth}
                        onChange={() => handleSecurityChange('twoFactorAuth')}
                      />
                      <div className={`block w-14 h-8 rounded-full ${securitySettings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-in-out ${securitySettings.twoFactorAuth ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Login Notifications</h3>
                    <p className="text-sm text-gray-500">
                      Get notified when someone logs into your account
                    </p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={securitySettings.loginNotifications}
                        onChange={() => handleSecurityChange('loginNotifications')}
                      />
                      <div className={`block w-14 h-8 rounded-full ${securitySettings.loginNotifications ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-in-out ${securitySettings.loginNotifications ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Session Timeout</h3>
                    <p className="text-sm text-gray-500">
                      Automatically log out after a period of inactivity
                    </p>
                  </div>
                  <select
                    value={securitySettings.sessionTimeout}
                    onChange={handleTimeoutChange}
                    className="block w-28 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>
              
              {/* Change Password */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type={showPassword.current ? "text" : "password"}
                        name="currentPassword"
                        id="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        className="block w-full pr-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md sm:text-sm"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                      >
                        {showPassword.current ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type={showPassword.new ? "text" : "password"}
                        name="newPassword"
                        id="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        required
                        className="block w-full pr-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md sm:text-sm"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPassword.new ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        name="confirmPassword"
                        id="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        className="block w-full pr-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md sm:text-sm"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPassword.confirm ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffDashboardLayout>
  );
};