"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Gamepad2, ShieldCheck, Target, Trophy } from "lucide-react";
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

const GOAL_OPTIONS = [
  {
    value: "subir_rank",
    label: "Subir rank",
    description: "Evoluir de elo com consistência e menos erro repetido.",
  },
  {
    value: "melhorar_mecanica",
    label: "Melhorar mecânica",
    description: "Execução, mira, movimentação, combos e precisão.",
  },
  {
    value: "tomada_decisao",
    label: "Melhorar tomada de decisão",
    description: "Escolher melhor quando lutar, recuar, rotacionar ou forçar.",
  },
  {
    value: "consistencia",
    label: "Jogar com mais consistência",
    description: "Reduzir partidas ruins e manter padrão de performance.",
  },
  {
    value: "macro_game",
    label: "Melhorar macro e leitura de jogo",
    description: "Mapa, objetivos, rotação, economia e condição de vitória.",
  },
  {
    value: "mental_game",
    label: "Melhorar mental e controle de tilt",
    description: "Evitar decisões emocionais e manter foco em ranked.",
  },
  {
    value: "plano_treino",
    label: "Receber plano de treino",
    description: "Transformar erros em metas práticas semanais.",
  },
  {
    value: "competir",
    label: "Competir ou entrar em time",
    description: "Preparar fundamentos para ambiente mais competitivo.",
  },
  {
    value: "coaching",
    label: "Receber coaching",
    description: "Ter análises mais guiadas e acompanhamento de evolução.",
  },
];

type GameProfile = {
  game: string;
  current_rank: string | null;
  goal_rank: string | null;
  main_role: string | null;
  main_characters: string | null;
};

