/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/staff/Reports.tsx
import { useState, useEffect } from 'react';
import { StaffDashboardLayout } from '../components/layout/StaffDashboardLayout';
import { 
  ChartBarIcon, 
  ChartPieIcon, 
  ArrowTrendingUpIcon, 
  CalendarIcon 
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { useSupabase } from '../context/SupabaseContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

type TimeRange = 'week' | 'month' | 'year' | 'all';

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Custom tooltip for the line chart
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-blue-600">
          {`Registrations: ${payload[0].value}`}
        </p>
      </div>
    );
  }
  return null;
};

export const Reports = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [loading, setLoading] = useState(true);
  const { user } = useSupabase();
  
  // State for report data
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    verificationRate: 0,
    activeDevices: 0,
    reportedDevices: 0
  });
  
  const [registrationData, setRegistrationData] = useState<{ month: string; registrations: number }[]>([]);
  const [deviceTypeData, setDeviceTypeData] = useState<{ name: string; value: number }[]>([]);
  const [weekdayData, setWeekdayData] = useState<{ day: string; count: number }[]>([]);
  const [verificationStatusData, setVerificationStatusData] = useState<{ name: string; value: number }[]>([]);
  const [recentActivity, setRecentActivity] = useState<{
    id: string;
    action: string;
    device: string;
    student: string;
    timestamp: string;
  }[]>([]);

  // Fetch report data
  useEffect(() => {
    const fetchReportData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch all devices for counting
        const { data: allDevices, error: devicesError } = await supabase
          .from('devices')
          .select('*');
        
        if (devicesError) throw devicesError;
        
        const totalRegistrations = allDevices?.length || 0;
        
        // Count devices by status
        const pendingDevices = allDevices?.filter(d => d.status === 'pending') || [];
        const verifiedDevices = allDevices?.filter(d => d.status === 'verified') || [];
        const reportedDevices = allDevices?.filter(d => d.status === 'reported') || [];
        
        const pendingCount = pendingDevices.length;
        const verifiedCount = verifiedDevices.length;
        const reportedCount = reportedDevices.length;
        
        // Calculate verification rate and active devices
        const verificationRate = totalRegistrations > 0 
          ? Math.round((verifiedCount / totalRegistrations) * 100) 
          : 0;
        const activeDevices = verifiedCount + pendingCount;
        
        setStats({
          totalRegistrations,
          verificationRate,
          activeDevices,
          reportedDevices: reportedCount
        });
        
        // Process monthly data for chart
        const monthlyRegistrations = processMonthlyData(allDevices || []);
        setRegistrationData(monthlyRegistrations);
        
        // Process device type distribution
        const deviceTypes: { [key: string]: number } = {};
        
        allDevices?.forEach(device => {
          const type = device.type;
          deviceTypes[type] = (deviceTypes[type] || 0) + 1;
        });
        
        const processedTypeData = Object.keys(deviceTypes).map(type => ({
          name: type.charAt(0).toUpperCase() + type.slice(1),
          value: deviceTypes[type]
        }));
        
        setDeviceTypeData(processedTypeData);
        
        // Process weekday distribution
        const weekdayRegistrations = processWeekdayData(allDevices || []);
        setWeekdayData(weekdayRegistrations);
        
        // Verification status data
        setVerificationStatusData([
          { name: 'Verified', value: verifiedCount },
          { name: 'Pending', value: pendingCount },
          { name: 'Reported', value: reportedCount }
        ]);
        
        // Fetch recent activity (join with profiles to get user names)
        const { data: recentDevices, error: recentError } = await supabase
          .from('devices')
          .select(`
            id, 
            name, 
            created_at,
            status,
            verification_date,
            profiles:user_id (full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        
        if (recentError) throw recentError;
        
        // Process recent activity
        const recentActivities = (recentDevices || []).map(device => ({
          id: device.id,
          action: device.status === 'verified' ? 'Device Verification' : 'Device Registration',
          device: device.name,
          student: (device.profiles as any).full_name || 'Unknown',
          timestamp: device.verification_date || device.created_at
        }));
  
        
        setRecentActivity(recentActivities);
        
      } catch (error: any) {
        console.error('Error fetching report data:', error);
        toast.error('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [user, timeRange]);
  
  // Process monthly data for chart
  const processMonthlyData = (data: any[]) => {
    const months: { [key: string]: number } = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize all months with 0
    monthNames.forEach(month => {
      months[month] = 0;
    });
    
    // Count registrations per month
    data.forEach(item => {
      const date = new Date(item.created_at);
      const month = monthNames[date.getMonth()];
      months[month] += 1;
    });
    
    // Convert to array format for chart
    return Object.keys(months).map(month => ({
      month,
      registrations: months[month]
    }));
  };
  
  // Process weekday data for chart
  const processWeekdayData = (data: any[]) => {
    const days: { [key: string]: number } = {
      'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
    };
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Count registrations per day
    data.forEach(item => {
      const date = new Date(item.created_at);
      const day = dayNames[date.getDay()];
      days[day] += 1;
    });
    
    // Convert to array format for chart in correct order (Mon-Sun)
    const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return orderedDays.map(day => ({
      day,
      count: days[day]
    }));
  };


  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">
              Overview of device registrations and system metrics
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex space-x-2 bg-white rounded-lg shadow-sm border border-gray-200">
            {[
              { label: 'Week', value: 'week' },
              { label: 'Month', value: 'month' },
              { label: 'Year', value: 'year' },
              { label: 'All Time', value: 'all' },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value as TimeRange)}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  timeRange === range.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Registrations
                        </dt>
                        <dd>
                          <div className="text-lg font-semibold text-gray-900">
                            {stats.totalRegistrations}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartPieIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Verification Rate
                        </dt>
                        <dd>
                          <div className="text-lg font-semibold text-gray-900">
                            {stats.verificationRate}%
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ArrowTrendingUpIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Active Devices
                        </dt>
                        <dd>
                          <div className="text-lg font-semibold text-gray-900">
                            {stats.activeDevices}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CalendarIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Lost/Stolen Reports
                        </dt>
                        <dd>
                          <div className="text-lg font-semibold text-gray-900">
                            {stats.reportedDevices}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Registration Trends */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Registration Trends</h3>
                <p className="mt-1 text-sm text-gray-500">Device registrations over time</p>
                <div className="mt-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={registrationData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: '#6B7280' }}
                        tickLine={{ stroke: '#6B7280' }}
                      />
                      <YAxis
                        tick={{ fill: '#6B7280' }}
                        tickLine={{ stroke: '#6B7280' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="registrations"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Device Types Distribution */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Device Distribution</h3>
                <p className="mt-1 text-sm text-gray-500">Breakdown by device type</p>
                <div className="mt-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deviceTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`${value} devices`, 'Count']}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => (
                          <span className="text-sm text-gray-700">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Registration Pattern */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Weekly Pattern</h3>
                <p className="mt-1 text-sm text-gray-500">Registration frequency by day of week</p>
                <div className="mt-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekdayData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8">
                        {weekdayData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Verification Status */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Verification Status</h3>
                <p className="mt-1 text-sm text-gray-500">Current device verification status</p>
                <div className="mt-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={verificationStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {verificationStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                <p className="mt-1 text-sm text-gray-500">Latest system events and updates</p>
              </div>
              <div className="divide-y divide-gray-200">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-500">
                            {activity.device} - {activity.student}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-4 text-center text-gray-500">
                    No recent activity found
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </StaffDashboardLayout>
  );
};