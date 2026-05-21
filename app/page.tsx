import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Gamepad2,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: <Gamepad2 className="h-5 w-5" />,
    title: "Registro de partidas",
    description:
      "Salve partidas de LoL, TFT e Valorant com dados importantes para review.",
  },
  {
    icon: <Brain className="h-5 w-5" />,
    title: "Diagnóstico automático",
    description:
      "Receba diagnóstico, análise, correção, treino e próximo passo após cada partida.",
  },
  {
    icon: <Target className="h-5 w-5" />,
    title: "Metas práticas",
    description:
      "Transforme erros recorrentes em metas objetivas para a próxima partida.",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Histórico de evolução",
    description:
      "Acompanhe partidas, metas concluídas e padrões que aparecem no seu desempenho.",
  },
];

const steps = [
  "Configure seu perfil gamer",
  "Registre uma partida",
  "Receba um review automático",
  "Treine com uma meta clara",
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex items-center justify-between rounded-[2rem] border border-slate-200 bg-white/88 px-5 py-4 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50">
              <Gamepad2 className="h-6 w-6 text-sky-600" />
            </div>

            <div>
              <p className="text-sm font-black text-slate-950">
                Ascend Gamer Lab
              </p>
              <p className="text-xs text-slate-500">Competitive Coach</p>
            </div>
          </Link>

          <div className="hidden items-center gap-3 sm:flex">
            <Button asChild variant="outline">
              <Link href="/login">Entrar</Link>
            </Button>

            <Button asChild>
              <Link href="/cadastro">
                Criar conta
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <Badge>
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Coaching gamer com dashboard de evolução
            </Badge>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Transforme cada partida em um plano real de evolução.
              </h1>

              <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                O Ascend Gamer Lab ajuda jogadores competitivos a registrar
                partidas, identificar erros recorrentes, receber diagnóstico
                automático e treinar com metas práticas.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12">
                <Link href="/cadastro">
                  Começar agora
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="h-12">
                <Link href="/login">Já tenho conta</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <TrustItem text="Sem hacks" />
              <TrustItem text="Sem automação proibida" />
              <TrustItem text="Foco em review e treino" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-sky-300/20 blur-3xl" />
            <div className="absolute -right-10 bottom-10 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-slate-950">
                    Review pós-partida
                  </p>
                  <p className="text-xs text-slate-500">
                    Relatório automático v1
                  </p>
                </div>

                <Badge>Ascend Report</Badge>
              </div>

              <div className="space-y-3">
                <PreviewBlock
                  icon={<Brain className="h-4 w-4" />}
                  title="Diagnóstico"
                  text="Você perdeu impacto por morrer antes de objetivos importantes."
                />

                <PreviewBlock
                  icon={<Target className="h-4 w-4" />}
                  title="Correção"
                  text="Prepare o objetivo antes: reset, visão e posição segura."
                />

                <PreviewBlock
                  icon={<Trophy className="h-4 w-4" />}
                  title="Meta da próxima partida"
                  text="Chegar 45 segundos antes do objetivo com vida, recurso e visão."
                  highlight
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600">
                  {feature.icon}
                </div>

                <p className="text-base font-black text-slate-950">
                  {feature.title}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Card>
            <CardHeader>
              <CardTitle>Como funciona</CardTitle>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Um fluxo simples para transformar partida jogada em aprendizado
                aplicável.
              </p>
            </CardHeader>

            <CardContent className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50/80 p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-white text-sm font-black text-sky-600">
                    {index + 1}
                  </div>

                  <p className="text-sm font-bold text-slate-900">{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-sky-50/70 to-white p-6 shadow-[0_18px_50px_rgba(14,165,233,0.10)] backdrop-blur-xl">
            <Badge className="mb-4">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" />
              Produto seguro
            </Badge>

            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              Feito para melhorar performance sem violar regras dos jogos.
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              O Ascend trabalha com registro manual, análise pós-partida,
              dashboard de evolução e metas de treino. Nada de cheat, leitura
              ilegal de memória, automação proibida ou vantagem injusta.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <SafetyItem text="Análise pós-partida" />
              <SafetyItem text="Dashboard de evolução" />
              <SafetyItem text="Metas semanais" />
              <SafetyItem text="Ferramenta educacional" />
            </div>

            <Button asChild size="lg" className="mt-6 h-12">
              <Link href="/cadastro">
                Criar meu perfil gamer
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <footer className="rounded-[2rem] border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col items-center justify-between gap-3 text-sm text-slate-500 sm:flex-row">
            <p>Ascend Gamer Lab — coaching, review e evolução competitiva.</p>

            <div className="flex items-center gap-4">
              <Link
                href="/privacidade"
                className="font-semibold hover:text-sky-600"
              >
                Privacidade
              </Link>

              <Link href="/termos" className="font-semibold hover:text-sky-600">
                Termos
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm">
      <CheckCircle2 className="h-4 w-4 text-sky-600" />
      {text}
    </div>
  );
}

function SafetyItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-3 py-3 text-sm font-semibold text-slate-700 shadow-sm">
      <CheckCircle2 className="h-4 w-4 text-sky-600" />
      {text}
    </div>
  );
}

function PreviewBlock({
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
          ? "border-sky-200 bg-sky-50"
          : "border-slate-200 bg-slate-50/80"
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-200 bg-white text-sky-600">
          {icon}
        </div>

        <p className="text-sm font-black text-slate-950">{title}</p>
      </div>

      <p className="text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}