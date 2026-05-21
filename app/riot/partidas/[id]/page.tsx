"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  Clock,
  Eye,
  Gamepad2,
  ShieldCheck,
  Sword,
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

type RiotImportedMatch = {
  id: string;
  user_id: string;
  riot_account_id: string;
  game: "lol" | "tft";
  external_match_id: string;
  started_at: string | null;
  duration_seconds: number | null;
  queue_id: number | null;
  summary: string | null;
  result_label: string | null;
  raw_json: any;
  created_at: string;
};

type LolAnalysis = {
  champion: string;
  role: string;
  result: string;
  kills: number;
  deaths: number;
  assists: number;
  kda: string;
  cs: number;
  csPerMinute: string;
  visionScore: number;
  damageToChampions: number;
  goldEarned: number;
  wardsPlaced: number;
  controlWardsBought: number;
  killParticipation: string;
  diagnosis: string;
  correction: string;
  nextStep: string;
};

type TftAnalysis = {
  placement: number | null;
  level: number | null;
  goldLeft: number | null;
  playersEliminated: number | null;
  totalDamageToPlayers: number | null;
  traits: string;
  units: string;
  augments: string;
  result: string;
  diagnosis: string;
  correction: string;
  nextStep: string;
};

export default function RiotMatchDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const importedMatchId = String(params.id);

  const [match, setMatch] = useState<RiotImportedMatch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const lolAnalysis = useMemo(() => {
    if (!match || match.game !== "lol") return null;
    return analyzeLolMatch(match);
  }, [match]);

  const tftAnalysis = useMemo(() => {
    if (!match || match.game !== "tft") return null;
    return analyzeTftMatch(match);
  }, [match]);

  useEffect(() => {
    async function loadMatch() {
      setIsLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Faça login para acessar a partida importada.");
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("riot_imported_matches")
        .select("*")
        .eq("id", importedMatchId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      if (!data) {
        toast.error("Partida importada não encontrada.");
        router.push("/integracoes/riot");
        return;
      }

      setMatch(data as RiotImportedMatch);
      setIsLoading(false);
    }

    loadMatch();
  }, [importedMatchId, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-sky-200 bg-white shadow-lg">
            <Gamepad2 className="h-8 w-8 text-sky-600 animate-pulse" />
          </div>
          <p className="text-sm text-slate-500">
            Carregando partida importada...
          </p>
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
                <Badge className="mb-3">Partida importada</Badge>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  {match.game === "lol"
                    ? "League of Legends"
                    : "Teamfight Tactics"}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Análise inicial baseada nos dados oficiais importados pela
                  Riot API.
                </p>
              </div>
            </div>

            <Button asChild variant="outline">
              <Link href="/integracoes/riot">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para integrações
              </Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            icon={<Trophy className="h-5 w-5" />}
            label="Resultado"
            value={match.result_label ?? "Não identificado"}
          />

          <InfoCard
            icon={<Clock className="h-5 w-5" />}
            label="Duração"
            value={
              match.duration_seconds
                ? formatDuration(match.duration_seconds)
                : "Não informado"
            }
          />

          <InfoCard
            icon={<Target className="h-5 w-5" />}
            label="Queue"
            value={match.queue_id ? String(match.queue_id) : "Não informado"}
          />

          <InfoCard
            icon={<Gamepad2 className="h-5 w-5" />}
            label="Data"
            value={
              match.started_at ? formatDateTime(match.started_at) : "Sem data"
            }
          />
        </section>

        {lolAnalysis ? <LolReport analysis={lolAnalysis} /> : null}

        {tftAnalysis ? <TftReport analysis={tftAnalysis} /> : null}

        <Card>
          <CardHeader>
            <CardTitle>Dados técnicos</CardTitle>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Identificadores usados para rastrear a partida importada.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <InfoBox label="ID interno" value={match.id} />
            <InfoBox label="ID Riot" value={match.external_match_id} />
            <InfoBox
              label="Resumo salvo"
              value={match.summary ?? "Resumo indisponível"}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function LolReport({ analysis }: { analysis: LolAnalysis }) {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          icon={<Sword className="h-5 w-5" />}
          label="Campeão"
          value={analysis.champion}
        />

        <InfoCard
          icon={<Target className="h-5 w-5" />}
          label="Função"
          value={analysis.role}
        />

        <InfoCard
          icon={<Sword className="h-5 w-5" />}
          label="KDA"
          value={analysis.kda}
        />

        <InfoCard
          icon={<Eye className="h-5 w-5" />}
          label="Vision Score"
          value={String(analysis.visionScore)}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas reais da partida</CardTitle>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Dados processados a partir do JSON oficial importado.
            </p>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoBox label="Kills" value={String(analysis.kills)} />
            <InfoBox label="Deaths" value={String(analysis.deaths)} />
            <InfoBox label="Assists" value={String(analysis.assists)} />
            <InfoBox label="CS total" value={String(analysis.cs)} />
            <InfoBox label="CS/min" value={analysis.csPerMinute} />
            <InfoBox
              label="Dano em campeões"
              value={String(analysis.damageToChampions)}
            />
            <InfoBox label="Gold ganho" value={String(analysis.goldEarned)} />
            <InfoBox
              label="Wards colocadas"
              value={String(analysis.wardsPlaced)}
            />
            <InfoBox
              label="Control wards compradas"
              value={String(analysis.controlWardsBought)}
            />
            <InfoBox
              label="Kill participation"
              value={analysis.killParticipation}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leitura rápida</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <ReviewBlock
              icon={<Brain className="h-5 w-5" />}
              title="Diagnóstico"
              text={analysis.diagnosis}
            />

            <ReviewBlock
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Correção"
              text={analysis.correction}
            />

            <ReviewBlock
              icon={<Target className="h-5 w-5" />}
              title="Próximo passo"
              text={analysis.nextStep}
              highlight
            />
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function TftReport({ analysis }: { analysis: TftAnalysis }) {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          icon={<Trophy className="h-5 w-5" />}
          label="Colocação"
          value={analysis.placement ? `${analysis.placement}º` : "?"}
        />

        <InfoCard
          icon={<Gamepad2 className="h-5 w-5" />}
          label="Nível"
          value={analysis.level ? String(analysis.level) : "?"}
        />

        <InfoCard
          icon={<Sword className="h-5 w-5" />}
          label="Dano em jogadores"
          value={
            analysis.totalDamageToPlayers !== null
              ? String(analysis.totalDamageToPlayers)
              : "?"
          }
        />

        <InfoCard
          icon={<Target className="h-5 w-5" />}
          label="Resultado"
          value={analysis.result}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas reais da partida</CardTitle>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Dados processados a partir do JSON oficial importado.
            </p>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2">
            <InfoBox
              label="Gold restante"
              value={
                analysis.goldLeft !== null ? String(analysis.goldLeft) : "?"
              }
            />
            <InfoBox
              label="Players eliminados"
              value={
                analysis.playersEliminated !== null
                  ? String(analysis.playersEliminated)
                  : "?"
              }
            />
            <InfoBox label="Traits" value={analysis.traits} />
            <InfoBox label="Unidades" value={analysis.units} />
            <InfoBox label="Augments" value={analysis.augments} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leitura rápida</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <ReviewBlock
              icon={<Brain className="h-5 w-5" />}
              title="Diagnóstico"
              text={analysis.diagnosis}
            />

            <ReviewBlock
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Correção"
              text={analysis.correction}
            />

            <ReviewBlock
              icon={<Target className="h-5 w-5" />}
              title="Próximo passo"
              text={analysis.nextStep}
              highlight
            />
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function analyzeLolMatch(match: RiotImportedMatch): LolAnalysis {
  const data = match.raw_json;

  const participant = data?.info?.participants?.find((player: any) => {
    const summary = match.summary ?? "";
    return summary.includes(player?.championName);
  });

  const fallbackParticipant = data?.info?.participants?.[0];
  const player = participant ?? fallbackParticipant;

  const durationSeconds =
    typeof data?.info?.gameDuration === "number" ? data.info.gameDuration : 0;

  const minutes = durationSeconds > 0 ? durationSeconds / 60 : 1;

  const kills = Number(player?.kills ?? 0);
  const deaths = Number(player?.deaths ?? 0);
  const assists = Number(player?.assists ?? 0);

  const cs =
    Number(player?.totalMinionsKilled ?? 0) +
    Number(player?.neutralMinionsKilled ?? 0);

  const csPerMinute = (cs / minutes).toFixed(1);

  const teamId = player?.teamId;
  const teamKills =
    data?.info?.participants
      ?.filter((participant: any) => participant.teamId === teamId)
      ?.reduce(
        (total: number, participant: any) => total + Number(participant.kills ?? 0),
        0
      ) ?? 0;

  const killParticipation =
    teamKills > 0 ? `${Math.round(((kills + assists) / teamKills) * 100)}%` : "0%";

  const visionScore = Number(player?.visionScore ?? 0);
  const damageToChampions = Number(player?.totalDamageDealtToChampions ?? 0);
  const goldEarned = Number(player?.goldEarned ?? 0);
  const wardsPlaced = Number(player?.wardsPlaced ?? 0);
  const controlWardsBought = Number(player?.visionWardsBoughtInGame ?? 0);

  const diagnosisData = buildLolDiagnosis({
    deaths,
    csPerMinute: Number(csPerMinute),
    visionScore,
    durationMinutes: minutes,
    killParticipation,
    result: match.result_label ?? "",
  });

  return {
    champion: player?.championName ?? "Campeão não identificado",
    role: player?.teamPosition || player?.individualPosition || "Não informado",
    result: match.result_label ?? "Resultado não identificado",
    kills,
    deaths,
    assists,
    kda: `${kills}/${deaths}/${assists}`,
    cs,
    csPerMinute,
    visionScore,
    damageToChampions,
    goldEarned,
    wardsPlaced,
    controlWardsBought,
    killParticipation,
    diagnosis: diagnosisData.diagnosis,
    correction: diagnosisData.correction,
    nextStep: diagnosisData.nextStep,
  };
}

function buildLolDiagnosis({
  deaths,
  csPerMinute,
  visionScore,
  durationMinutes,
  killParticipation,
  result,
}: {
  deaths: number;
  csPerMinute: number;
  visionScore: number;
  durationMinutes: number;
  killParticipation: string;
  result: string;
}) {
  const visionPerMinute = visionScore / Math.max(durationMinutes, 1);

  if (deaths >= 8) {
    return {
      diagnosis:
        "O maior ponto de atenção foi o volume de mortes. Com esse número de deaths, você provavelmente perdeu tempo ativo no mapa e entregou janelas de objetivo.",
      correction:
        "Depois da segunda morte, reduza risco: jogue com visão, evite side avançado sem informação e pare de iniciar luta sem vantagem numérica.",
      nextStep:
        "Na próxima partida, sua meta é terminar com no máximo 5 mortes e revisar toda morte sem visão ou antes de objetivo.",
    };
  }

  if (csPerMinute < 5.5) {
    return {
      diagnosis:
        "Seu CS por minuto ficou baixo para uma análise competitiva. Isso indica perda de recurso constante durante a partida.",
      correction:
        "Priorize wave antes de roam e lute apenas quando a wave estiver resolvida ou quando o ganho no mapa compensar a perda de farm.",
      nextStep:
        "Na próxima partida, acompanhe seu CS aos 10 e 15 minutos. Meta inicial: aproximar de 6.5 CS/min.",
    };
  }

  if (visionPerMinute < 0.6) {
    return {
      diagnosis:
        "Seu impacto de visão parece baixo para a duração da partida. Isso limita leitura de mapa, objetivos e segurança nas rotações.",
      correction:
        "Compre controle ward em resets importantes e prepare visão 60 segundos antes de dragão, arauto ou barão.",
      nextStep:
        "Na próxima partida, compre controle ward antes dos objetivos grandes e evite entrar no rio sem informação.",
    };
  }

  if (result === "Derrota") {
    return {
      diagnosis:
        "A partida terminou em derrota sem um erro estatístico único dominante. O foco deve ser cruzar KDA, farm, visão e participação para achar onde a vantagem não foi convertida.",
      correction:
        "Escolha uma métrica principal por partida: mortes, CS/min, visão ou participação. Melhorar tudo ao mesmo tempo reduz execução.",
      nextStep:
        "Na próxima partida, escolha uma meta antes do jogo e registre se ela foi cumprida.",
    };
  }

  return {
    diagnosis:
      "A partida teve indicadores aceitáveis. O próximo ganho de performance vem de consistência: manter farm, visão e baixa quantidade de mortes ao mesmo tempo.",
    correction:
      "Não transforme vantagem em risco desnecessário. Continue jogando em torno de wave, visão e objetivos.",
    nextStep:
      "Na próxima partida, mantenha o mesmo padrão e escolha uma métrica para otimizar.",
  };
}

function analyzeTftMatch(match: RiotImportedMatch): TftAnalysis {
  const data = match.raw_json;

  const participant =
    data?.info?.participants?.find((player: any) => {
      const result = match.result_label ?? "";
      return result.includes("Top") || player?.placement;
    }) ?? data?.info?.participants?.[0];

  const placement =
    typeof participant?.placement === "number" ? participant.placement : null;

  const level =
    typeof participant?.level === "number" ? participant.level : null;

  const goldLeft =
    typeof participant?.gold_left === "number" ? participant.gold_left : null;

  const playersEliminated =
    typeof participant?.players_eliminated === "number"
      ? participant.players_eliminated
      : null;

  const totalDamageToPlayers =
    typeof participant?.total_damage_to_players === "number"
      ? participant.total_damage_to_players
      : null;

  const traits =
    participant?.traits
      ?.filter((trait: any) => Number(trait?.tier_current ?? 0) > 0)
      ?.map((trait: any) => `${trait.name?.replace("TFT_", "")} ${trait.tier_current}`)
      ?.slice(0, 8)
      ?.join(", ") || "Não identificado";

  const units =
    participant?.units
      ?.map((unit: any) => {
        const name = String(unit.character_id ?? "").replace("TFT_", "");
        const tier = unit.tier ? `${unit.tier}★` : "?★";
        return `${name} ${tier}`;
      })
      ?.slice(0, 10)
      ?.join(", ") || "Não identificado";

  const augments =
    participant?.augments
      ?.map((augment: string) => augment.replace("TFT_", ""))
      ?.join(", ") || "Não identificado";

  const diagnosisData = buildTftDiagnosis({
    placement,
    level,
    goldLeft,
    playersEliminated,
  });

  return {
    placement,
    level,
    goldLeft,
    playersEliminated,
    totalDamageToPlayers,
    traits,
    units,
    augments,
    result:
      placement && placement <= 4
        ? "Top 4"
        : placement
          ? "Bottom 4"
          : "Não identificado",
    diagnosis: diagnosisData.diagnosis,
    correction: diagnosisData.correction,
    nextStep: diagnosisData.nextStep,
  };
}

function buildTftDiagnosis({
  placement,
  level,
  goldLeft,
  playersEliminated,
}: {
  placement: number | null;
  level: number | null;
  goldLeft: number | null;
  playersEliminated: number | null;
}) {
  if (placement && placement >= 5) {
    return {
      diagnosis:
        "A partida terminou fora do Top 4. O principal ponto de investigação é se você estabilizou tarde, jogou uma composição contestada ou não converteu economia em força no stage 4.",
      correction:
        "Quando estiver fraco no stage 4, jogue para Top 4: role para estabilizar, aceite upgrades intermediários e preserve HP.",
      nextStep:
        "Na próxima partida, defina no 4-1 se você está jogando para Top 4 ou Top 1 com base em HP, board e economia.",
    };
  }

  if (placement && placement <= 2) {
    return {
      diagnosis:
        "A partida teve resultado forte. O foco agora é identificar o que tornou o board estável: itens, augments, direção de comp ou timing de level.",
      correction:
        "Repita o processo, não apenas a composição. Observe qual decisão gerou seu spike principal.",
      nextStep:
        "Na próxima partida, tente replicar o timing de spike e anote se o lobby estava contestado.",
    };
  }

  if (goldLeft !== null && goldLeft < 2 && placement && placement >= 4) {
    return {
      diagnosis:
        "Você terminou com pouco gold e colocação mediana/baixa. Pode ter rolado tudo, mas sem converter o suficiente em força final.",
      correction:
        "Faça rolldown com objetivo claro: completar pares, estabilizar carry ou subir qualidade do frontline.",
      nextStep:
        "Na próxima partida, antes do rolldown, defina quais 3 upgrades realmente estabilizam seu board.",
    };
  }

  return {
    diagnosis:
      "A partida não mostrou um padrão único dominante pelos dados básicos. O próximo passo é cruzar placement, augments, unidades, itens e força do lobby.",
    correction:
      "Use checkpoints no 3-2 e 4-1 para avaliar se seu board está forte, médio ou fraco.",
    nextStep:
      "Na próxima partida, anote no 3-2 e 4-1: HP, gold, level, board forte/médio/fraco e se sua comp está contestada.",
  };
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/88 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.07)] backdrop-blur">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600">
        {icon}
      </div>

      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function ReviewBlock({
  icon,
  title,
  text,
  highlight = false,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-4 ${
        highlight
          ? "border-sky-200 bg-sky-50/90"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-white text-sky-600">
          {icon}
        </div>

        <p className="font-black text-slate-950">{title}</p>
      </div>

      <p className="text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);

  if (minutes <= 0) {
    return `${seconds}s`;
  }

  return `${minutes}min`;
}