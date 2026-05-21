"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Crown,
  Gamepad2,
  LogOut,
  Mail,
  ShieldCheck,
  Target,
  Trophy,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";

type PlayerProfile = {
  id: string;
  user_id: string;
  main_goal: string;
  weekly_hours: number;
  content_creator_mode: boolean;
  created_at: string;
};

type GameProfile = {
  id: string;
  user_id: string;
  game: string;
  current_rank: string | null;
  goal_rank: string | null;
  main_role: string | null;
  main_characters: string | null;
  created_at: string;
};

type Match = {
  id: string;
  game: string;
  result: string;
  created_at: string;
};

type WeeklyGoal = {
  id: string;
  status: string;
  created_at: string;
};

const goalLabels: Record<string, string> = {
  subir_rank: "Subir rank",
  melhorar_mecanica: "Melhorar mecânica",
  tomada_decisao: "Melhorar tomada de decisão",
  consistencia: "Jogar com mais consistência",
  macro_game: "Melhorar macro e leitura de jogo",
  mental_game: "Melhorar mental e controle de tilt",
  plano_treino: "Receber plano de treino",
  competir: "Competir ou entrar em time",
  coaching: "Receber coaching",
};

const gameLabels: Record<string, string> = {
  league_of_legends: "League of Legends",
  teamfight_tactics: "Teamfight Tactics",
  valorant: "Valorant",
};

