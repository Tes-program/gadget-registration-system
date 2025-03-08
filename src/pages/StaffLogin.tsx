/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/auth/StaffLogin.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { StaffAuthLayout } from "../components/layout/StaffAuthLayout";
import { FormInput } from "../components/common/FormInput";
import { useSupabase } from "../context/SupabaseContext";
import toast from "react-hot-toast";

const staffLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type StaffLoginForm = z.infer<typeof staffLoginSchema>;

export const StaffLogin = () => {
  const { signIn } = useSupabase();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<StaffLoginForm>({
    resolver: zodResolver(staffLoginSchema),
  });

  const onSubmit = async (data: StaffLoginForm) => {
    try {
      // We use the same signIn function - the role check happens inside
      await signIn(data.email, data.password);
      // If user is not staff, they will be redirected to the student dashboard in SupabaseContext
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.message.includes("Invalid login credentials")) {
        setError("email", { 
          type: "manual", 
          message: "Invalid email or password" 
        });
        setError("password", { 
          type: "manual", 
          message: "Invalid email or password" 
        });
      } else if (error.message.includes("staff access")) {
        toast.error("This account doesn't have staff access");
      } else {
        toast.error(error.message || "Failed to sign in");
      }
    }
  };

  return (
    <StaffAuthLayout 
      title="Staff Login" 
      subtitle="Access the device verification system"
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-md space-y-4">
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            register={register}
            error={errors.email?.message}
            placeholder="Enter your staff email"
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            register={register}
            error={errors.password?.message}
            placeholder="Enter your password"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" onClick={() => toast("Password reset functionality to be implemented")} className="font-medium text-blue-600 hover:text-blue-500">
              Forgot password?
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </StaffAuthLayout>
  );
};