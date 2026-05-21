"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Gamepad2,
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
  rank_at_time: string | null;
  mental_state: string | null;
  created_at: string;
};

type WeeklyGoal = {
  id: string;
  user_id: string;
  match_id: string | null;
  game: string;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
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

const gameDescriptions: Record<string, string> = {
  league_of_legends: "Lane, macro, visão, objetivos e team fight.",
  teamfight_tactics: "Economia, level, roll down, scouting e posicionamento.",
  valorant: "Mira, utilitário, entrada, defesa, retake e comunicação.",
};

const resultLabels: Record<string, string> = {
  win: "Vitória",
  loss: "Derrota",
  draw: "Empate",
  top_4: "Top 4",
  bottom_4: "Bottom 4",
};

const mentalLabels: Record<string, string> = {
  focado: "Focado",
  neutro: "Neutro",
  cansado: "Cansado",
  tiltado: "Tiltado",
  ansioso: "Ansioso",
  confiante: "Confiante",
};

export default function DashboardPage() {
  const router = useRouter();

  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(
    null
  );
  const [gameProfiles, setGameProfiles] = useState<GameProfile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [completingGoalId, setCompletingGoalId] = useState<string | null>(null);

  const selectedGoals = useMemo(() => {
    if (!playerProfile?.main_goal) {
      return [];
    }

    return playerProfile.main_goal
      .split(",")
      .map((goal) => goal.trim())
      .filter(Boolean);
  }, [playerProfile]);

  const activeGoals = weeklyGoals.filter((goal) => goal.status === "active");
  const completedGoals = weeklyGoals.filter(
    (goal) => goal.status === "completed"
  );

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadDashboard() {
    setIsLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error("Faça login para acessar o dashboard.");
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

    if (!profileData) {
      router.push("/onboarding");
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
      .select("id, game, result, rank_at_time, mental_state, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (matchesError) {
      toast.error(matchesError.message);
      setIsLoading(false);
      return;
    }

    const { data: goalsData, error: goalsError } = await supabase
      .from("weekly_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6);

    if (goalsError) {
      toast.error(goalsError.message);
      setIsLoading(false);
      return;
    }

    setPlayerProfile(profileData);
    setGameProfiles(gamesData ?? []);
    setMatches(matchesData ?? []);
    setWeeklyGoals(goalsData ?? []);
    setIsLoading(false);
  }

  async function handleCompleteGoal(goalId: string) {
    setCompletingGoalId(goalId);

    const { error } = await supabase
      .from("weekly_goals")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", goalId);

    setCompletingGoalId(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Meta marcada como concluída.");
    await loadDashboard();
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-sky-200 bg-white shadow-lg">
            <Gamepad2 className="h-8 w-8 text-sky-600 animate-pulse" />
          </div>
          <p className="text-sm text-slate-500">Carregando dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pb-28 pt-8 text-slate-900 sm:px-6 lg:px-8 xl:pb-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/88 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_26rem)]" />

          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 shadow-sm">
              <Gamepad2 className="h-7 w-7 text-sky-600" />
            </div>

            <div>
              <Badge className="mb-3">Dashboard competitivo</Badge>

              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Seu laboratório de evolução
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Acompanhe seus objetivos, jogos principais, partidas
                registradas, diagnósticos e metas práticas da semana.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Target className="h-5 w-5" />}
            label="Objetivos ativos"
            value={String(selectedGoals.length)}
            description="Focos usados para guiar seus diagnósticos."
          />

          <MetricCard
            icon={<Clock className="h-5 w-5" />}
            label="Horas semanais"
            value={`${playerProfile?.weekly_hours ?? 0}h`}
            description="Base para montar sua rotina de treino."
          />

          <MetricCard
            icon={<Trophy className="h-5 w-5" />}
            label="Metas ativas"
            value={String(activeGoals.length)}
            description="Focos práticos gerados pelos reviews."
          />

          <MetricCard
            icon={<Gamepad2 className="h-5 w-5" />}
            label="Partidas recentes"
            value={String(matches.length)}
            description="Últimas partidas carregadas no painel."
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Foco atual da semana</CardTitle>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Metas criadas automaticamente a partir dos seus diagnósticos.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {activeGoals.length} ativa
                    {activeGoals.length === 1 ? "" : "s"}
                  </Badge>

                  <Button asChild variant="outline" size="sm">
                    <Link href="/metas">Ver todas</Link>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {activeGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge>{gameLabels[goal.game] ?? goal.game}</Badge>

                        <Badge variant="outline">
                          Até {formatDate(goal.end_date)}
                        </Badge>
                      </div>

                      <p className="font-bold text-slate-950">{goal.title}</p>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {goal.description}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      className="shrink-0"
                      disabled={completingGoalId === goal.id}
                      onClick={() => handleCompleteGoal(goal.id)}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {completingGoalId === goal.id
                        ? "Concluindo..."
                        : "Concluir"}
                    </Button>
                  </div>
                </div>
              ))}

              {activeGoals.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-sky-50/60 p-5 shadow-sm">
                  <p className="text-sm font-bold text-slate-950">
                    Nenhuma meta ativa ainda.
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Registre uma nova partida para o Ascend gerar um diagnóstico
                    e criar uma meta prática automaticamente.
                  </p>

                  <Button asChild className="mt-4">
                    <Link href="/partidas/nova">Registrar partida</Link>
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50">
                  <UserRound className="h-5 w-5 text-sky-600" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-950">
                    Usuário conectado
                  </p>
                  <p className="truncate text-xs text-slate-500">{userEmail}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
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
                    Nenhum objetivo cadastrado.
                  </p>
                ) : null}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-sky-50/70 p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-950">
                  Metas concluídas
                </p>

                <p className="mt-2 text-4xl font-black text-slate-950">
                  {completedGoals.length}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Total recente de metas concluídas no histórico carregado.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              Jogos configurados
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Use esses dados como base para os próximos registros de partida.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {gameProfiles.map((game) => (
              <GameProfileCard key={game.id} game={game} />
            ))}
          </div>

          {gameProfiles.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">
                  Nenhum jogo configurado. Volte ao onboarding e preencha pelo
                  menos um jogo.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Últimas partidas</CardTitle>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Clique em uma partida para ver detalhes e diagnóstico.
                  </p>
                </div>

                <Button asChild variant="outline">
                  <Link href="/partidas">Ver histórico completo</Link>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {matches.map((match) => (
                <Link
                  key={match.id}
                  href={`/partidas/${match.id}`}
                  className="block rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-slate-950">
                        {gameLabels[match.game] ?? match.game}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {resultLabels[match.result] ?? match.result}
                        {match.rank_at_time ? ` • ${match.rank_at_time}` : ""}
                        {match.mental_state
                          ? ` • Mental: ${
                              mentalLabels[match.mental_state] ??
                              match.mental_state
                            }`
                          : ""}
                      </p>
                    </div>

                    <Badge variant="outline">Ver detalhes</Badge>
                  </div>
                </Link>
              ))}

              {matches.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Nenhuma partida registrada ainda.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur">
            <Badge className="mb-3">Próxima ação</Badge>

            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              Registrar partida
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Registre uma partida manualmente para gerar diagnóstico, review e
              uma meta prática automaticamente.
            </p>

            <Button asChild className="mt-5 h-12 w-full">
              <Link href="/partidas/nova">
                Criar nova partida
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </section>
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

function GameProfileCard({ game }: { game: GameProfile }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{gameLabels[game.game] ?? game.game}</CardTitle>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {gameDescriptions[game.game] ?? "Perfil de jogo configurado."}
            </p>
          </div>

          <Badge variant="outline">Ativo</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <InfoBox label="Rank atual" value={game.current_rank} />
          <InfoBox label="Rank desejado" value={game.goal_rank} />
        </div>

        <InfoBox
          label={
            game.game === "teamfight_tactics"
              ? "Estilo"
              : game.game === "league_of_legends"
                ? "Rota"
                : "Função"
          }
          value={game.main_role}
        />

        <InfoBox
          label={
            game.game === "teamfight_tactics"
              ? "Comps"
              : game.game === "league_of_legends"
                ? "Campeões"
                : "Agentes"
          }
          value={game.main_characters}
        />
      </CardContent>
    </Card>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">
        {value && value.trim() ? value : "Não informado"}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}