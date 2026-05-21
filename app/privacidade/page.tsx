import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 pb-28 pt-8 text-slate-900 sm:px-6 lg:px-8 xl:pb-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/88 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 shadow-sm">
                <ShieldCheck className="h-7 w-7 text-sky-600" />
              </div>

              <div>
                <Badge className="mb-3">Legal</Badge>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Política de Privacidade
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Versão MVP da política de privacidade do Ascend Gamer Lab.
                </p>
              </div>
            </div>

           <Button asChild variant="outline">
  <Link href="/conta">
    <ArrowLeft className="mr-2 h-4 w-4" />
    Voltar para conta
  </Link>
</Button>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>1. Dados que coletamos</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            <p>
              O Ascend Gamer Lab coleta dados fornecidos pelo próprio usuário,
              como e-mail, objetivos de evolução, jogos acompanhados, ranks,
              registros manuais de partidas, anotações, metas e diagnósticos.
            </p>

            <p>
              Esses dados são usados para montar o dashboard, gerar análises
              pós-partida, acompanhar evolução e melhorar a experiência do
              usuário dentro do aplicativo.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Como usamos os dados</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            <p>
              Usamos os dados para autenticação, criação de perfil gamer,
              registro de partidas, geração de metas, diagnóstico automático e
              exibição de gráficos de evolução.
            </p>

            <p>
              O Ascend não usa os dados para oferecer vantagem injusta em jogos,
              automatizar ações, manipular partidas ou violar regras de jogos e
              plataformas.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Segurança e armazenamento</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            <p>
              Os dados são armazenados em serviços de infraestrutura utilizados
              pelo projeto, como Supabase e Vercel. O acesso às informações é
              protegido por autenticação e políticas de segurança no banco de
              dados.
            </p>

            <p>
              O usuário deve manter suas credenciais seguras e não compartilhar
              acesso à sua conta.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. O que não coletamos</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            <p>
              O Ascend Gamer Lab não coleta senhas de contas de jogos, não
              acessa memória de jogos, não lê dados privados do computador do
              usuário e não executa automações dentro de partidas.
            </p>

            <p>
              O aplicativo funciona como ferramenta educacional de registro,
              review, organização e treino.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Exclusão e suporte</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            <p>
              O usuário poderá solicitar suporte, correção ou exclusão de dados
              pelos canais oficiais do projeto quando essa função estiver
              disponível publicamente.
            </p>

            <p>
              Esta política pode ser atualizada conforme o produto evoluir,
              especialmente em caso de novos recursos, integrações, planos pagos
              ou publicação em lojas oficiais.
            </p>
          </CardContent>
        </Card>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-800">
          Esta é uma versão inicial para MVP. Antes de lançamento comercial
          amplo, loja de aplicativos ou assinatura paga, revise com jurídico ou
          especialista em privacidade/compliance.
        </div>
      </div>
    </main>
  );
}