"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Filter,
  Gamepad2,
  Plus,
  Search,
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
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";

type Match = {
  id: string;
  game: string;
  result: string;
  rank_at_time: string | null;
  mental_state: string | null;
  notes: string | null;
  created_at: string;
};

const gameLabels: Record<string, string> = {
  league_of_legends: "League of Legends",
  teamfight_tactics: "Teamfight Tactics",
  valorant: "Valorant",
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

export default function MatchesPage() {
  const router = useRouter();

  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [gameFilter, setGameFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const matchesGame = gameFilter === "all" || match.game === gameFilter;
      const matchesResult =
        resultFilter === "all" || match.result === resultFilter;

      const searchableText = [
        gameLabels[match.game] ?? match.game,
        resultLabels[match.result] ?? match.result,
        match.rank_at_time,
        match.mental_state,
        match.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !search || searchableText.includes(search.toLowerCase());

      return matchesGame && matchesResult && matchesSearch;
    });
  }, [matches, gameFilter, resultFilter, search]);

  useEffect(() => {
    async function loadMatches() {
      setIsLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Faça login para acessar o histórico de partidas.");
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("matches")
        .select("id, game, result, rank_at_time, mental_state, notes, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      setMatches(data ?? []);
      setIsLoading(false);
    }

    loadMatches();
  }, [router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-sky-200 bg-white shadow-lg">
            <Gamepad2 className="h-8 w-8 text-sky-600 animate-pulse" />
          </div>
          <p className="text-sm text-slate-500">Carregando partidas...</p>
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
                <Gamepad2 className="h-7 w-7 text-sky-600" />
              </div>

              <div>
                <Badge className="mb-3">Histórico competitivo</Badge>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Partidas registradas
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Acompanhe seu histórico completo, filtre por jogo e acesse os
                  detalhes com diagnóstico, erro mais caro e meta gerada.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="outline">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>

              <Button asChild>
                <Link href="/partidas/nova">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova partida
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total" value={String(matches.length)} />
          <MetricCard
            label="LoL"
            value={String(
              matches.filter((match) => match.game === "league_of_legends")
                .length
            )}
          />
          <MetricCard
            label="TFT"
            value={String(
              matches.filter((match) => match.game === "teamfight_tactics")
                .length
            )}
          />
          <MetricCard
            label="Valorant"
            value={String(
              matches.filter((match) => match.game === "valorant").length
            )}
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

          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Buscar</p>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por rank, mental, notas..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

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
              <p className="text-sm font-medium text-slate-600">Resultado</p>
              <select
                value={resultFilter}
                onChange={(event) => setResultFilter(event.target.value)}
                className="h-11 w-full px-3 text-sm"
              >
                <option value="all">Todos</option>
                <option value="win">Vitória</option>
                <option value="loss">Derrota</option>
                <option value="draw">Empate</option>
                <option value="top_4">Top 4</option>
                <option value="bottom_4">Bottom 4</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              Histórico
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredMatches.length} partida
              {filteredMatches.length === 1 ? "" : "s"} encontrada
              {filteredMatches.length === 1 ? "" : "s"}.
            </p>
          </div>

          {filteredMatches.map((match) => (
            <Link
              key={match.id}
              href={`/partidas/${match.id}`}
              className="block rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_10px_34px_rgba(15,23,42,0.06)] backdrop-blur transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50/60 hover:shadow-[0_16px_42px_rgba(14,165,233,0.10)]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge>{gameLabels[match.game] ?? match.game}</Badge>

                    <Badge variant="outline">
                      {resultLabels[match.result] ?? match.result}
                    </Badge>

                    {match.rank_at_time ? (
                      <Badge variant="outline">{match.rank_at_time}</Badge>
                    ) : null}
                  </div>

                  <p className="text-lg font-black text-slate-950">
                    {gameLabels[match.game] ?? match.game}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {match.mental_state
                      ? `Mental: ${
                          mentalLabels[match.mental_state] ??
                          match.mental_state
                        }`
                      : "Mental não informado"}{" "}
                    • Registrada em {formatDateTime(match.created_at)}
                  </p>

                  {match.notes ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {match.notes}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-sky-600">
                  Ver detalhes
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}

          {filteredMatches.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-bold text-slate-950">
                  Nenhuma partida encontrada.
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Ajuste os filtros ou registre uma nova partida para começar a
                  construir seu histórico de evolução.
                </p>

                <Button asChild className="mt-5">
                  <Link href="/partidas/nova">
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar partida
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/88 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.07)] backdrop-blur transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_18px_44px_rgba(14,165,233,0.10)]">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-4xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "data indisponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}