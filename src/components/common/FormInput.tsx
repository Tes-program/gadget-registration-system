// src/components/common/FormInput.tsx
import { UseFormRegister, RegisterOptions, Path } from 'react-hook-form';

interface FormInputProps<T extends Record<string, unknown>> {
  label: string;
  name: Path<T>;
  type?: 'text' | 'email' | 'password' | 'tel' | 'date' | 'number' | 'time';
  register: UseFormRegister<T>;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  registerOptions?: RegisterOptions<T, Path<T>>;
  autoComplete?: string;
  defaultValue?: string;
  readOnly?: boolean;
  helperText?: string;
}

export const FormInput = <T extends Record<string, unknown>>({ 
  label, 
  name, 
  type = 'text', 
  register, 
  error,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  registerOptions = {},
  autoComplete,
  defaultValue,
  readOnly = false,
  helperText
}: FormInputProps<T>) => {
  return (
    <div className="space-y-1">
      <label 
        htmlFor={name.toString()} 
        className={`block text-sm font-medium ${disabled ? 'text-gray-500' : 'text-gray-700'}`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        {...register(name, registerOptions)}
        type={type}
        id={name.toString()}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        readOnly={readOnly}
        className={`
          appearance-none relative block w-full px-3 py-2 border 
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-900'}
          ${readOnly ? 'cursor-not-allowed' : ''}
          placeholder-gray-500 rounded-md 
          focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
          disabled:cursor-not-allowed
          sm:text-sm
          ${className}
        `}
      />
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};