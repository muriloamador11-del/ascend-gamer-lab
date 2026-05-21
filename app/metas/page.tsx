"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Filter,
  Gamepad2,
  Target,
  Trophy,
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
  updated_at: string;
};

const gameLabels: Record<string, string> = {
  league_of_legends: "League of Legends",
  teamfight_tactics: "Teamfight Tactics",
  valorant: "Valorant",
};

const statusLabels: Record<string, string> = {
  active: "Ativa",
  completed: "Concluída",
};

export default function GoalsPage() {
  const router = useRouter();

  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completingGoalId, setCompletingGoalId] = useState<string | null>(null);

  const [gameFilter, setGameFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const activeGoals = goals.filter((goal) => goal.status === "active");
  const completedGoals = goals.filter((goal) => goal.status === "completed");

  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const matchesGame = gameFilter === "all" || goal.game === gameFilter;
      const matchesStatus =
        statusFilter === "all" || goal.status === statusFilter;

      return matchesGame && matchesStatus;
    });
  }, [goals, gameFilter, statusFilter]);

  useEffect(() => {
    loadGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadGoals() {
    setIsLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error("Faça login para acessar suas metas.");
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("weekly_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    setGoals(data ?? []);
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
    await loadGoals();
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-sky-200 bg-white shadow-lg">
            <Target className="h-8 w-8 text-sky-600 animate-pulse" />
          </div>
          <p className="text-sm text-slate-500">Carregando metas...</p>
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
                <Target className="h-7 w-7 text-sky-600" />
              </div>

              <div>
                <Badge className="mb-3">Plano de evolução</Badge>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Metas de treino
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Acompanhe as metas criadas automaticamente pelos seus reviews
                  pós-partida e marque o que já foi concluído.
                </p>
              </div>
            </div>

            <Button asChild variant="outline">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard
            icon={<Target className="h-5 w-5" />}
            label="Total de metas"
            value={String(goals.length)}
          />

          <MetricCard
            icon={<Gamepad2 className="h-5 w-5" />}
            label="Metas ativas"
            value={String(activeGoals.length)}
          />

          <MetricCard
            icon={<Trophy className="h-5 w-5" />}
            label="Metas concluídas"
            value={String(completedGoals.length)}
          />
        </section>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50">
                <Filter className="h-5 w-5 text-sky-600" />
              </div>
              <CardTitle>Filtros</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Jogo</p>
              <select
                value={gameFilter}
                onChange={(event) => setGameFilter(event.target.value)}
                className="h-11 w-full px-3 text-sm"
              >
                <option value="all">Todos</option>
                <option value="league_of_legends">League of Legends</option>
                <option value="teamfight_tactics">Teamfight Tactics</option>
                <option value="valorant">Valorant</option>
              </select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Status</p>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-11 w-full px-3 text-sm"
              >
                <option value="all">Todas</option>
                <option value="active">Ativas</option>
                <option value="completed">Concluídas</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              Histórico de metas
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredGoals.length} meta
              {filteredGoals.length === 1 ? "" : "s"} encontrada
              {filteredGoals.length === 1 ? "" : "s"}.
            </p>
          </div>

          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_10px_34px_rgba(15,23,42,0.06)] backdrop-blur transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50/60 hover:shadow-[0_16px_42px_rgba(14,165,233,0.10)]"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge>{gameLabels[goal.game] ?? goal.game}</Badge>

                    <Badge
                      variant={
                        goal.status === "completed" ? "secondary" : "outline"
                      }
                    >
                      {statusLabels[goal.status] ?? goal.status}
                    </Badge>

                    <Badge variant="outline">
                      Até {formatDate(goal.end_date)}
                    </Badge>
                  </div>

                  <p className="text-lg font-black text-slate-950">
                    {goal.title}
                  </p>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    {goal.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {goal.match_id ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/partidas/${goal.match_id}`}>
                          Ver partida de origem
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>

                {goal.status === "active" ? (
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
                ) : (
                  <Badge variant="secondary" className="w-fit">
                    Concluída
                  </Badge>
                )}
              </div>
            </div>
          ))}

          {filteredGoals.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-bold text-slate-950">
                  Nenhuma meta encontrada.
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Registre uma nova partida para o Ascend gerar diagnóstico e
                  criar uma meta automaticamente.
                </p>

                <Button asChild className="mt-5">
                  <Link href="/partidas/nova">Registrar partida</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/88 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.07)] backdrop-blur transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_18px_44px_rgba(14,165,233,0.10)]">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600">
        {icon}
      </div>

      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-4xl font-black text-slate-950">{value}</p>
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