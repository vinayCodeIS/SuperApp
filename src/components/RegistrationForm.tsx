import React, { useState } from "react";
import { motion } from "motion/react";
import { User } from "../types";



interface RegistrationFormProps {
  onRegister: (user: User) => void;
  initialUser: User | null;
}

export default function RegistrationForm({ onRegister, initialUser }: RegistrationFormProps) {
  const [formData, setFormData] = useState<User>({
    name: initialUser?.name || "",
    username: initialUser?.username || "",
    email: initialUser?.email || "",
    mobile: initialUser?.mobile || "",
  });

  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Field is required";
    }
    if (!formData.username.trim()) {
      newErrors.username = "Field is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Field is required";
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Field is required";
    }
    if (!agreed) {
      newErrors.agreed = "Check this box if you want to proceed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onRegister(formData);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col md:flex-row font-sans selection:bg-[#72DB73] selection:text-black" id="registration-screen">
      {/* Left Column (Cinematic Image Banner) */}
      <div className="md:w-[48%] relative flex flex-col justify-end p-8 md:p-16 overflow-hidden min-h-[350px] md:min-h-screen select-none">
        {/* Dark linear/radial gradient overlay to keep readable text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
        
        {/* Background Image of Live Concert / DJ Mixer Console */}
        <img 
          src="src/assets/3bdbec6f74b004fdcf87b04992ba3c2faf4d5bf9.png" 
          alt="Concert DJ Mixer" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          referrerPolicy="no-referrer"
        />

        {/* Banner Title at Bottom */}
        <div className="relative z-20 max-w-lg">
          <h1 className="text-3xl md:text-[50px] font-black tracking-tight leading-tight text-white roboto-font">
            Discover new things on Superapp
          </h1>
        </div>
      </div>

      {/* Right Column (Registration Form) */}
      <div className="md:w-[52%] bg-black flex flex-col justify-center items-center px-6 py-12 md:p-16">
        <div className="w-full max-w-[400px] text-center md:text-left space-y-7">
          {/* Header section */}
          <div className="space-y-2 text-center">
            <h1 className="text-[48px] logo-font text-[#72DB73] font-normal leading-none tracking-normal">
              Super app
            </h1>
            <p className="text-white font-normal text-sm md:text-[15px] tracking-wide roboto-font">
              Create your new account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
            {/* Name Field */}
            <div className="space-y-1">
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className={`w-full bg-[#1E1E1E] text-white rounded-md py-3 px-4 text-[14px] roboto-font placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#72DB73] transition duration-150 border ${
                  errors.name ? "border-red-600 focus:ring-red-600" : "border-transparent"
                }`}
              />
              {errors.name && (
                <p className="text-red-600 text-[12px] roboto-font mt-0.5">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Username Field */}
            <div className="space-y-1">
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="UserName"
                className={`w-full bg-[#1E1E1E] text-white rounded-md py-3 px-4 text-[14px] roboto-font placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#72DB73] transition duration-150 border ${
                  errors.username ? "border-red-600 focus:ring-red-600" : "border-transparent"
                }`}
              />
              {errors.username && (
                <p className="text-red-600 text-[12px] roboto-font mt-0.5">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={`w-full bg-[#1E1E1E] text-white rounded-md py-3 px-4 text-[14px] roboto-font placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#72DB73] transition duration-150 border ${
                  errors.email ? "border-red-600 focus:ring-red-600" : "border-transparent"
                }`}
              />
              {errors.email && (
                <p className="text-red-600 text-[12px] roboto-font mt-0.5">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Mobile Field */}
            <div className="space-y-1">
              <input
                id="mobile"
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Mobile"
                className={`w-full bg-[#1E1E1E] text-white rounded-md py-3 px-4 text-[14px] roboto-font placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#72DB73] transition duration-150 border ${
                  errors.mobile ? "border-red-600 focus:ring-red-600" : "border-transparent"
                }`}
              />
              {errors.mobile && (
                <p className="text-red-600 text-[12px] roboto-font mt-0.5">
                  {errors.mobile}
                </p>
              )}
            </div>

            {/* Share Registration Data Checkbox */}
            <div className="pt-2">
              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    if (errors.agreed && e.target.checked) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.agreed;
                        return copy;
                      });
                    }
                  }}
                  className="rounded border-zinc-700 bg-zinc-950 text-[#72DB73] focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
                <span className="text-[12px] text-[#7C7C7C] roboto-font">
                  Share my registration data with Superapp
                </span>
              </label>
              {errors.agreed && (
                <p className="text-red-600 text-[12px] roboto-font mt-1">
                  {errors.agreed}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="registration-submit-btn"
              className="w-full bg-[#72DB73] hover:bg-[#5fc560] text-white font-bold py-3 px-4 rounded-full transition duration-150 text-[16px] uppercase tracking-wide mt-4"
            >
              SIGN UP
            </button>
          </form>

          {/* Terms and Privacy policy legal statements */}
          <div className="space-y-3.5 text-[11px] text-[#7C7C7C] leading-normal roboto-font text-left pt-2">
            <p>
              By clicking on Sign up. you agree to Superapp{" "}
              <span className="text-[#72DB73] cursor-pointer hover:underline">
                Terms and Conditions of Use
              </span>
            </p>
            <p>
              To learn more about how Superapp collects, uses, shares and protects your
              personal data please head Superapp{" "}
              <span className="text-[#72DB73] cursor-pointer hover:underline">
                Privacy Policy
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
