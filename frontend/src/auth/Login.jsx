import { Eye } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

import FlagNepal from "../assets/Flag-Nepal.gif";
import EmblemNepal from "../assets/Emblem_of_Nepal.png";
import KmcLogo from "../assets/kmc_logo.png";
import map from "../assets/map16.jpg";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Log what we're sending
    console.log("Attempting login with:", { email, password: "***" });

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      
      // Navigate to dashboard after successful login
      navigate("/app/dashboard");
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      console.error("ERROR RESPONSE DATA:", error.response?.data);
      console.error("ERROR STATUS:", error.response?.status);
      console.error("ERROR HEADERS:", error.response?.headers);
      
      // Better error handling
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle different error formats from Django
        if (typeof errorData === 'string') {
          setError(errorData);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else if (errorData.non_field_errors) {
          setError(errorData.non_field_errors[0]);
        } else if (typeof errorData === 'object') {
          // Flatten all error messages
          const errorMessages = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          setError(errorMessages || "Login failed");
        } else {
          setError("Invalid email or password");
        }
      } else if (error.message) {
        setError(error.message);
      } else {
        setError("Unable to connect to server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#062A4D] to-[#0C3F6E] px-4 relative overflow-hidden">
      {/* Soft Background Glow */}
      <div className="absolute w-[600px] h-[600px] bg-[#1F4E79] opacity-20 rounded-full blur-3xl top-[-200px] left-[-200px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] flex overflow-hidden"
      >
        {/* LEFT PANEL */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#EAF6FD] to-[#D6ECFA] items-center justify-center p-10 relative">
          <img
            src={map}
            alt="Ward Map"
            className="max-w-full max-h-[100%] object-contain drop-shadow-xl"
          />
          <div className="absolute inset-0 border-r border-white/40" />
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-14 py-14">
          <h1 className="text-3xl font-bold text-center text-[#062A4D] mb-8 tracking-wide">
            Login
          </h1>

          {/* LOGOS */}
          <div className="flex justify-center gap-8 mb-12">
            <img src={EmblemNepal} alt="Emblem" className="h-12 object-contain" />
            <img src={KmcLogo} alt="KMC" className="h-12 object-contain" />
            <img src={FlagNepal} alt="Flag" className="h-12 object-contain" />
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            {/* ERROR MESSAGE */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* EMAIL */}
            <div>
              <label className="text-xs font-semibold text-gray-500 tracking-wide">
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 border-b-2 border-gray-200 focus:border-[#1F4E79] focus:outline-none py-2 text-sm transition-all duration-300"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <label className="text-xs font-semibold text-gray-500 tracking-wide">
                PASSWORD
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 border-b-2 border-gray-200 focus:border-[#1F4E79] focus:outline-none py-2 pr-8 text-sm transition-all duration-300"
                disabled={loading}
                autoComplete="current-password"
              />
              <Eye
                size={18}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 bottom-2 text-gray-400 hover:text-gray-600 cursor-pointer"
              />
            </div>

            {/* FORGOT PASSWORD */}
            <div className="text-right">
              <button
                type="button"
                className="text-xs text-[#1F4E79] hover:underline"
                onClick={() => alert("Forgot password feature coming soon")}
              >
                Forgot Password?
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-sm font-semibold tracking-wide shadow-lg transition-all duration-300 flex items-center justify-center gap-2
                ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#F4B000] hover:scale-[1.02] hover:shadow-xl active:scale-100"
                }`}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Logging in..." : "LOGIN"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}