export default function OnboardingPage() {
  const router = useRouter();

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [weeklyHours, setWeeklyHours] = useState("");

  const [lolRank, setLolRank] = useState("");
  const [tftRank, setTftRank] = useState("");
  const [valorantRank, setValorantRank] = useState("");

  const [lolGoalRank, setLolGoalRank] = useState("");
  const [tftGoalRank, setTftGoalRank] = useState("");
  const [valorantGoalRank, setValorantGoalRank] = useState("");

  const [lolRole, setLolRole] = useState("");
  const [lolChampions, setLolChampions] = useState("");

  const [tftPlaystyle, setTftPlaystyle] = useState("");
  const [tftComps, setTftComps] = useState("");

  const [valorantRole, setValorantRole] = useState("");
  const [valorantAgents, setValorantAgents] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditingExistingProfile, setIsEditingExistingProfile] =
    useState(false);

  useEffect(() => {
    async function loadExistingProfile() {
      setIsLoadingProfile(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Faça login para configurar seu perfil.");
        router.push("/login");
        return;
      }

      const { data: playerProfile, error: profileError } = await supabase
        .from("player_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        toast.error(profileError.message);
        setIsLoadingProfile(false);
        return;
      }

      const { data: gameProfiles, error: gamesError } = await supabase
        .from("game_profiles")
        .select("*")
        .eq("user_id", user.id);

      if (gamesError) {
        toast.error(gamesError.message);
        setIsLoadingProfile(false);
        return;
      }

      if (playerProfile) {
        setIsEditingExistingProfile(true);

        const savedGoals = String(playerProfile.main_goal ?? "")
          .split(",")
          .map((goal) => goal.trim())
          .filter(Boolean);

        setSelectedGoals(savedGoals.length > 0 ? savedGoals : ["subir_rank"]);
        setWeeklyHours(String(playerProfile.weekly_hours ?? ""));
      } else {
        setSelectedGoals(["subir_rank"]);
        setWeeklyHours("");
      }

      if (gameProfiles && gameProfiles.length > 0) {
        fillGameProfiles(gameProfiles as GameProfile[]);
      }

      setIsLoadingProfile(false);
    }

    loadExistingProfile();
  }, [router]);

  function fillGameProfiles(gameProfiles: GameProfile[]) {
    const lol = gameProfiles.find(
      (profile) => profile.game === "league_of_legends"
    );
    const tft = gameProfiles.find(
      (profile) => profile.game === "teamfight_tactics"
    );
    const valorant = gameProfiles.find((profile) => profile.game === "valorant");

    if (lol) {
      setLolRank(lol.current_rank ?? "");
      setLolGoalRank(lol.goal_rank ?? "");
      setLolRole(lol.main_role ?? "");
      setLolChampions(lol.main_characters ?? "");
    }

    if (tft) {
      setTftRank(tft.current_rank ?? "");
      setTftGoalRank(tft.goal_rank ?? "");
      setTftPlaystyle(tft.main_role ?? "");
      setTftComps(tft.main_characters ?? "");
    }

    if (valorant) {
      setValorantRank(valorant.current_rank ?? "");
      setValorantGoalRank(valorant.goal_rank ?? "");
      setValorantRole(valorant.main_role ?? "");
      setValorantAgents(valorant.main_characters ?? "");
    }
  }

  function handleToggleGoal(goal: string) {
    setSelectedGoals((currentGoals) => {
      if (currentGoals.includes(goal)) {
        return currentGoals.filter((item) => item !== goal);
      }

      return [...currentGoals, goal];
    });
  }

  async function handleSaveOnboarding(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedGoals.length === 0) {
      toast.error("Selecione pelo menos um objetivo de evolução.");
      return;
    }

    if (!weeklyHours || Number(weeklyHours) <= 0) {
      toast.error("Informe quantas horas por semana você pode treinar.");
      return;
    }

    const hasAtLeastOneGame =
      lolRank ||
      lolGoalRank ||
      lolRole ||
      lolChampions ||
      tftRank ||
      tftGoalRank ||
      tftPlaystyle ||
      tftComps ||
      valorantRank ||
      valorantGoalRank ||
      valorantRole ||
      valorantAgents;

    if (!hasAtLeastOneGame) {
      toast.error("Preencha pelo menos um jogo para montar seu perfil.");
      return;
    }

    setIsLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setIsLoading(false);
      toast.error("Você precisa estar logado para concluir o onboarding.");
      router.push("/login");
      return;
    }

    await supabase.from("game_profiles").delete().eq("user_id", user.id);
    await supabase.from("player_profiles").delete().eq("user_id", user.id);

    const { error: profileError } = await supabase
      .from("player_profiles")
      .insert({
        user_id: user.id,
        main_goal: selectedGoals.join(","),
        weekly_hours: Number(weeklyHours),
        content_creator_mode: false,
      });

    if (profileError) {
      setIsLoading(false);
      toast.error(profileError.message);
      return;
    }

    const gameProfiles = [
      {
        user_id: user.id,
        game: "league_of_legends",
        current_rank: lolRank,
        goal_rank: lolGoalRank,
        main_role: lolRole,
        main_characters: lolChampions,
      },
      {
        user_id: user.id,
        game: "teamfight_tactics",
        current_rank: tftRank,
        goal_rank: tftGoalRank,
        main_role: tftPlaystyle,
        main_characters: tftComps,
      },
      {
        user_id: user.id,
        game: "valorant",
        current_rank: valorantRank,
        goal_rank: valorantGoalRank,
        main_role: valorantRole,
        main_characters: valorantAgents,
      },
    ].filter((profile) => {
      return (
        profile.current_rank ||
        profile.goal_rank ||
        profile.main_role ||
        profile.main_characters
      );
    });

    const { error: gamesError } = await supabase
      .from("game_profiles")
      .insert(gameProfiles);

    setIsLoading(false);

    if (gamesError) {
      toast.error(gamesError.message);
      return;
    }

    toast.success(
      isEditingExistingProfile
        ? "Perfil gamer atualizado com sucesso."
        : "Perfil gamer salvo com sucesso."
    );

    router.push("/dashboard");
  }

  if (isLoadingProfile) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-sky-200 bg-white shadow-lg">
            <Gamepad2 className="h-8 w-8 text-sky-600 animate-pulse" />
          </div>
          <p className="text-sm text-slate-500">Carregando perfil gamer...</p>
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
                <Badge className="mb-3">
                  {isEditingExistingProfile
                    ? "Editar perfil competitivo"
                    : "Onboarding competitivo"}
                </Badge>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  {isEditingExistingProfile
                    ? "Editar perfil gamer"
                    : "Configurar perfil gamer"}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  {isEditingExistingProfile
                    ? "Atualize seus objetivos, ranks e jogos acompanhados. Os dados atuais já foram carregados."
                    : "Vamos montar sua base para diagnóstico, treino e evolução. Escolha seus objetivos e preencha apenas os jogos que você quer acompanhar agora."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <MiniStat icon={<Target className="h-5 w-5" />} label="Metas" />
              <MiniStat icon={<Clock className="h-5 w-5" />} label="Rotina" />
              <MiniStat icon={<Trophy className="h-5 w-5" />} label="Rank" />
            </div>
          </div>
        </header>

        <form onSubmit={handleSaveOnboarding} className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Objetivos de evolução</CardTitle>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Selecione tudo que faz sentido para sua evolução. O Ascend
                    vai usar isso para priorizar diagnósticos e metas.
                  </p>
                </div>

                <Badge variant="outline">
                  {selectedGoals.length} selecionado
                  {selectedGoals.length === 1 ? "" : "s"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {GOAL_OPTIONS.map((goal) => {
                  const isSelected = selectedGoals.includes(goal.value);

                  return (
                    <button
                      key={goal.value}
                      type="button"
                      onClick={() => handleToggleGoal(goal.value)}
                      className={`rounded-3xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50/70 ${
                        isSelected
                          ? "border-sky-300 bg-sky-50 text-slate-950"
                          : "border-slate-200 bg-white text-slate-900"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                            isSelected
                              ? "border-sky-500 bg-sky-500"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected ? (
                            <div className="h-2 w-2 rounded-sm bg-white" />
                          ) : null}
                        </div>

                        <div>
                          <p className="text-sm font-black text-slate-950">
                            {goal.label}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {goal.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Horas disponíveis por semana
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Ex: 10"
                    value={weeklyHours}
                    onChange={(event) => setWeeklyHours(event.target.value)}
                  />
                </div>

                <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-sky-50/70 p-4 shadow-sm">
                  <p className="text-sm font-black text-slate-950">
                    Como vamos usar isso?
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Seus objetivos vão influenciar o tipo de análise: mecânica,
                    macro, mental, decisão, consistência, treino ou competição.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <GameCard
            title="League of Legends"
            description="Rota, campeões e objetivo de rank para análises de lane, macro, visão e team fight."
            badge="MOBA"
          >
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <Field
                label="Rank atual"
                placeholder="Ex: Prata 2"
                value={lolRank}
                onChange={setLolRank}
              />

              <Field
                label="Rank desejado"
                placeholder="Ex: Ouro 4"
                value={lolGoalRank}
                onChange={setLolGoalRank}
              />

              <Field
                label="Rota principal"
                placeholder="Ex: Mid, Top, Jungle"
                value={lolRole}
                onChange={setLolRole}
              />

              <Field
                label="Campeões principais"
                placeholder="Ex: Ahri, Yone, Orianna"
                value={lolChampions}
                onChange={setLolChampions}
              />
            </div>
          </GameCard>

          <GameCard
            title="Teamfight Tactics"
            description="Rank, estilo de jogo e comps para analisar economia, roll, level, scouting e posicionamento."
            badge="AUTO BATTLER"
          >
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <Field
                label="Rank atual"
                placeholder="Ex: Platina 3"
                value={tftRank}
                onChange={setTftRank}
              />

              <Field
                label="Rank desejado"
                placeholder="Ex: Diamante 4"
                value={tftGoalRank}
                onChange={setTftGoalRank}
              />

              <Field
                label="Estilo de jogo"
                placeholder="Ex: Flex, reroll, fast 8"
                value={tftPlaystyle}
                onChange={setTftPlaystyle}
              />

              <Field
                label="Comps favoritas"
                placeholder="Ex: AP flex, reroll, bruisers"
                value={tftComps}
                onChange={setTftComps}
              />
            </div>
          </GameCard>

          <GameCard
            title="Valorant"
            description="Função, agentes e rank para analisar mira, utilitário, entrada, defesa, retake e comunicação."
            badge="FPS TÁTICO"
          >
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <Field
                label="Rank atual"
                placeholder="Ex: Ouro 2"
                value={valorantRank}
                onChange={setValorantRank}
              />

              <Field
                label="Rank desejado"
                placeholder="Ex: Platina 1"
                value={valorantGoalRank}
                onChange={setValorantGoalRank}
              />

              <Field
                label="Função principal"
                placeholder="Ex: Duelista, Controlador"
                value={valorantRole}
                onChange={setValorantRole}
              />

              <Field
                label="Agentes principais"
                placeholder="Ex: Jett, Omen, Sova"
                value={valorantAgents}
                onChange={setValorantAgents}
              />
            </div>
          </GameCard>

          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-sky-50/70 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.07)] backdrop-blur">
            <div className="flex gap-3">
              <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50">
                <ShieldCheck className="h-5 w-5 text-sky-600" />
              </div>

              <div>
                <p className="text-sm font-black text-slate-950">
                  O que acontece depois?
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Com esse perfil, o Ascend vai montar seu dashboard inicial,
                  organizar seus jogos principais e preparar a base para
                  registrar partidas, identificar erros recorrentes e gerar
                  metas práticas de evolução.
                </p>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 -mx-4 border-t border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
            <Button size="lg" className="h-12 w-full" disabled={isLoading}>
              {isLoading
                ? "Salvando perfil..."
                : isEditingExistingProfile
                  ? "Atualizar perfil e voltar para dashboard"
                  : "Salvar perfil e ir para dashboard"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

function MiniStat({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-3 shadow-sm">
      <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600">
        {icon}
      </div>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
    </div>
  );
}

function GameCard({
  title,
  description,
  badge,
  children,
}: {
  title: string;
  description: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>

          <Badge variant="outline" className="w-fit">
            {badge}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
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