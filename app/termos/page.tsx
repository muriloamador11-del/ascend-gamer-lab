import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TermsPage() {
  return (
    <main className="min-h-screen px-4 pb-28 pt-8 text-slate-900 sm:px-6 lg:px-8 xl:pb-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/88 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 shadow-sm">
                <FileText className="h-7 w-7 text-sky-600" />
              </div>

              <div>
                <Badge className="mb-3">Legal</Badge>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Termos de Uso
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Versão MVP dos termos de uso do Ascend Gamer Lab.
                </p>
              </div>
            </div>

            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>1. Aceitação dos termos</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            <p>
              Ao acessar ou usar o Ascend Gamer Lab, você concorda com estes
              Termos de Uso e com a Política de Privacidade do produto.
            </p>

            <p>
              Caso não concorde com estes termos, você não deve utilizar o
              aplicativo.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Finalidade do produto</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            <p>
              O Ascend Gamer Lab é uma ferramenta educacional para jogadores
              competitivos. Seu objetivo é auxiliar no registro manual de
              partidas, organização de metas, análise pós-partida, diagnóstico
              de padrões e acompanhamento de evolução.
            </p>

            <p>
              O produto não garante subida de rank, vitória em partidas,
              desempenho profissional ou resultados específicos. A evolução
              depende do uso consistente, treino e tomada de decisão do próprio
              usuário.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Uso permitido</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            <p>
              Você pode usar o Ascend para registrar partidas, acompanhar metas,
              consultar diagnósticos, revisar decisões e organizar sua rotina de
              treino.
            </p>

            <p>
              O uso deve respeitar as regras dos jogos, plataformas,
              campeonatos, lojas de aplicativos e serviços relacionados.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Uso proibido</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            <p>
              É proibido usar o Ascend Gamer Lab para criar, solicitar,
              compartilhar ou incentivar hacks, cheats, aimbots, wallhacks,
              bots que joguem pelo usuário, automações proibidas, exploração de
              bugs, bypass de anti-cheat, leitura indevida de memória,
              interceptação de dados ou qualquer vantagem injusta.
            </p>

            <p>
              O Ascend não deve ser usado para violar termos de uso de jogos,
              manipular matchmaking, prejudicar outros jogadores ou comprometer
              a integridade competitiva.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Conta do usuário</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            <p>
              O usuário é responsável por manter suas credenciais seguras e por
              todas as ações realizadas em sua conta.
            </p>

            <p>
              Informações falsas, uso abusivo, tentativa de acesso indevido ou
              violação destes termos podem resultar em suspensão ou remoção de
              acesso ao produto.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Diagnósticos e recomendações</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            <p>
              Os diagnósticos e recomendações do Ascend são gerados com base nos
              dados informados pelo usuário e devem ser interpretados como apoio
              educacional, não como verdade absoluta.
            </p>

            <p>
              O usuário deve revisar as recomendações com senso crítico e adaptar
              os treinos ao seu contexto, jogo, rank, rotina e limitações.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Limitações do MVP</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            <p>
              Esta versão é um MVP. Recursos, diagnósticos, telas, métricas,
              integrações, disponibilidade e modelos de uso podem mudar conforme
              o produto evoluir.
            </p>

            <p>
              Funcionalidades futuras, como planos premium, integrações oficiais
              permitidas, exportação de relatórios e recursos avançados, poderão
              ter regras específicas.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Alterações dos termos</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            <p>
              Estes termos podem ser atualizados conforme o produto evoluir. O
              uso contínuo do Ascend após alterações indica concordância com a
              versão mais recente.
            </p>
          </CardContent>
        </Card>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-800">
          Esta é uma versão inicial para MVP. Antes de lançamento comercial
          amplo, assinatura paga ou publicação em lojas oficiais, revise com
          jurídico ou especialista em compliance.
        </div>
      </div>
    </main>
  );
}