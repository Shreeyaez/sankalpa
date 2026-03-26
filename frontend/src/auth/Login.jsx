import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
    setError("");
    console.log("Attempting login with:", { email, password: "***" });

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate("/app/dashboard");
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === "string") {
          setError(errorData);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else if (errorData.non_field_errors) {
          setError(errorData.non_field_errors[0]);
        } else if (typeof errorData === "object") {
          const errorMessages = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
            .join("; ");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#062A4D] via-[#093B68] to-[#0C3F6E] px-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute w-[500px] h-[500px] bg-[#1F4E79] opacity-20 rounded-full blur-3xl top-[-180px] left-[-180px] pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] bg-[#F4B000] opacity-5 rounded-full blur-3xl bottom-[-100px] right-[-100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.3)] flex overflow-hidden"
      >
        {/* Gold top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#F4B000] via-[#f7c84a] to-[#F4B000] z-10 rounded-t-3xl" />

        {/* ── LEFT PANEL — Map ── */}
        <div className="hidden md:flex w-[52%] relative overflow-hidden bg-gradient-to-br from-[#ddeef8] to-[#c8e4f4]">
          <img
            src={map}
            alt="Ward 16 Map"
            className="w-full h-full object-cover object-center"
          />

          {/* Dark overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#062A4D]/80 via-[#062A4D]/20 to-transparent" />

          {/* Ward badge — top left */}
          <div className="absolute top-5 left-5">
            <span className="flex items-center gap-1.5 bg-[#F4B000]/90 backdrop-blur-sm text-[#062A4D] text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow">
              <span className="w-1.5 h-1.5 rounded-full bg-[#062A4D] inline-block animate-pulse" />
              Ward 16
            </span>
          </div>

          {/* Bottom text */}
          <div className="absolute bottom-0 left-0 right-0 px-7 pb-7 pt-10">
            <p className="text-white/50 text-[10px] font-semibold tracking-[2px] uppercase mb-1">
              Kathmandu Metropolitan City
            </p>
            <h2 className="text-white text-xl font-bold leading-snug" style={{ fontFamily: "Georgia, serif" }}>
              Ward 16 Management<br />System
            </h2>
            <div className="mt-3 w-8 h-[2px] bg-[#F4B000] rounded" />
          </div>
        </div>

        {/* ── RIGHT PANEL — Login ── */}
        <div className="w-full md:w-[48%] flex flex-col justify-center px-10 py-12">

          {/* Logos */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex justify-center items-center gap-5 mb-7"
          >
            <div className="w-11 h-11 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center overflow-hidden">
              <img src={EmblemNepal} alt="Emblem" className="w-9 h-9 object-contain" />
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="w-11 h-11 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center overflow-hidden">
              <img src={KmcLogo} alt="KMC" className="w-9 h-9 object-contain" />
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="flex items-center justify-center">
              <img src={FlagNepal} alt="Flag" className="h-10 object-contain drop-shadow" />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <p className="text-[10px] font-bold tracking-[2.5px] text-[#F4B000] uppercase mb-1">
              Government Portal
            </p>
            <h1 className="text-2xl font-bold text-[#062A4D]" style={{ fontFamily: "Georgia, serif" }}>
              Welcome Back
            </h1>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <label className="text-[10px] font-bold text-gray-400 tracking-[2px] uppercase block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border-b-2 border-gray-200 focus:border-[#062A4D] focus:outline-none py-2 text-sm text-gray-800 placeholder-gray-300 transition-colors duration-200 bg-transparent"
                disabled={loading}
                autoComplete="email"
              />
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <label className="text-[10px] font-bold text-gray-400 tracking-[2px] uppercase block mb-1.5">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border-b-2 border-gray-200 focus:border-[#062A4D] focus:outline-none py-2 pr-8 text-sm text-gray-800 placeholder-gray-300 transition-colors duration-200 bg-transparent"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 bottom-2 text-gray-300 hover:text-gray-500 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </motion.div>

            {/* Forgot password */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-right"
            >
              <button
                type="button"
                className="text-[11px] text-gray-400 hover:text-[#062A4D] transition-colors"
                onClick={() => alert("Forgot password feature coming soon")}
              >
                Forgot Password?
              </button>
            </motion.div>

            {/* Login button — smaller, centered */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center pt-1"
            >
              <button
                type="submit"
                disabled={loading}
                className={`px-10 py-2.5 rounded-xl text-[13px] font-bold tracking-widest uppercase shadow-md transition-all duration-200 flex items-center gap-2
                  ${
                    loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#F4B000] hover:bg-[#e0a200] hover:shadow-lg hover:-translate-y-[1px] active:translate-y-0 text-[#062A4D]"
                  }`}
              >
                {loading && (
                  <div className="w-3.5 h-3.5 border-2 border-[#062A4D] border-t-transparent rounded-full animate-spin" />
                )}
                {loading ? "Signing in…" : "Login"}
              </button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-[10px] text-gray-300 mt-8 tracking-wide"
          >
            Ward 16 · Kathmandu Metropolitan City · Nepal
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}