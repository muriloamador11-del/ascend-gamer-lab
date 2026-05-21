"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  Dumbbell,
  Gamepad2,
  Lightbulb,
  Target,
  TriangleAlert,
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

type Match = {
  id: string;
  user_id: string;
  game: string;
  result: string;
  rank_at_time: string | null;
  played_at: string;
  duration_minutes: number | null;
  mental_state: string | null;
  notes: string | null;
  created_at: string;
};

type LolDetails = {
  champion: string | null;
  role: string | null;
  matchup: string | null;
  kills: number | null;
  deaths: number | null;
  assists: number | null;
  cs_10: number | null;
  total_cs: number | null;
  vision_score: number | null;
  deaths_before_objective: number | null;
  lane_result: string | null;
  win_condition: string | null;
};

type TftDetails = {
  placement: number | null;
  composition: string | null;
  level_timing: string | null;
  rolldown_timing: string | null;
  augments: string | null;
  items: string | null;
  contested: string | null;
  played_for: string | null;
  economy_notes: string | null;
};

type ValorantDetails = {
  agent: string | null;
  agent_role: string | null;
  map: string | null;
  acs: number | null;
  kills: number | null;
  deaths: number | null;
  assists: number | null;
  first_bloods: number | null;
  first_deaths: number | null;
  utility_notes: string | null;
  communication_notes: string | null;
};