export default function AccountPage() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState("");
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(
    null
  );
  const [gameProfiles, setGameProfiles] = useState<GameProfile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedGoals = useMemo(() => {
    if (!playerProfile?.main_goal) return [];

    return playerProfile.main_goal
      .split(",")
      .map((goal) => goal.trim())
      .filter(Boolean);
  }, [playerProfile]);

  const completedGoals = goals.filter((goal) => goal.status === "completed");
  const activeGoals = goals.filter((goal) => goal.status === "active");

  useEffect(() => {
    loadAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAccount() {
    setIsLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error("Faça login para acessar sua conta.");
      router.push("/login");
      return;
    }

    setUserEmail(user.email ?? "");

    const { data: profileData, error: profileError } = await supabase
      .from("player_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      toast.error(profileError.message);
      setIsLoading(false);
      return;
    }

    const { data: gamesData, error: gamesError } = await supabase
      .from("game_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (gamesError) {
      toast.error(gamesError.message);
      setIsLoading(false);
      return;
    }

    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select("id, game, result, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (matchesError) {
      toast.error(matchesError.message);
      setIsLoading(false);
      return;
    }

    const { data: goalsData, error: goalsError } = await supabase
      .from("weekly_goals")
      .select("id, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (goalsError) {
      toast.error(goalsError.message);
      setIsLoading(false);
      return;
    }

    setPlayerProfile(profileData);
    setGameProfiles(gamesData ?? []);
    setMatches(matchesData ?? []);
    setGoals(goalsData ?? []);
    setIsLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Você saiu da conta.");
    router.push("/login");
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-sky-200 bg-white shadow-lg">
            <UserRound className="h-8 w-8 text-sky-600 animate-pulse" />
          </div>
          <p className="text-sm text-slate-500">Carregando conta...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pb-28 pt-8 text-slate-900 sm:px-6 lg:px-8 xl:pb-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/88 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 shadow-sm">
                <UserRound className="h-7 w-7 text-sky-600" />
              </div>

              <div>
                <Badge className="mb-3">Conta e perfil</Badge>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Minha conta
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Gerencie sua conta, perfil competitivo, jogos acompanhados e
                  dados principais do Ascend Gamer Lab.
                </p>
              </div>
            </div>

            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Gamepad2 className="h-5 w-5" />}
            label="Partidas"
            value={String(matches.length)}
            description="Total registrado na conta."
          />

          <MetricCard
            icon={<Target className="h-5 w-5" />}
            label="Metas ativas"
            value={String(activeGoals.length)}
            description="Focos práticos em andamento."
          />

          <MetricCard
            icon={<Trophy className="h-5 w-5" />}
            label="Metas concluídas"
            value={String(completedGoals.length)}
            description="Treinos já finalizados."
          />

          <MetricCard
            icon={<Crown className="h-5 w-5" />}
            label="Plano"
            value="Free"
            description="Base do MVP atual."
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader>
              <CardTitle>Dados da conta</CardTitle>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Informações básicas do usuário conectado.
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50">
                  <Mail className="h-5 w-5 text-sky-600" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-950">
                    E-mail conectado
                  </p>
                  <p className="truncate text-sm text-slate-500">
                    {userEmail || "Não informado"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoBox
                  label="Horas semanais"
                  value={
                    playerProfile?.weekly_hours
                      ? `${playerProfile.weekly_hours}h`
                      : "Não informado"
                  }
                />

                <InfoBox
                  label="Jogos configurados"
                  value={String(gameProfiles.length)}
                />
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-sm font-bold text-slate-950">
                  Objetivos de evolução
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedGoals.map((goal) => (
                    <Badge key={goal} variant="outline">
                      {goalLabels[goal] ?? goal}
                    </Badge>
                  ))}
                </div>

                {selectedGoals.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">
                    Nenhum objetivo configurado ainda.
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/onboarding">
                    Editar perfil gamer
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button asChild variant="outline">
                  <Link href="/dashboard">Voltar ao dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plano atual</CardTitle>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Área preparada para monetização futura.
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/70 p-5 shadow-sm">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-200 bg-white text-sky-600">
                  <Crown className="h-6 w-6" />
                </div>

                <p className="text-xl font-black text-slate-950">
                  Plano Free
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Você está usando a versão MVP com registro manual, dashboard,
                  metas e diagnóstico automático.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-950">
                  Futuro Premium
                </p>

                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-500">
                  <li>• Histórico avançado</li>
                  <li>• Diagnóstico v2 por jogo</li>
                  <li>• Relatórios exportáveis</li>
                  <li>• Integrações oficiais permitidas</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader>
              <CardTitle>Jogos configurados</CardTitle>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Perfis usados para personalizar diagnósticos e metas.
              </p>
            </CardHeader>

            <CardContent className="grid gap-4 lg:grid-cols-3">
              {gameProfiles.map((game) => (
                <GameProfileCard key={game.id} game={game} />
              ))}

              {gameProfiles.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                  <p className="text-sm font-bold text-slate-950">
                    Nenhum jogo configurado.
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Edite seu perfil gamer para adicionar pelo menos um jogo.
                  </p>

                  <Button asChild className="mt-4">
                    <Link href="/onboarding">Editar perfil</Link>
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Segurança e privacidade</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-white text-sky-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <p className="text-sm font-bold text-slate-950">
                  Ferramenta educacional
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  O Ascend trabalha com registro manual, análise pós-partida e
                  metas de treino. Não usa cheats, automações proibidas, leitura
                  de memória ou vantagem injusta.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/88 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.07)] backdrop-blur transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_18px_44px_rgba(14,165,233,0.10)]">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600">
        {icon}
      </div>

      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

function GameProfileCard({ game }: { game: GameProfile }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-slate-950">
            {gameLabels[game.game] ?? game.game}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Perfil competitivo ativo
          </p>
        </div>

        <Badge variant="outline">Ativo</Badge>
      </div>

      <div className="space-y-3">
        <InfoBox label="Rank atual" value={game.current_rank || "Não informado"} />
        <InfoBox
          label="Rank desejado"
          value={game.goal_rank || "Não informado"}
        />
        <InfoBox
          label={
            game.game === "teamfight_tactics"
              ? "Estilo"
              : game.game === "league_of_legends"
                ? "Rota"
                : "Função"
          }
          value={game.main_role || "Não informado"}
        />
        <InfoBox
          label={
            game.game === "teamfight_tactics"
              ? "Comps"
              : game.game === "league_of_legends"
                ? "Campeões"
                : "Agentes"
          }
          value={game.main_characters || "Não informado"}
        />
      </div>
    </div>
  );
}