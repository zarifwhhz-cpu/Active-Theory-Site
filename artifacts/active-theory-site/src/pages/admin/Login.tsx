import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth, useLogin } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { data: me, isLoading: meLoading } = useAuth();
  const login = useLogin();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (me?.authenticated) setLocation("/admin");
  }, [me, setLocation]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    login.mutate(password, {
      onSuccess: () => setLocation("/admin"),
      onError: (err) => {
        const message = err instanceof Error ? err.message : "Login failed";
        setError(message === "invalid_credentials" ? "Wrong password." : message);
      },
    });
  }

  if (meLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white flex items-center justify-center px-6" style={{ cursor: "auto" }}>
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm border border-white/10 bg-[#0a0a0a] p-8"
      >
        <div className="mb-8">
          <div className="text-xs text-white/40 uppercase tracking-widest">Active Theory</div>
          <h1 className="text-3xl font-bold uppercase tracking-tight mt-2">Admin Sign-in</h1>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="password" className="text-xs uppercase tracking-widest text-white/60">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 bg-black border-white/20 text-white"
              required
            />
          </div>
          {error && (
            <div className="text-xs text-red-400 uppercase tracking-widest">{error}</div>
          )}
          <Button
            type="submit"
            disabled={login.isPending}
            className="w-full bg-white text-black hover:bg-white/80 uppercase tracking-widest"
          >
            {login.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
          </Button>
        </div>
      </form>
    </div>
  );
}
