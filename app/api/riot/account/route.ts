import { NextResponse } from "next/server";

const VALID_REGIONS = ["americas", "europe", "asia", "sea"];

export async function POST(request: Request) {
  try {
    const riotApiKey = process.env.RIOT_API_KEY;

    if (!riotApiKey) {
      return NextResponse.json(
        {
          error:
            "RIOT_API_KEY não configurada no servidor. Configure no .env.local e na Vercel.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const gameName = String(body.gameName ?? "").trim();
    const tagLine = String(body.tagLine ?? "").trim();
    const region = String(body.region ?? "americas").trim().toLowerCase();

    if (!gameName || !tagLine) {
      return NextResponse.json(
        { error: "Informe Riot ID e Tagline." },
        { status: 400 }
      );
    }

    if (!VALID_REGIONS.includes(region)) {
      return NextResponse.json(
        { error: "Região inválida." },
        { status: 400 }
      );
    }

    const url = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
      gameName
    )}/${encodeURIComponent(tagLine)}`;

    const riotResponse = await fetch(url, {
      method: "GET",
      headers: {
        "X-Riot-Token": riotApiKey,
      },
      cache: "no-store",
    });

    const data = await riotResponse.json();

    if (!riotResponse.ok) {
      return NextResponse.json(
        {
          error:
            data?.status?.message ??
            "Não foi possível buscar a conta Riot.",
          status_code: data?.status?.status_code ?? riotResponse.status,
        },
        { status: riotResponse.status }
      );
    }

    return NextResponse.json({
      puuid: data.puuid,
      gameName: data.gameName,
      tagLine: data.tagLine,
      region,
    });
  } catch {
    return NextResponse.json(
      { error: "Erro inesperado ao consultar a Riot API." },
      { status: 500 }
    );
  }
}