type MatchReview = {
  id: string;
  match_id: string;
  user_id: string;
  diagnosis: string;
  analysis: string;
  correction: string;
  training: string;
  next_step: string;
  biggest_mistake: string | null;
  recurring_pattern: string | null;
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

export default function MatchDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const matchId = String(params.id);

  const [match, setMatch] = useState<Match | null>(null);
  const [review, setReview] = useState<MatchReview | null>(null);

  const [lolDetails, setLolDetails] = useState<LolDetails | null>(null);
  const [tftDetails, setTftDetails] = useState<TftDetails | null>(null);
  const [valorantDetails, setValorantDetails] =
    useState<ValorantDetails | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMatch() {
      setIsLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Faça login para acessar a partida.");
        router.push("/login");
        return;
      }

      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (matchError) {
        toast.error(matchError.message);
        setIsLoading(false);
        return;
      }

      if (!matchData) {
        toast.error("Partida não encontrada.");
        router.push("/dashboard");
        return;
      }

      setMatch(matchData);

      const { data: reviewData, error: reviewError } = await supabase
        .from("match_reviews")
        .select("*")
        .eq("match_id", matchId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (reviewError) {
        toast.error(reviewError.message);
      }

      setReview(reviewData);

      if (matchData.game === "league_of_legends") {
        const { data, error } = await supabase
          .from("lol_match_details")
          .select("*")
          .eq("match_id", matchId)
          .maybeSingle();

        if (error) {
          toast.error(error.message);
        }

        setLolDetails(data);
      }

      if (matchData.game === "teamfight_tactics") {
        const { data, error } = await supabase
          .from("tft_match_details")
          .select("*")
          .eq("match_id", matchId)
          .maybeSingle();

        if (error) {
          toast.error(error.message);
        }

        setTftDetails(data);
      }

      if (matchData.game === "valorant") {
        const { data, error } = await supabase
          .from("valorant_match_details")
          .select("*")
          .eq("match_id", matchId)
          .maybeSingle();

        if (error) {
          toast.error(error.message);
        }

        setValorantDetails(data);
      }

      setIsLoading(false);
    }

    loadMatch();
  }, [matchId, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-sky-200 bg-white shadow-lg">
            <Gamepad2 className="h-8 w-8 text-sky-600 animate-pulse" />
          </div>
          <p className="text-sm text-slate-500">Carregando partida...</p>
        </div>
      </main>
    );
  }

  if (!match) {
    return null;
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
                <Badge className="mb-3">Review pós-partida</Badge>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  {gameLabels[match.game] ?? match.game}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Relatório da partida com dados registrados, diagnóstico
                  automático, erro mais caro e plano de correção.
                </p>
              </div>
            </div>

            <Button asChild variant="outline">
              <Link href="/partidas">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Histórico
              </Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            label="Resultado"
            value={resultLabels[match.result] ?? match.result}
          />

          <InfoCard label="Rank no momento" value={match.rank_at_time} />

          <InfoCard
            label="Duração"
            value={
              match.duration_minutes ? `${match.duration_minutes} min` : null
            }
          />

          <InfoCard
            label="Estado mental"
            value={
              match.mental_state
                ? mentalLabels[match.mental_state] ?? match.mental_state
                : null
            }
          />
        </section>

        {review ? (
          <section className="space-y-4">
            <div className="overflow-hidden rounded-[2rem] border border-sky-200 bg-gradient-to-br from-white via-sky-50/70 to-white p-6 shadow-[0_18px_50px_rgba(14,165,233,0.10)] backdrop-blur-xl">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Badge className="mb-3">Review v1</Badge>

                  <h2 className="text-2xl font-black tracking-tight text-slate-950">
                    Diagnóstico automático
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Primeira leitura gerada com base nos dados registrados. Use
                    como foco prático para a próxima partida.
                  </p>
                </div>

                <div className="rounded-3xl border border-sky-200 bg-white/80 px-4 py-3 text-sm font-bold text-sky-700 shadow-sm">
                  Ascend Report
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <ReviewBox
                  icon={<Brain className="h-5 w-5" />}
                  title="Diagnóstico"
                  text={review.diagnosis}
                />

                <ReviewBox
                  icon={<Lightbulb className="h-5 w-5" />}
                  title="Análise"
                  text={review.analysis}
                />

                <ReviewBox
                  icon={<Target className="h-5 w-5" />}
                  title="Correção"
                  text={review.correction}
                />

                <ReviewBox
                  icon={<Dumbbell className="h-5 w-5" />}
                  title="Treino"
                  text={review.training}
                />
              </div>
            </div>

            <section className="grid gap-4 lg:grid-cols-3">
              <FocusCard
                title="Próximo passo"
                text={review.next_step}
                highlight
              />

              <FocusCard
                title="Erro mais caro"
                text={review.biggest_mistake || "Não identificado."}
              />

              <FocusCard
                title="Padrão recorrente"
                text={review.recurring_pattern || "Ainda sem padrão definido."}
              />
            </section>
          </section>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico automático</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-4">
                <TriangleAlert className="mt-1 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-black text-slate-950">
                    Review ainda não gerado.
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Esta partida pode ter sido criada antes do motor de
                    diagnóstico. As próximas partidas já devem gerar review
                    automaticamente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Anotações da partida</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm leading-6 text-slate-500">
              {match.notes && match.notes.trim()
                ? match.notes
                : "Nenhuma anotação registrada."}
            </p>
          </CardContent>
        </Card>

        {match.game === "league_of_legends" && lolDetails ? (
          <Card>
            <CardHeader>
              <CardTitle>Detalhes de League of Legends</CardTitle>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Dados de lane, matchup, farm, visão e objetivos usados para o
                diagnóstico.
              </p>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <InfoBox label="Campeão" value={lolDetails.champion} />
              <InfoBox label="Rota" value={lolDetails.role} />
              <InfoBox label="Matchup" value={lolDetails.matchup} />
              <InfoBox
                label="Resultado da lane"
                value={lolDetails.lane_result}
              />
              <InfoBox
                label="KDA"
                value={`${lolDetails.kills ?? 0}/${lolDetails.deaths ?? 0}/${
                  lolDetails.assists ?? 0
                }`}
              />
              <InfoBox label="CS aos 10min" value={lolDetails.cs_10} />
              <InfoBox label="CS total" value={lolDetails.total_cs} />
              <InfoBox label="Vision score" value={lolDetails.vision_score} />
              <InfoBox
                label="Mortes antes de objetivo"
                value={lolDetails.deaths_before_objective}
              />
              <InfoBox
                label="Condição de vitória"
                value={lolDetails.win_condition}
              />
            </CardContent>
          </Card>
        ) : null}

        {match.game === "teamfight_tactics" && tftDetails ? (
          <Card>
            <CardHeader>
              <CardTitle>Detalhes de Teamfight Tactics</CardTitle>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Dados de composição, economia, rolldown, itens e direção de
                lobby usados para o diagnóstico.
              </p>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <InfoBox label="Colocação" value={tftDetails.placement} />
              <InfoBox label="Composição" value={tftDetails.composition} />
              <InfoBox
                label="Timing de level"
                value={tftDetails.level_timing}
              />
              <InfoBox
                label="Timing de rolldown"
                value={tftDetails.rolldown_timing}
              />
              <InfoBox label="Augments" value={tftDetails.augments} />
              <InfoBox label="Itens" value={tftDetails.items} />
              <InfoBox label="Contestado" value={tftDetails.contested} />
              <InfoBox label="Jogou para" value={tftDetails.played_for} />
              <InfoBox
                label="Notas de economia"
                value={tftDetails.economy_notes}
              />
            </CardContent>
          </Card>
        ) : null}

        {match.game === "valorant" && valorantDetails ? (
          <Card>
            <CardHeader>
              <CardTitle>Detalhes de Valorant</CardTitle>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Dados de agente, mapa, impacto, first deaths, utilitário e
                comunicação usados para o diagnóstico.
              </p>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <InfoBox label="Agente" value={valorantDetails.agent} />
              <InfoBox label="Função" value={valorantDetails.agent_role} />
              <InfoBox label="Mapa" value={valorantDetails.map} />
              <InfoBox label="ACS" value={valorantDetails.acs} />
              <InfoBox
                label="KDA"
                value={`${valorantDetails.kills ?? 0}/${
                  valorantDetails.deaths ?? 0
                }/${valorantDetails.assists ?? 0}`}
              />
              <InfoBox
                label="First bloods"
                value={valorantDetails.first_bloods}
              />
              <InfoBox
                label="First deaths"
                value={valorantDetails.first_deaths}
              />
              <InfoBox
                label="Notas de utilitário"
                value={valorantDetails.utility_notes}
              />
              <InfoBox
                label="Notas de comunicação"
                value={valorantDetails.communication_notes}
              />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}

function ReviewBox({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_10px_34px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600">
          {icon}
        </div>

        <p className="font-black text-slate-950">{title}</p>
      </div>

      <p className="text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function FocusCard({
  title,
  text,
  highlight = false,
}: {
  title: string;
  text: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-5 shadow-[0_10px_34px_rgba(15,23,42,0.06)] backdrop-blur ${
        highlight
          ? "border-sky-200 bg-sky-50/90"
          : "border-slate-200 bg-white/90"
      }`}
    >
      <p
        className={`text-sm font-black ${
          highlight ? "text-sky-700" : "text-slate-950"
        }`}
      >
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/88 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.07)] backdrop-blur transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_18px_44px_rgba(14,165,233,0.10)]">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-950">
        {value !== null && value !== "" ? value : "Não informado"}
      </p>
    </div>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">
        {value !== null && value !== "" ? value : "Não informado"}
      </p>
    </div>
  );
}