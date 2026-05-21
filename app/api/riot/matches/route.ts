import { NextResponse } from "next/server";

const VALID_REGIONS = ["americas", "europe", "asia", "sea"];
const VALID_GAMES = ["lol", "tft"];

type RiotMatchSummary = {
  externalMatchId: string;
  game: "lol" | "tft";
  startedAt: string | null;
  durationSeconds: number | null;
  queueId: number | null;
  summary: string;
  resultLabel: string;
};

export async function POST(request: Request) {
  try {
    const riotApiKey = process.env.RIOT_API_KEY;

    if (!riotApiKey) {
      return NextResponse.json(
        {
          error:
            "RIOT_API_KEY não configurada no servidor. Configure na Vercel e faça redeploy.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const puuid = String(body.puuid ?? "").trim();
    const region = String(body.region ?? "americas").trim().toLowerCase();
    const game = String(body.game ?? "lol").trim().toLowerCase();
    const count = Math.min(Number(body.count ?? 10), 10);

    if (!puuid) {
      return NextResponse.json(
        { error: "PUUID não informado." },
        { status: 400 }
      );
    }

    if (!VALID_REGIONS.includes(region)) {
      return NextResponse.json(
        { error: "Região inválida." },
        { status: 400 }
      );
    }

    if (!VALID_GAMES.includes(game)) {
      return NextResponse.json(
        { error: "Jogo inválido. Use lol ou tft." },
        { status: 400 }
      );
    }

    const idsUrl =
      game === "lol"
        ? `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(
            puuid
          )}/ids?start=0&count=${count}`
        : `https://${region}.api.riotgames.com/tft/match/v1/matches/by-puuid/${encodeURIComponent(
            puuid
          )}/ids?start=0&count=${count}`;

    const idsResponse = await fetch(idsUrl, {
      method: "GET",
      headers: {
        "X-Riot-Token": riotApiKey,
      },
      cache: "no-store",
    });

    const idsData = await idsResponse.json();

    if (!idsResponse.ok) {
      return NextResponse.json(
        {
          error:
            idsData?.status?.message ??
            "Não foi possível buscar IDs de partidas.",
          status_code: idsData?.status?.status_code ?? idsResponse.status,
        },
        { status: idsResponse.status }
      );
    }

    if (!Array.isArray(idsData)) {
      return NextResponse.json(
        { error: "Resposta inesperada da Riot API ao buscar partidas." },
        { status: 500 }
      );
    }

    const matchIds = idsData as string[];

    const matches = await Promise.all(
      matchIds.map(async (matchId) => {
        const detailsUrl =
          game === "lol"
            ? `https://${region}.api.riotgames.com/lol/match/v5/matches/${encodeURIComponent(
                matchId
              )}`
            : `https://${region}.api.riotgames.com/tft/match/v1/matches/${encodeURIComponent(
                matchId
              )}`;

        const detailsResponse = await fetch(detailsUrl, {
          method: "GET",
          headers: {
            "X-Riot-Token": riotApiKey,
          },
          cache: "no-store",
        });

        const detailsData = await detailsResponse.json();

        if (!detailsResponse.ok) {
          return null;
        }

        if (game === "lol") {
          return summarizeLolMatch(detailsData, puuid, matchId);
        }

        return summarizeTftMatch(detailsData, puuid, matchId);
      })
    );

    return NextResponse.json({
      matches: matches.filter(Boolean),
    });
  } catch {
    return NextResponse.json(
      { error: "Erro inesperado ao buscar partidas da Riot." },
      { status: 500 }
    );
  }
}

function summarizeLolMatch(
  data: any,
  puuid: string,
  matchId: string
): RiotMatchSummary {
  const participant = data?.info?.participants?.find(
    (player: any) => player?.puuid === puuid
  );

  const startedAt = data?.info?.gameStartTimestamp
    ? new Date(data.info.gameStartTimestamp).toISOString()
    : null;

  const durationSeconds =
    typeof data?.info?.gameDuration === "number"
      ? data.info.gameDuration
      : null;

  const queueId =
    typeof data?.info?.queueId === "number" ? data.info.queueId : null;

  if (!participant) {
    return {
      externalMatchId: matchId,
      game: "lol",
      startedAt,
      durationSeconds,
      queueId,
      summary: "Partida de League of Legends",
      resultLabel: "Resultado não identificado",
    };
  }

  const champion = participant.championName ?? "Campeão desconhecido";
  const kills = participant.kills ?? 0;
  const deaths = participant.deaths ?? 0;
  const assists = participant.assists ?? 0;
  const win = Boolean(participant.win);

  return {
    externalMatchId: matchId,
    game: "lol",
    startedAt,
    durationSeconds,
    queueId,
    summary: `${champion} • ${kills}/${deaths}/${assists}`,
    resultLabel: win ? "Vitória" : "Derrota",
  };
}

function summarizeTftMatch(
  data: any,
  puuid: string,
  matchId: string
): RiotMatchSummary {
  const participant = data?.info?.participants?.find(
    (player: any) => player?.puuid === puuid
  );

  const startedAt = data?.info?.game_datetime
    ? new Date(data.info.game_datetime).toISOString()
    : null;

  const durationSeconds =
    typeof data?.info?.game_length === "number"
      ? Math.round(data.info.game_length)
      : null;

  const queueId =
    typeof data?.info?.queue_id === "number" ? data.info.queue_id : null;

  if (!participant) {
    return {
      externalMatchId: matchId,
      game: "tft",
      startedAt,
      durationSeconds,
      queueId,
      summary: "Partida de Teamfight Tactics",
      resultLabel: "Colocação não identificada",
    };
  }

  const placement = participant.placement ?? null;
  const level = participant.level ?? null;

  return {
    externalMatchId: matchId,
    game: "tft",
    startedAt,
    durationSeconds,
    queueId,
    summary: `Colocação: ${placement ?? "?"}º • Nível ${level ?? "?"}`,
    resultLabel:
      placement && placement <= 4 ? "Top 4" : placement ? "Bottom 4" : "TFT",
  };
}