import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const VALID_REGIONS = ["americas", "europe", "asia", "sea"];
const VALID_GAMES = ["lol", "tft"];

export async function POST(request: Request) {
  try {
    const riotApiKey = process.env.RIOT_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!riotApiKey) {
      return NextResponse.json(
        { error: "RIOT_API_KEY não configurada no servidor." },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Variáveis do Supabase não configuradas no servidor." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const externalMatchId = String(body.externalMatchId ?? "").trim();
    const game = String(body.game ?? "").trim().toLowerCase();
    const region = String(body.region ?? "americas").trim().toLowerCase();
    const riotAccountId = String(body.riotAccountId ?? "").trim();

    if (!externalMatchId || !riotAccountId) {
      return NextResponse.json(
        { error: "Partida ou conta Riot não informada." },
        { status: 400 }
      );
    }

    if (!VALID_GAMES.includes(game)) {
      return NextResponse.json(
        { error: "Jogo inválido. Use lol ou tft." },
        { status: 400 }
      );
    }

    if (!VALID_REGIONS.includes(region)) {
      return NextResponse.json(
        { error: "Região inválida." },
        { status: 400 }
      );
    }

    const authorization = request.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authorization,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const { data: riotAccount, error: accountError } = await supabase
      .from("riot_accounts")
      .select("id, user_id, region, puuid")
      .eq("id", riotAccountId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (accountError) {
      return NextResponse.json({ error: accountError.message }, { status: 500 });
    }

    if (!riotAccount) {
      return NextResponse.json(
        { error: "Conta Riot não encontrada para este usuário." },
        { status: 404 }
      );
    }

    const detailsUrl =
      game === "lol"
        ? `https://${region}.api.riotgames.com/lol/match/v5/matches/${encodeURIComponent(
            externalMatchId
          )}`
        : `https://${region}.api.riotgames.com/tft/match/v1/matches/${encodeURIComponent(
            externalMatchId
          )}`;

    const riotResponse = await fetch(detailsUrl, {
      method: "GET",
      headers: {
        "X-Riot-Token": riotApiKey,
      },
      cache: "no-store",
    });

    const rawJson = await riotResponse.json();

    if (!riotResponse.ok) {
      return NextResponse.json(
        {
          error:
            rawJson?.status?.message ??
            "Não foi possível buscar detalhes da partida.",
          status_code: rawJson?.status?.status_code ?? riotResponse.status,
        },
        { status: riotResponse.status }
      );
    }

    const summary =
      game === "lol"
        ? summarizeLolMatch(rawJson, riotAccount.puuid)
        : summarizeTftMatch(rawJson, riotAccount.puuid);

    const { data: importedMatch, error: importError } = await supabase
      .from("riot_imported_matches")
      .upsert(
        {
          user_id: user.id,
          riot_account_id: riotAccountId,
          game,
          external_match_id: externalMatchId,
          started_at: summary.startedAt,
          duration_seconds: summary.durationSeconds,
          queue_id: summary.queueId,
          summary: summary.summary,
          result_label: summary.resultLabel,
          raw_json: rawJson,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,external_match_id",
        }
      )
      .select("*")
      .single();

    if (importError) {
      return NextResponse.json({ error: importError.message }, { status: 500 });
    }

    return NextResponse.json({
      importedMatch,
    });
  } catch {
    return NextResponse.json(
      { error: "Erro inesperado ao importar partida da Riot." },
      { status: 500 }
    );
  }
}

function summarizeLolMatch(data: any, puuid: string) {
  const participant = data?.info?.participants?.find(
    (player: any) => player?.puuid === puuid
  );

  const startedAt = data?.info?.gameStartTimestamp
    ? new Date(data.info.gameStartTimestamp).toISOString()
    : null;

  const durationSeconds =
    typeof data?.info?.gameDuration === "number" ? data.info.gameDuration : null;

  const queueId =
    typeof data?.info?.queueId === "number" ? data.info.queueId : null;

  if (!participant) {
    return {
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
    startedAt,
    durationSeconds,
    queueId,
    summary: `${champion} • ${kills}/${deaths}/${assists}`,
    resultLabel: win ? "Vitória" : "Derrota",
  };
}

function summarizeTftMatch(data: any, puuid: string) {
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
    startedAt,
    durationSeconds,
    queueId,
    summary: `Colocação: ${placement ?? "?"}º • Nível ${level ?? "?"}`,
    resultLabel:
      placement && placement <= 4 ? "Top 4" : placement ? "Bottom 4" : "TFT",
  };
}