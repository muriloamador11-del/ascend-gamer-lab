"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Gamepad2,
  Link2,
  Save,
  Search,
  ShieldCheck,
  Trash2,
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
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";

type RiotRegion = "americas" | "europe" | "asia" | "sea";
type RiotGame = "lol" | "tft";

type RiotAccount = {
  id: string;
  user_id: string;
  game_name: string;
  tag_line: string;
  region: string;
  puuid: string;
  created_at: string;
  updated_at: string;
};

type RiotImportedMatch = {
  id: string;
  user_id: string;
  riot_account_id: string;
  game: string;
  external_match_id: string;
  started_at: string | null;
  duration_seconds: number | null;
  queue_id: number | null;
  summary: string | null;
  result_label: string | null;
  created_at: string;
};

type RiotLookupResponse = {
  puuid?: string;
  gameName?: string;
  tagLine?: string;
  region?: string;
  error?: string;
};

type RiotMatchSummary = {
  externalMatchId: string;
  game: "lol" | "tft";
  startedAt: string | null;
  durationSeconds: number | null;
  queueId: number | null;
  summary: string;
  resultLabel: string;
};

type RiotMatchesResponse = {
  matches?: RiotMatchSummary[];
  error?: string;
};

type RiotImportResponse = {
  importedMatch?: RiotImportedMatch;
  error?: string;
};

const regionLabels: Record<RiotRegion, string> = {
  americas: "Americas",
  europe: "Europe",
  asia: "Asia",
  sea: "SEA",
};

const gameLabels: Record<RiotGame, string> = {
  lol: "League of Legends",
  tft: "Teamfight Tactics",
};

