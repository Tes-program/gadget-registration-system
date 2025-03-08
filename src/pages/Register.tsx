/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/auth/Register.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { FormInput } from "../components/common/FormInput";
import { useSupabase } from "../context/SupabaseContext";
import toast from "react-hot-toast";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    matricNumber: z.string().min(7, "Valid matric number is required"),
    phoneNumber: z.string().min(10, "Valid phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export const Register = () => {
  const { signUp } = useSupabase();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await signUp(data.email, data.password, {
        full_name: data.name,
        matric_number: data.matricNumber,
        phone_number: data.phoneNumber,
        role: 'student'
      });
      
      toast.success("Account created successfully! Please check your email to verify your account.");
      reset();
      navigate('/student/login');
    } catch (error: any) {
      console.error("Registration error:", error);
      
      if (error.message.includes("email")) {
        setError("email", { 
          type: "manual", 
          message: "This email is already registered or invalid" 
        });
      } else {
        toast.error(error.message || "Failed to create account");
      }
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Get started with your gadget registration"
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-md space-y-4">
          <FormInput
            label="Full Name"
            name="name"
            register={register}
            error={errors.name?.message}
            placeholder="Enter your full name"
            required
          />
          <FormInput
            label="Matric Number"
            name="matricNumber"
            register={register}
            error={errors.matricNumber?.message}
            placeholder="Enter your matric number"
            required
          />
          <FormInput
            label="Phone Number"
            name="phoneNumber"
            register={register}
            error={errors.phoneNumber?.message}
            placeholder="Enter your phone number"
            required
          />
          <FormInput
            label="Email address"
            name="email"
            type="email"
            register={register}
            error={errors.email?.message}
            placeholder="Enter your email"
            required
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            register={register}
            error={errors.password?.message}
            placeholder="Create a password"
            required
          />
          <FormInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            register={register}
            error={errors.confirmPassword?.message}
            placeholder="Confirm your password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>

        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/student/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};