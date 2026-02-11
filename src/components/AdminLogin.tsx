import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Lock } from "lucide-react";

interface AdminLoginProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AdminLogin = ({ onClose, onSuccess }: AdminLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("[AdminLogin] attempting signIn...");
      
      // Timeout de 15s para evitar travar infinitamente no iframe
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("timeout")), 15000)
      );

      const signInPromise = supabase.auth.signInWithPassword({ email, password });
      
      let signInResult;
      try {
        signInResult = await Promise.race([signInPromise, timeoutPromise]);
      } catch (timeoutErr) {
        console.error("[AdminLogin] login timeout");
        toast.error("Login demorou demais. Tente abrir o site numa aba separada.");
        setLoading(false);
        return;
      }

      const { data: signInData, error } = signInResult;

      if (error) {
        console.error("[AdminLogin] signIn error:", error.message);
        toast.error("Credenciais inválidas");
        setLoading(false);
        return;
      }

      console.log("[AdminLogin] signIn success, checking role...");
      const userId = signInData.user?.id;
      if (userId) {
        const { data: isAdmin, error: rpcError } = await supabase.rpc("has_role", {
          _user_id: userId,
          _role: "admin" as const,
        });

        console.log("[AdminLogin] has_role:", isAdmin, "error:", rpcError);

        if (rpcError) {
          console.error("[AdminLogin] RPC error:", rpcError);
          toast.error("Erro ao verificar permissões");
          setLoading(false);
          return;
        }

        if (!isAdmin) {
          toast.error("Você não tem permissão de administrador");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
      }

      toast.success("Login realizado com sucesso!");
      setLoading(false);
      onSuccess();
    } catch (err) {
      console.error("[AdminLogin] catch error:", err);
      toast.error("Erro ao fazer login. Tente numa aba separada.");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-background rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
        </div>

        <h2 className="font-display text-2xl text-foreground text-center mb-2">
          Acesso Restrito
        </h2>
        <p className="font-body text-sm text-muted-foreground text-center mb-8">
          Entre com suas credenciais
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="font-body text-sm text-foreground block mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          <div>
            <label className="font-body text-sm text-foreground block mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-body text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AdminLogin;
