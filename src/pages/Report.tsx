// src/pages/staff/Reports.tsx
import { useState } from 'react';
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

type TimeRange = 'week' | 'month' | 'year' | 'all';

// Mock data for the line chart
const registrationData = [
  { month: 'Jan', registrations: 65 },
  { month: 'Feb', registrations: 85 },
  { month: 'Mar', registrations: 120 },
  { month: 'Apr', registrations: 90 },
  { month: 'May', registrations: 110 },
  { month: 'Jun', registrations: 95 },
];

// Mock data for the pie chart
const deviceTypeData = [
  { name: 'Smartphones', value: 450 },
  { name: 'Laptops', value: 300 },
  { name: 'Tablets', value: 200 },
  { name: 'Others', value: 100 },
];

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

  // Mock statistics
  const stats = [
    {
      name: 'Total Registrations',
      value: '1,284',
      change: '+12.5%',
      timeframe: 'from last month',
      icon: ChartBarIcon,
    },
    {
      name: 'Verification Rate',
      value: '94.2%',
      change: '+4.3%',
      timeframe: 'from last month',
      icon: ChartPieIcon,
    },
    {
      name: 'Active Devices',
      value: '1,156',
      change: '+8.2%',
      timeframe: 'from last month',
      icon: ArrowTrendingUpIcon,
    },
    {
      name: 'Lost/Stolen Reports',
      value: '23',
      change: '-2.4%',
      timeframe: 'from last month',
      icon: CalendarIcon,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Device Registration',
      device: 'iPhone 13',
      student: 'John Doe',
      timestamp: '2024-02-20T10:30:00',
    },
    // Add more activities as needed
  ];

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

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd>
                        <div className="text-lg font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div className="flex items-baseline text-sm">
                          <span className={`${
                            stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stat.change}
                          </span>
                          <span className="ml-2 text-gray-500">
                            {stat.timeframe}
                          </span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
            <div className="mt-6 h-84">
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
            <div className="mt-6 h-84">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { day: 'Mon', count: 20 },
                    { day: 'Tue', count: 25 },
                    { day: 'Wed', count: 30 },
                    { day: 'Thu', count: 22 },
                    { day: 'Fri', count: 18 },
                    { day: 'Sat', count: 10 },
                    { day: 'Sun', count: 5 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8">
                    {deviceTypeData.map((entry, index) => (
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
            <div className="mt-6 h-84">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Verified', value: 850 },
                      { name: 'Pending', value: 120 },
                      { name: 'Rejected', value: 30 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {deviceTypeData.map((entry, index) => (
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
            {recentActivity.map((activity) => (
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
            ))}
          </div>
        </div>
      </div>
    </StaffDashboardLayout>
  );
};