export default function RiotIntegrationPage() {
  const router = useRouter();

  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [region, setRegion] = useState<RiotRegion>("americas");

  const [accounts, setAccounts] = useState<RiotAccount[]>([]);
  const [importedMatches, setImportedMatches] = useState<RiotImportedMatch[]>(
    []
  );

  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedGame, setSelectedGame] = useState<RiotGame>("lol");
  const [riotMatches, setRiotMatches] = useState<RiotMatchSummary[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSearchingMatches, setIsSearchingMatches] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [importingMatchId, setImportingMatchId] = useState<string | null>(null);

  const selectedAccount =
    accounts.find((account) => account.id === selectedAccountId) ?? null;

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadInitialData() {
    setIsLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error("Faça login para acessar integrações.");
      router.push("/login");
      return;
    }

    const { data: accountsData, error: accountsError } = await supabase
      .from("riot_accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (accountsError) {
      toast.error(accountsError.message);
      setIsLoading(false);
      return;
    }

    const { data: importedData, error: importedError } = await supabase
      .from("riot_imported_matches")
      .select(
        "id, user_id, riot_account_id, game, external_match_id, started_at, duration_seconds, queue_id, summary, result_label, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (importedError) {
      toast.error(importedError.message);
      setIsLoading(false);
      return;
    }

    const loadedAccounts = accountsData ?? [];

    setAccounts(loadedAccounts);
    setImportedMatches(importedData ?? []);

    if (loadedAccounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(loadedAccounts[0].id);
    }

    setIsLoading(false);
  }

  async function reloadImportedMatches() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("riot_imported_matches")
      .select(
        "id, user_id, riot_account_id, game, external_match_id, started_at, duration_seconds, queue_id, summary, result_label, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      return;
    }

    setImportedMatches(data ?? []);
  }

  async function handleConnectRiot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanGameName = gameName.trim();
    const cleanTagLine = tagLine.trim().replace("#", "");

    if (!cleanGameName || !cleanTagLine) {
      toast.error("Informe Riot Game Name e Tagline.");
      return;
    }

    setIsConnecting(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setIsConnecting(false);
      toast.error("Faça login para conectar uma conta Riot.");
      router.push("/login");
      return;
    }

    let riotData: RiotLookupResponse;

    try {
      const response = await fetch("/api/riot/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameName: cleanGameName,
          tagLine: cleanTagLine,
          region,
        }),
      });

      riotData = (await response.json()) as RiotLookupResponse;

      if (!response.ok) {
        setIsConnecting(false);
        toast.error(
          riotData.error ?? "Não foi possível conectar a conta Riot."
        );
        return;
      }
    } catch {
      setIsConnecting(false);
      toast.error("Erro ao consultar o servidor do Ascend.");
      return;
    }

    if (!riotData.puuid || !riotData.gameName || !riotData.tagLine) {
      setIsConnecting(false);
      toast.error("A Riot API não retornou dados suficientes da conta.");
      return;
    }

    const { error: saveError } = await supabase.from("riot_accounts").upsert(
      {
        user_id: user.id,
        game_name: riotData.gameName,
        tag_line: riotData.tagLine,
        region: riotData.region ?? region,
        puuid: riotData.puuid,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,puuid",
      }
    );

    setIsConnecting(false);

    if (saveError) {
      toast.error(saveError.message);
      return;
    }

    toast.success("Conta Riot conectada com sucesso.");
    setGameName("");
    setTagLine("");
    await loadInitialData();
  }

  async function handleSearchMatches() {
    if (!selectedAccount) {
      toast.error("Selecione uma conta Riot conectada.");
      return;
    }

    setIsSearchingMatches(true);
    setRiotMatches([]);

    try {
      const response = await fetch("/api/riot/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          puuid: selectedAccount.puuid,
          region: selectedAccount.region,
          game: selectedGame,
          count: 10,
        }),
      });

      const data = (await response.json()) as RiotMatchesResponse;

      setIsSearchingMatches(false);

      if (!response.ok) {
        toast.error(data.error ?? "Não foi possível buscar partidas.");
        return;
      }

      setRiotMatches(data.matches ?? []);

      if (!data.matches || data.matches.length === 0) {
        toast.info("Nenhuma partida encontrada para esse jogo.");
        return;
      }

      toast.success("Partidas carregadas com sucesso.");
    } catch {
      setIsSearchingMatches(false);
      toast.error("Erro ao consultar partidas no servidor.");
    }
  }

  async function handleImportMatch(match: RiotMatchSummary) {
    if (!selectedAccount) {
      toast.error("Selecione uma conta Riot conectada.");
      return;
    }

    setImportingMatchId(match.externalMatchId);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setImportingMatchId(null);
      toast.error("Sessão expirada. Faça login novamente.");
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("/api/riot/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          externalMatchId: match.externalMatchId,
          game: match.game,
          region: selectedAccount.region,
          riotAccountId: selectedAccount.id,
        }),
      });

      const data = (await response.json()) as RiotImportResponse;

      setImportingMatchId(null);

      if (!response.ok) {
        toast.error(data.error ?? "Não foi possível importar a partida.");
        return;
      }

      toast.success("Partida importada com sucesso.");
      await reloadImportedMatches();
    } catch {
      setImportingMatchId(null);
      toast.error("Erro ao importar partida.");
    }
  }

  async function handleDeleteAccount(accountId: string) {
    setDeletingId(accountId);

    const { error } = await supabase
      .from("riot_accounts")
      .delete()
      .eq("id", accountId);

    setDeletingId(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Conta Riot removida.");
    setRiotMatches([]);

    if (selectedAccountId === accountId) {
      setSelectedAccountId("");
    }

    await loadInitialData();
  }

  function isMatchImported(externalMatchId: string) {
    return importedMatches.some(
      (match) => match.external_match_id === externalMatchId
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-sky-200 bg-white shadow-lg">
            <Link2 className="h-8 w-8 text-sky-600 animate-pulse" />
          </div>
          <p className="text-sm text-slate-500">Carregando integrações...</p>
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
                <Link2 className="h-7 w-7 text-sky-600" />
              </div>

              <div>
                <Badge className="mb-3">Integração oficial</Badge>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Riot API
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Conecte uma Riot ID, busque partidas reais e importe dados
                  oficiais para análises futuras de League of Legends e TFT.
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

        <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card>
            <CardHeader>
              <CardTitle>Conectar Riot ID</CardTitle>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Informe o Riot ID exatamente como aparece na conta. Exemplo:
                <strong> JogadorBR</strong> + <strong> BR1</strong>.
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleConnectRiot} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Riot Game Name
                    </Label>
                    <Input
                      placeholder="Ex: Faker"
                      value={gameName}
                      onChange={(event) => setGameName(event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Tagline
                    </Label>
                    <Input
                      placeholder="Ex: KR1"
                      value={tagLine}
                      onChange={(event) => setTagLine(event.target.value)}
                    />
                    <p className="text-xs text-slate-500">
                      Pode digitar com ou sem #.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Região de roteamento
                  </Label>
                  <select
                    value={region}
                    onChange={(event) =>
                      setRegion(event.target.value as RiotRegion)
                    }
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  >
                    <option value="americas">Americas</option>
                    <option value="europe">Europe</option>
                    <option value="asia">Asia</option>
                    <option value="sea">SEA</option>
                  </select>

                  <p className="text-xs leading-5 text-slate-500">
                    Para Brasil, NA e LATAM, use Americas. Para EUW/EUNE, use
                    Europe. Para KR/JP, use Asia.
                  </p>
                </div>

                <Button className="h-12 w-full" disabled={isConnecting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isConnecting ? "Conectando..." : "Conectar conta Riot"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status da integração</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/70 p-5 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-white text-sky-600">
                  <Gamepad2 className="h-5 w-5" />
                </div>

                <p className="text-sm font-black text-slate-950">
                  {accounts.length} conta
                  {accounts.length === 1 ? "" : "s"} conectada
                  {accounts.length === 1 ? "" : "s"}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Você já pode buscar partidas recentes e importar o JSON bruto
                  da Riot para análise.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-white text-sky-600">
                  <Download className="h-5 w-5" />
                </div>

                <p className="text-sm font-black text-slate-950">
                  {importedMatches.length} partida
                  {importedMatches.length === 1 ? "" : "s"} importada
                  {importedMatches.length === 1 ? "" : "s"}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Próximo bloco: transformar essas partidas importadas em
                  diagnósticos automáticos reais.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-white text-sky-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <p className="text-sm font-black text-slate-950">
                  Integração segura
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  A chave da Riot fica no servidor. O navegador só recebe dados
                  necessários da conta e das partidas.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              Contas conectadas
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Contas Riot já salvas no seu perfil.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_10px_34px_rgba(15,23,42,0.06)] backdrop-blur"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge>
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        Conectada
                      </Badge>

                      <Badge variant="outline">
                        {regionLabels[account.region as RiotRegion] ??
                          account.region}
                      </Badge>
                    </div>

                    <p className="text-lg font-black text-slate-950">
                      {account.game_name}#{account.tag_line}
                    </p>

                    <p className="mt-2 break-all text-xs leading-5 text-slate-500">
                      PUUID: {account.puuid}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    disabled={deletingId === account.id}
                    onClick={() => handleDeleteAccount(account.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deletingId === account.id ? "Removendo..." : "Remover"}
                  </Button>
                </div>
              </div>
            ))}

            {accounts.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-bold text-slate-950">
                    Nenhuma conta Riot conectada.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Conecte sua Riot ID para preparar a importação de partidas
                    oficiais.
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              Buscar últimas partidas
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Liste partidas recentes encontradas pela Riot API e importe o JSON
              bruto para análise futura.
            </p>
          </div>

          <Card>
            <CardContent className="space-y-5 p-5">
              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Conta Riot
                  </Label>
                  <select
                    value={selectedAccountId}
                    onChange={(event) => {
                      setSelectedAccountId(event.target.value);
                      setRiotMatches([]);
                    }}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  >
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.game_name}#{account.tag_line}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Jogo
                  </Label>
                  <select
                    value={selectedGame}
                    onChange={(event) => {
                      setSelectedGame(event.target.value as RiotGame);
                      setRiotMatches([]);
                    }}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  >
                    <option value="lol">League of Legends</option>
                    <option value="tft">Teamfight Tactics</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    className="h-11 w-full"
                    disabled={
                      isSearchingMatches ||
                      accounts.length === 0 ||
                      !selectedAccount
                    }
                    onClick={handleSearchMatches}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {isSearchingMatches
                      ? "Buscando..."
                      : "Buscar últimas partidas"}
                  </Button>
                </div>
              </div>

              {accounts.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                  <p className="text-sm font-bold text-slate-950">
                    Conecte uma Riot ID primeiro.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Depois de conectar, você poderá buscar partidas recentes de
                    LoL ou TFT.
                  </p>
                </div>
              ) : null}

              {riotMatches.length > 0 ? (
                <div className="space-y-3">
                  {riotMatches.map((match) => {
                    const imported = isMatchImported(match.externalMatchId);
                    const importing =
                      importingMatchId === match.externalMatchId;

                    return (
                      <div
                        key={match.externalMatchId}
                        className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <Badge>{gameLabels[match.game]}</Badge>

                              <Badge variant="outline">
                                {match.resultLabel}
                              </Badge>

                              {match.queueId ? (
                                <Badge variant="outline">
                                  Queue {match.queueId}
                                </Badge>
                              ) : null}

                              {imported ? (
                                <Badge>
                                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                  Importada
                                </Badge>
                              ) : null}
                            </div>

                            <p className="font-black text-slate-950">
                              {match.summary}
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {match.startedAt
                                ? formatDateTime(match.startedAt)
                                : "Data não identificada"}
                              {match.durationSeconds
                                ? ` • ${formatDuration(match.durationSeconds)}`
                                : ""}
                            </p>

                            <p className="mt-2 break-all text-xs leading-5 text-slate-400">
                              ID: {match.externalMatchId}
                            </p>
                          </div>

                          <Button
                            variant={imported ? "outline" : "default"}
                            disabled={imported || importing}
                            onClick={() => handleImportMatch(match)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            {imported
                              ? "Já importada"
                              : importing
                                ? "Importando..."
                                : "Importar partida"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">
                Partidas importadas
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Dados brutos já salvos no Supabase para análise futura.
              </p>
            </div>

            <Badge variant="outline">
              {importedMatches.length} importada
              {importedMatches.length === 1 ? "" : "s"}
            </Badge>
          </div>

          <div className="space-y-3">
            {importedMatches.map((match) => (
              <div
                key={match.id}
                className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge>
                        {match.game === "lol"
                          ? "League of Legends"
                          : "Teamfight Tactics"}
                      </Badge>

                      {match.result_label ? (
                        <Badge variant="outline">{match.result_label}</Badge>
                      ) : null}

                      {match.queue_id ? (
                        <Badge variant="outline">Queue {match.queue_id}</Badge>
                      ) : null}
                    </div>

                    <p className="font-black text-slate-950">
                      {match.summary ?? "Partida importada"}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {match.started_at
                        ? formatDateTime(match.started_at)
                        : "Data não identificada"}
                      {match.duration_seconds
                        ? ` • ${formatDuration(match.duration_seconds)}`
                        : ""}
                    </p>

                    <p className="mt-2 break-all text-xs leading-5 text-slate-400">
                      ID: {match.external_match_id}
                    </p>
                  </div>

                  <Button asChild variant="outline">
                    <Link href={`/riot/partidas/${match.id}`}>
                      Ver análise
                    </Link>
                  </Button>
                </div>
              </div>
            ))}

            {importedMatches.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-bold text-slate-950">
                    Nenhuma partida importada ainda.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Busque partidas recentes acima e clique em importar para
                    salvar o JSON bruto no Supabase.
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </section>
      </div>
    </main>
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