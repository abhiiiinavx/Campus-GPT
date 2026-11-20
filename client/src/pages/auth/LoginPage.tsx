import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { Button } from "../../components/common/Button.js";
import { GraduationCap, Sparkles, Lock, Mail, ArrowRight } from "lucide-react";

export const LoginPage = () => {
  const [email, setEmail] = useState("abhinav@campusiq.edu");
  const [password, setPassword] = useState("Password@123");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login({ email, password });
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (user.role === "FACULTY") {
        navigate("/faculty/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Invalid email or password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (
    role: "abhinav" | "student" | "faculty" | "admin",
  ) => {
    setError(null);
    if (role === "abhinav" || role === "student") {
      setEmail("abhinav@campusiq.edu");
      setPassword("Password@123");
    } else if (role === "faculty") {
      setEmail("faculty.cs@campusiq.edu");
      setPassword("Password@123");
    } else {
      setEmail("admin@campusiq.edu");
      setPassword("Password@123");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-b from-slate-50 via-slate-100 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20">
      <div className="w-full max-w-md space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-glow mb-2">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Campus
            <span className="text-indigo-600 dark:text-indigo-400">IQ</span>
          </h1>
          <p className="text-xs uppercase tracking-widest font-semibold text-indigo-600 dark:text-indigo-400">
            One AI Platform for Everything on Campus
          </p>
        </div>

        {/* Card Form */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 shadow-xl">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            Sign In to your Account
          </h2>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-medium text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Campus Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@campusiq.edu"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="glow"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2 font-semibold"
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Sign In to CampusIQ
            </Button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 text-center">
              Quick Demo Logins
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials("abhinav")}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-500 transition-colors text-left col-span-2"
              >
                🎓 <strong>Abhinav (CSE-12)</strong>
                <span className="block text-[10px] text-slate-400">
                  ABES EC • Roll: 2400320100041 • 8.85 CGPA
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials("faculty")}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-500 transition-colors text-left"
              >
                👨‍🏫 <strong>Prof. Smith</strong>
                <span className="block text-[10px] text-slate-400">
                  Faculty (DBMS/OS)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials("admin")}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-500 transition-colors text-left"
              >
                👑 <strong>Dean Vance</strong>
                <span className="block text-[10px] text-slate-400">
                  Academic Admin
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            New student?{" "}
            <Link
              to="/signup"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
