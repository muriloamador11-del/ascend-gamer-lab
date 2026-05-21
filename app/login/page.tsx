"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gamepad2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email || !password) {
      toast.error("Preencha e-mail e senha.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Login realizado com sucesso.");
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-50">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-50">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800">
            <Gamepad2 className="h-6 w-6" />
          </div>

          <div>
            <p className="text-sm text-zinc-400">Ascend Gamer Lab</p>
            <CardTitle className="text-2xl">Entrar na sua conta</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="border-zinc-800 bg-zinc-950"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="border-zinc-800 bg-zinc-950"
              />
            </div>

            <Button className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

            <p className="text-center text-sm text-zinc-400">
              Ainda não tem conta?{" "}
              <Link href="/cadastro" className="font-medium text-zinc-50">
                Criar conta
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}