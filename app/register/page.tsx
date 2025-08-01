"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider
} from "firebase/auth";
import { getAuth } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { checkUsername } from "../api/check-username/route";

type PasswordType = "" | "short" | "weak" | "medium" | "strong" | "high" ;

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordType>("");
  const [uniqueUsername, setUniqueUsername] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const router = useRouter();
  const auth = getAuth(firebaseApp);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signup(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const signupWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const signupWithGitHub = async () => {
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const textColors = {
    "":"",
    "short": "text-yellow-500",
    "weak": "text-red-500",
    "medium": "text-blue-500",
    "strong": "text-orange-500",
    "high": "text-green-500",
  }[passwordStrength];

  const outlineColors = {
    "":"",
    "short": "!outline-yellow-500",
    "weak": "!outline-red-500",
    "medium": "!outline-blue-500",
    "strong": "!outline-orange-500",
    "high": "!outline-green-500",
  }[passwordStrength];


  const validatePassword = (password: string) => {
    const checks = [/[a-z]/,/[A-Z]/,/\d/,/[@.#$!%^&*.?]/];

    const levels: PasswordType[] = ["short", "weak", "medium", "strong", "high"];

    let score = checks.reduce((acc, rgx) => acc + Number(rgx.test(password)), 0);
    setPasswordStrength(levels[score])
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg border"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome</h1>
        </div>

        {error && (
          <div className="text-red-500 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="font-mdeium">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter Username"
              className="placeholder:text-gray-500"
              value={username}
              onChange={async(e) => {
                setUsername(e.target.value);
                setLoading(true);
                const result = await checkUsername(e.target.value);
                setUniqueUsername(result);
                setLoading(false);
              }}
              required
            />
            {loading ? <Loader2 className="w-5 h-5 animate-spin infinite"/> : null}
            {uniqueUsername && !loading ? <div className="text-green-500 text-sm">Username is unique</div> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              className="placeholder:text-gray-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                required
                className={`pr-10 ${outlineColors}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 "
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className={`text-sm ${textColors}`}>
              {passwordStrength}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Sign Up
          </Button>
        </form>

        <div className="text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-primary hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={signupWithGoogle}
          >
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={signupWithGitHub}
          >
            GitHub
          </Button>
        </div>

        <p className="text-center text-sm">
          Have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
