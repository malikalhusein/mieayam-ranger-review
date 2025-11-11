import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSetupAdmin = async () => {
    setSetupLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-admin');
      
      if (error) throw error;
      
      toast({
        title: "Admin Created!",
        description: "Admin user telah dibuat. Silakan login dengan: admin@mieayamranger.web.id",
      });
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message || "Gagal membuat admin user",
        variant: "destructive",
      });
    } finally {
      setSetupLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      loginSchema.parse({ email, password });
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user is admin
      const { data: roleData } = await supabase
        // @ts-ignore - Supabase types are auto-generated
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .single();

      if (!roleData) {
        await supabase.auth.signOut();
        throw new Error("Akses ditolak. Anda bukan admin.");
      }

      toast({
        title: "Login Berhasil",
        description: "Selamat datang, Admin!",
      });

      navigate("/admin");
    } catch (error: any) {
      toast({
        title: "Login Gagal",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <div className="container py-20">
        <div className="max-w-md mx-auto">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl">Admin Login</CardTitle>
              <CardDescription>
                Masukkan kredensial admin untuk mengakses panel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@mieayamranger.web.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Login"}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Atau</span>
                  </div>
                </div>

                <Button 
                  type="button"
                  variant="outline"
                  className="w-full" 
                  disabled={setupLoading}
                  onClick={handleSetupAdmin}
                >
                  {setupLoading ? "Setting up..." : "Setup Admin User"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Klik jika belum punya admin user
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
