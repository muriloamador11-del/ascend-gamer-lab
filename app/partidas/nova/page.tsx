"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Gamepad2, Save } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { generateMatchReview } from "@/lib/diagnostics/match-review";

type Game = "league_of_legends" | "teamfight_tactics" | "valorant";

export default function NewMatchPage() {
  const router = useRouter();

  const [game, setGame] = useState<Game>("league_of_legends");
  const [result, setResult] = useState("win");
  const [rankAtTime, setRankAtTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [mentalState, setMentalState] = useState("focado");
  const [notes, setNotes] = useState("");

  const [lolChampion, setLolChampion] = useState("");
  const [lolRole, setLolRole] = useState("");
  const [lolMatchup, setLolMatchup] = useState("");
  const [lolKills, setLolKills] = useState("");
  const [lolDeaths, setLolDeaths] = useState("");
  const [lolAssists, setLolAssists] = useState("");
  const [lolCs10, setLolCs10] = useState("");
  const [lolTotalCs, setLolTotalCs] = useState("");
  const [lolVisionScore, setLolVisionScore] = useState("");
  const [lolDeathsBeforeObjective, setLolDeathsBeforeObjective] = useState("");
  const [lolLaneResult, setLolLaneResult] = useState("");
  const [lolWinCondition, setLolWinCondition] = useState("");

  const [tftPlacement, setTftPlacement] = useState("");
  const [tftComposition, setTftComposition] = useState("");
  const [tftLevelTiming, setTftLevelTiming] = useState("");
  const [tftRolldownTiming, setTftRolldownTiming] = useState("");
  const [tftAugments, setTftAugments] = useState("");
  const [tftItems, setTftItems] = useState("");
  const [tftContested, setTftContested] = useState("");
  const [tftPlayedFor, setTftPlayedFor] = useState("");
  const [tftEconomyNotes, setTftEconomyNotes] = useState("");

  const [valorantAgent, setValorantAgent] = useState("");
  const [valorantRole, setValorantRole] = useState("");
  const [valorantMap, setValorantMap] = useState("");
  const [valorantAcs, setValorantAcs] = useState("");
  const [valorantKills, setValorantKills] = useState("");
  const [valorantDeaths, setValorantDeaths] = useState("");
  const [valorantAssists, setValorantAssists] = useState("");
  const [valorantFirstBloods, setValorantFirstBloods] = useState("");
  const [valorantFirstDeaths, setValorantFirstDeaths] = useState("");
  const [valorantUtilityNotes, setValorantUtilityNotes] = useState("");
  const [valorantCommunicationNotes, setValorantCommunicationNotes] =
    useState("");

  const [isLoading, setIsLoading] = useState(false);

  async function handleSaveMatch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setIsLoading(false);
      toast.error("Faça login para registrar partidas.");
      router.push("/login");
      return;
    }

    const { data: match, error: matchError } = await supabase
      .from("matches")
      .insert({
        user_id: user.id,
        game,
        result,
        rank_at_time: rankAtTime,
        duration_minutes: toNumberOrNull(durationMinutes),
        mental_state: mentalState,
        notes,
      })
      .select("id")
      .single();

    if (matchError || !match) {
      setIsLoading(false);
      toast.error(matchError?.message ?? "Erro ao salvar partida.");
      return;
    }

    const baseReviewInput = {
      game,
      result,
      mentalState,
      notes,
    };

    let review = null;

    if (game === "league_of_legends") {
      const lolInput = {
        champion: lolChampion,
        role: lolRole,
        matchup: lolMatchup,
        kills: toNumberOrZero(lolKills),
        deaths: toNumberOrZero(lolDeaths),
        assists: toNumberOrZero(lolAssists),
        cs10: toNumberOrNull(lolCs10),
        totalCs: toNumberOrNull(lolTotalCs),
        visionScore: toNumberOrNull(lolVisionScore),
        deathsBeforeObjective: toNumberOrZero(lolDeathsBeforeObjective),
        laneResult: lolLaneResult,
        winCondition: lolWinCondition,
      };

      const { error } = await supabase.from("lol_match_details").insert({
        match_id: match.id,
        champion: lolInput.champion,
        role: lolInput.role,
        matchup: lolInput.matchup,
        kills: lolInput.kills,
        deaths: lolInput.deaths,
        assists: lolInput.assists,
        cs_10: lolInput.cs10,
        total_cs: lolInput.totalCs,
        vision_score: lolInput.visionScore,
        deaths_before_objective: lolInput.deathsBeforeObjective,
        lane_result: lolInput.laneResult,
        win_condition: lolInput.winCondition,
      });

      if (error) {
        setIsLoading(false);
        toast.error(error.message);
        return;
      }

      review = generateMatchReview({
        base: baseReviewInput,
        lol: lolInput,
      });
    }

    if (game === "teamfight_tactics") {
      const tftInput = {
        placement: toNumberOrNull(tftPlacement),
        composition: tftComposition,
        levelTiming: tftLevelTiming,
        rolldownTiming: tftRolldownTiming,
        augments: tftAugments,
        items: tftItems,
        contested: tftContested,
        playedFor: tftPlayedFor,
        economyNotes: tftEconomyNotes,
      };

      const { error } = await supabase.from("tft_match_details").insert({
        match_id: match.id,
        placement: tftInput.placement,
        composition: tftInput.composition,
        level_timing: tftInput.levelTiming,
        rolldown_timing: tftInput.rolldownTiming,
        augments: tftInput.augments,
        items: tftInput.items,
        contested: tftInput.contested,
        played_for: tftInput.playedFor,
        economy_notes: tftInput.economyNotes,
      });

      if (error) {
        setIsLoading(false);
        toast.error(error.message);
        return;
      }

      review = generateMatchReview({
        base: baseReviewInput,
        tft: tftInput,
      });
    }

    if (game === "valorant") {
      const valorantInput = {
        agent: valorantAgent,
        agentRole: valorantRole,
        map: valorantMap,
        acs: toNumberOrNull(valorantAcs),
        kills: toNumberOrZero(valorantKills),
        deaths: toNumberOrZero(valorantDeaths),
        assists: toNumberOrZero(valorantAssists),
        firstBloods: toNumberOrZero(valorantFirstBloods),
        firstDeaths: toNumberOrZero(valorantFirstDeaths),
        utilityNotes: valorantUtilityNotes,
        communicationNotes: valorantCommunicationNotes,
      };

      const { error } = await supabase.from("valorant_match_details").insert({
        match_id: match.id,
        agent: valorantInput.agent,
        agent_role: valorantInput.agentRole,
        map: valorantInput.map,
        acs: valorantInput.acs,
        kills: valorantInput.kills,
        deaths: valorantInput.deaths,
        assists: valorantInput.assists,
        first_bloods: valorantInput.firstBloods,
        first_deaths: valorantInput.firstDeaths,
        utility_notes: valorantInput.utilityNotes,
        communication_notes: valorantInput.communicationNotes,
      });

      if (error) {
        setIsLoading(false);
        toast.error(error.message);
        return;
      }

      review = generateMatchReview({
        base: baseReviewInput,
        valorant: valorantInput,
      });
    }

    if (!review) {
      setIsLoading(false);
      toast.error("Não foi possível gerar o diagnóstico da partida.");
      return;
    }

    const { error: reviewError } = await supabase.from("match_reviews").insert({
      match_id: match.id,
      user_id: user.id,
      diagnosis: review.diagnosis,
      analysis: review.analysis,
      correction: review.correction,
      training: review.training,
      next_step: review.next_step,
      biggest_mistake: review.biggest_mistake,
      recurring_pattern: review.recurring_pattern,
    });

    if (reviewError) {
      setIsLoading(false);
      toast.error(reviewError.message);
      return;
    }

    const { error: goalError } = await supabase.from("weekly_goals").insert({
      user_id: user.id,
      match_id: match.id,
      game,
      title: review.goal_title,
      description: review.goal_description,
      status: "active",
    });

    if (goalError) {
      setIsLoading(false);
      toast.error(goalError.message);
      return;
    }

    setIsLoading(false);
    toast.success("Partida registrada, analisada e meta criada.");
    router.push(`/partidas/${match.id}`);
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
                <Badge className="mb-3">Registro pós-partida</Badge>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Nova partida
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Registre os principais dados da partida. O Ascend vai gerar
                  diagnóstico, review e uma meta prática para sua próxima
                  partida.
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

        <form onSubmit={handleSaveMatch} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados gerais</CardTitle>
              <p className="text-sm leading-6 text-slate-500">
                Informações-base usadas para classificar a partida e gerar o
                diagnóstico inicial.
              </p>
            </CardHeader>

            <CardContent className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <SelectField
                label="Jogo"
                value={game}
                onChange={(value) => setGame(value as Game)}
                options={[
                  ["league_of_legends", "League of Legends"],
                  ["teamfight_tactics", "Teamfight Tactics"],
                  ["valorant", "Valorant"],
                ]}
              />

              <SelectField
                label="Resultado"
                value={result}
                onChange={setResult}
                options={[
                  ["win", "Vitória"],
                  ["loss", "Derrota"],
                  ["draw", "Empate"],
                  ["top_4", "Top 4"],
                  ["bottom_4", "Bottom 4"],
                ]}
              />

              <Field
                label="Rank no momento"
                placeholder="Ex: Prata 2"
                value={rankAtTime}
                onChange={setRankAtTime}
              />

              <Field
                label="Duração em minutos"
                placeholder="Ex: 32"
                value={durationMinutes}
                onChange={setDurationMinutes}
              />

              <SelectField
                label="Estado mental"
                value={mentalState}
                onChange={setMentalState}
                options={[
                  ["focado", "Focado"],
                  ["neutro", "Neutro"],
                  ["cansado", "Cansado"],
                  ["tiltado", "Tiltado"],
                  ["ansioso", "Ansioso"],
                  ["confiante", "Confiante"],
                ]}
              />

              <div className="space-y-2 lg:col-span-3">
                <Label className="text-sm font-semibold text-slate-700">
                  Anotações rápidas
                </Label>
                <Textarea
                  placeholder="O que você sentiu que decidiu a partida?"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {game === "league_of_legends" ? (
            <Card>
              <CardHeader>
                <CardTitle>League of Legends</CardTitle>
                <p className="text-sm leading-6 text-slate-500">
                  Dados de rota, matchup, farm, visão e impacto em objetivos.
                </p>
              </CardHeader>

              <CardContent className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <Field label="Campeão" placeholder="Ex: Ahri" value={lolChampion} onChange={setLolChampion} />
                <Field label="Rota" placeholder="Ex: Mid" value={lolRole} onChange={setLolRole} />
                <Field label="Matchup" placeholder="Ex: Ahri vs Zed" value={lolMatchup} onChange={setLolMatchup} />
                <Field label="Resultado da lane" placeholder="Ganhou / perdeu / even" value={lolLaneResult} onChange={setLolLaneResult} />
                <Field label="Kills" placeholder="Ex: 8" value={lolKills} onChange={setLolKills} />
                <Field label="Deaths" placeholder="Ex: 4" value={lolDeaths} onChange={setLolDeaths} />
                <Field label="Assists" placeholder="Ex: 10" value={lolAssists} onChange={setLolAssists} />
                <Field label="CS aos 10min" placeholder="Ex: 72" value={lolCs10} onChange={setLolCs10} />
                <Field label="CS total" placeholder="Ex: 210" value={lolTotalCs} onChange={setLolTotalCs} />
                <Field label="Vision score" placeholder="Ex: 28" value={lolVisionScore} onChange={setLolVisionScore} />
                <Field label="Mortes antes de objetivo" placeholder="Ex: 2" value={lolDeathsBeforeObjective} onChange={setLolDeathsBeforeObjective} />
                <Field label="Condição de vitória" placeholder="Ex: jogar para bot/objectives" value={lolWinCondition} onChange={setLolWinCondition} />
              </CardContent>
            </Card>
          ) : null}

          {game === "teamfight_tactics" ? (
            <Card>
              <CardHeader>
                <CardTitle>Teamfight Tactics</CardTitle>
                <p className="text-sm leading-6 text-slate-500">
                  Dados de composição, economia, rolldown, scouting e direção de
                  lobby.
                </p>
              </CardHeader>

              <CardContent className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <Field label="Colocação" placeholder="Ex: 3" value={tftPlacement} onChange={setTftPlacement} />
                <Field label="Composição" placeholder="Ex: AP Flex" value={tftComposition} onChange={setTftComposition} />
                <Field label="Timing de level" placeholder="Ex: 6 no 3-2, 8 no 4-2" value={tftLevelTiming} onChange={setTftLevelTiming} />
                <Field label="Timing de rolldown" placeholder="Ex: rolou no 4-1" value={tftRolldownTiming} onChange={setTftRolldownTiming} />
                <Field label="Augments" placeholder="Ex: combat + econ" value={tftAugments} onChange={setTftAugments} />
                <Field label="Itens principais" placeholder="Ex: Shojin, Nashor, JG" value={tftItems} onChange={setTftItems} />
                <Field label="Estava contestado?" placeholder="Sim / Não / pouco" value={tftContested} onChange={setTftContested} />
                <Field label="Jogou para" placeholder="Top 4 / Top 1" value={tftPlayedFor} onChange={setTftPlayedFor} />
                <Field label="Notas de economia" placeholder="Ex: fiquei rico, mas fraco" value={tftEconomyNotes} onChange={setTftEconomyNotes} />
              </CardContent>
            </Card>
          ) : null}

          {game === "valorant" ? (
            <Card>
              <CardHeader>
                <CardTitle>Valorant</CardTitle>
                <p className="text-sm leading-6 text-slate-500">
                  Dados de agente, mapa, impacto, first deaths, utilitário e
                  comunicação.
                </p>
              </CardHeader>

              <CardContent className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <Field label="Agente" placeholder="Ex: Omen" value={valorantAgent} onChange={setValorantAgent} />
                <Field label="Função" placeholder="Ex: Controlador" value={valorantRole} onChange={setValorantRole} />
                <Field label="Mapa" placeholder="Ex: Ascent" value={valorantMap} onChange={setValorantMap} />
                <Field label="ACS" placeholder="Ex: 218" value={valorantAcs} onChange={setValorantAcs} />
                <Field label="Kills" placeholder="Ex: 18" value={valorantKills} onChange={setValorantKills} />
                <Field label="Deaths" placeholder="Ex: 14" value={valorantDeaths} onChange={setValorantDeaths} />
                <Field label="Assists" placeholder="Ex: 7" value={valorantAssists} onChange={setValorantAssists} />
                <Field label="First bloods" placeholder="Ex: 3" value={valorantFirstBloods} onChange={setValorantFirstBloods} />
                <Field label="First deaths" placeholder="Ex: 4" value={valorantFirstDeaths} onChange={setValorantFirstDeaths} />
                <Field label="Notas de utilitário" placeholder="Ex: usei smokes tarde" value={valorantUtilityNotes} onChange={setValorantUtilityNotes} />
                <Field label="Notas de comunicação" placeholder="Ex: calleis pouco no retake" value={valorantCommunicationNotes} onChange={setValorantCommunicationNotes} />
              </CardContent>
            </Card>
          ) : null}

          <div className="rounded-3xl border border-slate-200 bg-white/88 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.07)] backdrop-blur">
            <Button size="lg" className="h-12 w-full" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading
                ? "Salvando, analisando e criando meta..."
                : "Salvar, analisar e criar meta"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-slate-700">{label}</Label>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-slate-700">{label}</Label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full px-3 text-sm"
      >
        {options.map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

function toNumberOrNull(value: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function toNumberOrZero(value: string) {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}