// src/components/layout/StaffAuthLayout.tsx
import { ReactNode } from 'react';

interface StaffAuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const StaffAuthLayout = ({ children, title, subtitle }: StaffAuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-200">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-800 border-b pb-4">
            Staff Portal
          </h2>
          <h3 className="mt-6 text-center text-2xl font-semibold text-gray-900">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-2 text-center text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};