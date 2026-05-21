type BaseReviewInput = {
  game: string;
  result: string;
  mentalState: string;
  notes: string;
};

type LolReviewInput = {
  champion: string;
  role: string;
  matchup: string;
  kills: number;
  deaths: number;
  assists: number;
  cs10: number | null;
  totalCs: number | null;
  visionScore: number | null;
  deathsBeforeObjective: number;
  laneResult: string;
  winCondition: string;
};

type TftReviewInput = {
  placement: number | null;
  composition: string;
  levelTiming: string;
  rolldownTiming: string;
  augments: string;
  items: string;
  contested: string;
  playedFor: string;
  economyNotes: string;
};

type ValorantReviewInput = {
  agent: string;
  agentRole: string;
  map: string;
  acs: number | null;
  kills: number;
  deaths: number;
  assists: number;
  firstBloods: number;
  firstDeaths: number;
  utilityNotes: string;
  communicationNotes: string;
};

type GenerateMatchReviewInput = {
  base: BaseReviewInput;
  lol?: LolReviewInput;
  tft?: TftReviewInput;
  valorant?: ValorantReviewInput;
};

type MatchReviewOutput = {
  diagnosis: string;
  analysis: string;
  correction: string;
  training: string;
  next_step: string;
  biggest_mistake: string;
  recurring_pattern: string;
  goal_title: string;
  goal_description: string;
};

type ReviewRule = {
  priority: number;
  diagnosis: string;
  analysis: string;
  correction: string;
  training: string;
  next_step: string;
  biggest_mistake: string;
  recurring_pattern: string;
  goal_title: string;
  goal_description: string;
};

export function generateMatchReview(
  input: GenerateMatchReviewInput
): MatchReviewOutput {
  if (input.base.game === "league_of_legends" && input.lol) {
    return generateLolReview(input.base, input.lol);
  }

  if (input.base.game === "teamfight_tactics" && input.tft) {
    return generateTftReview(input.base, input.tft);
  }

  if (input.base.game === "valorant" && input.valorant) {
    return generateValorantReview(input.base, input.valorant);
  }

  return generateFallbackReview(input.base);
}

function generateLolReview(
  base: BaseReviewInput,
  lol: LolReviewInput
): MatchReviewOutput {
  const champion = clean(lol.champion) || "seu campeão";
  const role = clean(lol.role) || "sua rota";
  const matchup = clean(lol.matchup) || "o matchup";
  const laneResult = lower(lol.laneResult);
  const winCondition = clean(lol.winCondition) || "sua condição de vitória";

  const rules: ReviewRule[] = [];

  if (lol.deathsBeforeObjective >= 2) {
    rules.push({
      priority: 100,
      diagnosis: `O erro mais caro foi morrer antes de objetivos. Você registrou ${lol.deathsBeforeObjective} morte(s) antes de objetivo, o que reduz pressão de mapa e entrega janela para o inimigo controlar dragão, arauto, barão ou torre.`,
      analysis: `Em LoL, morrer antes de objetivo costuma valer mais do que uma morte comum, porque você perde tempo de mapa, visão, pressão de wave e presença na luta. Mesmo que sua lane tenha sido jogável, esse padrão quebra a condição de vitória: ${winCondition}.`,
      correction: `Antes de objetivo, jogue 60 segundos mais disciplinado: faça reset cedo, compre controle ward, empurre a wave com segurança e evite facecheck. Se não tiver visão, não seja o primeiro a entrar no rio ou jungle inimiga.`,
      training: `Nas próximas 3 partidas, marque mentalmente todo objetivo grande com 1 minuto de antecedência. Sua missão é chegar vivo, com recurso e em posição. Não procure pick sozinho antes do objetivo.`,
      next_step: `Na próxima partida de ${champion}, seu foco é estar vivo 45 segundos antes de todo objetivo importante.`,
      biggest_mistake: "Morrer antes de objetivos e entregar controle de mapa.",
      recurring_pattern:
        "Risco excessivo em janelas críticas antes de objetivos.",
      goal_title: "Chegar vivo antes dos objetivos",
      goal_description:
        "Por 3 partidas, chegar vivo 45s antes de dragão/arauto/barão, com reset feito e sem facecheck sem visão.",
    });
  }

  if (lol.cs10 !== null && lol.cs10 > 0 && lol.cs10 < 60) {
    rules.push({
      priority: 90,
      diagnosis: `Seu farm inicial ficou baixo: ${lol.cs10} CS aos 10 minutos. Isso indica perda de recurso básico na fase de rotas, reduzindo item spike e pressão para jogar o mapa.`,
      analysis: `Mesmo com boas jogadas, CS baixo atrasa seu primeiro ou segundo item. Em ${role}, isso pode fazer você perder prioridade, chegar atrasado em objetivo e depender demais de kill para ficar forte.`,
      correction: `Reduza trades desnecessários antes de estabilizar a wave. Priorize last hit, controle de wave e recall timing. Roam só deve acontecer se a wave estiver empurrada ou se o ganho for muito claro.`,
      training: `Faça 3 partidas com meta de 70+ CS aos 10 minutos. Se for matchup difícil como ${matchup}, a meta mínima é 60+ sem morrer por ganância.`,
      next_step: `Na próxima partida, olhe seu CS aos 5 e aos 10 minutos. Se estiver abaixo do ritmo, pare de forçar troca e volte para farm seguro.`,
      biggest_mistake: "Perda de recurso básico na fase de rotas.",
      recurring_pattern:
        "Trocar, rotacionar ou lutar antes de consolidar wave e farm.",
      goal_title: "Subir CS aos 10 minutos",
      goal_description:
        "Nas próximas 3 partidas, buscar 70+ CS aos 10min em matchup normal ou 60+ em matchup difícil, sem morrer por wave.",
    });
  }

  if (lol.visionScore !== null && lol.visionScore > 0 && lol.visionScore < 18) {
    rules.push({
      priority: 82,
      diagnosis: `Seu vision score foi baixo (${lol.visionScore}). Isso sugere pouca preparação de mapa e baixa capacidade de antecipar rotação inimiga.`,
      analysis: `Visão baixa aumenta mortes evitáveis, dificulta objetivo e deixa suas decisões dependentes de reação. Para executar ${winCondition}, você precisa de informação antes de lutar.`,
      correction: `Compre controle ward em resets importantes e posicione visão 60s antes de objetivo. Se estiver sem visão lateral, jogue mais próximo da sua equipe ou da wave segura.`,
      training: `Nas próximas 3 partidas, coloque uma controle ward antes de cada objetivo grande e revise no pós-jogo se você morreu em área sem visão.`,
      next_step: `Na próxima partida, compre controle ward no primeiro reset possível e antes de todo objetivo relevante.`,
      biggest_mistake: "Pouca preparação de visão para decisões de mapa.",
      recurring_pattern: "Entrar ou lutar sem informação suficiente.",
      goal_title: "Preparar visão antes de lutar",
      goal_description:
        "Comprar controle ward em todo reset importante e posicionar visão 60s antes de dragão, arauto ou barão por 3 partidas.",
    });
  }

  if (lol.deaths >= 7) {
    rules.push({
      priority: 78,
      diagnosis: `Você morreu ${lol.deaths} vezes. O volume de mortes ficou alto e provavelmente reduziu sua consistência, mesmo que você tenha conseguido participar de abates.`,
      analysis: `Muitas mortes diminuem tempo ativo no mapa, entregam ouro, quebram wave timing e impedem que você converta vantagem. Em ranked, consistência vale mais do que jogadas explosivas isoladas.`,
      correction: `Depois da segunda morte, mude o plano: jogue mais com visão, evite side avançado sem informação e pare de iniciar lutas sem vantagem numérica ou recurso.`,
      training: `Por 5 partidas, use uma regra simples: se morrer 2 vezes antes de 15 minutos, sua prioridade vira farm seguro, visão e luta apenas com equipe.`,
      next_step: `Na próxima partida, sua meta é terminar com no máximo 5 mortes.`,
      biggest_mistake: "Excesso de mortes e perda de tempo ativo no mapa.",
      recurring_pattern: "Forçar jogadas após ficar vulnerável ou sem visão.",
      goal_title: "Reduzir mortes evitáveis",
      goal_description:
        "Nas próximas 5 partidas, terminar com no máximo 5 mortes e revisar toda morte antes de objetivo ou sem visão.",
    });
  }

  if (laneResult.includes("perd") || laneResult.includes("lose")) {
    rules.push({
      priority: 72,
      diagnosis: `A fase de rotas foi registrada como negativa. Isso indica que o problema principal pode ter começado antes do mid game: wave, trade, matchup ou recall timing.`,
      analysis: `Perder lane não significa perder o jogo, mas muda seu papel. Você precisa parar de jogar como condição primária e passar a jogar para estabilizar, cobrir mapa e permitir que outra condição de vitória carregue.`,
      correction: `Quando perder a lane, reduza risco. Não tente recuperar tudo em uma luta. Controle wave perto da sua torre, comunique sumiços e jogue para objetivos com a equipe.`,
      training: `Revise os 10 primeiros minutos da próxima partida e marque: primeira wave ruim, primeiro trade ruim e primeiro recall ruim.`,
      next_step: `Na próxima partida, se a lane ficar ruim, jogue para perder menos em vez de tentar recuperar tudo de uma vez.`,
      biggest_mistake: "Tentar recuperar lane perdida com jogadas forçadas.",
      recurring_pattern:
        "Transformar desvantagem pequena em desvantagem grande.",
      goal_title: "Estabilizar lane difícil",
      goal_description:
        "Em matchups difíceis, jogar os 10 primeiros minutos sem morrer mais de 1 vez e manter wave segura.",
    });
  }

  if (isTilted(base.mentalState)) {
    rules.push({
      priority: 70,
      diagnosis: `Seu estado mental foi registrado como ${mentalLabel(base.mentalState)}. Isso pode ter afetado sua tomada de decisão e aumentado lutas impulsivas.`,
      analysis: `Quando o mental cai, o jogador costuma buscar compensar erro com jogada imediata. Isso aumenta morte, força luta ruim e reduz leitura de mapa.`,
      correction: `Depois de uma morte ou erro grande, faça uma regra de reset: respira, compra item, olha objetivo, olha wave e só decide depois. Não jogue a próxima jogada no automático.`,
      training: `Use um checklist de 5 segundos após toda morte: por que morri, qual objetivo nasce, onde devo estar, o que não posso repetir.`,
      next_step: `Na próxima partida, após cada morte, espere 5 segundos antes de pingar, digitar ou forçar jogada.`,
      biggest_mistake: "Decisão emocional após erro ou desvantagem.",
      recurring_pattern: "Tentar compensar erro com risco imediato.",
      goal_title: "Reset mental após morte",
      goal_description:
        "Por 5 partidas, fazer checklist de 5 segundos após cada morte antes de tomar a próxima decisão.",
    });
  }

  if (rules.length === 0) {
    rules.push({
      priority: 50,
      diagnosis: `Sua partida com ${champion} em ${role} não mostrou um erro crítico claro pelos dados registrados. O foco deve ser transformar observações gerais em um ponto específico de melhoria.`,
      analysis: `Quando não há um erro gritante, a evolução vem de consistência: farm, visão, objetivos, mortes evitáveis e execução da condição de vitória.`,
      correction: `Escolha um único foco para a próxima partida. Não tente melhorar tudo ao mesmo tempo. A melhor prioridade agora é jogar em função de ${winCondition}.`,
      training: `Nas próximas 3 partidas, registre com mais detalhe mortes, objetivos e momentos de decisão para o diagnóstico ficar mais preciso.`,
      next_step: `Na próxima partida, defina antes do jogo qual é sua condição de vitória e revise se suas decisões seguiram esse plano.`,
      biggest_mistake: "Falta de foco único mensurável para evolução.",
      recurring_pattern: "Melhoria difusa sem métrica clara.",
      goal_title: "Definir condição de vitória",
      goal_description:
        "Antes das próximas 3 partidas, escrever a condição de vitória e revisar se suas decisões seguiram esse plano.",
    });
  }

  return pickBestRule(rules);
}

function generateTftReview(
  base: BaseReviewInput,
  tft: TftReviewInput
): MatchReviewOutput {
  const placement = tft.placement;
  const composition = clean(tft.composition) || "sua composição";
  const contested = lower(tft.contested);
  const playedFor = lower(tft.playedFor);
  const economyNotes = lower(tft.economyNotes);
  const rolldownTiming = clean(tft.rolldownTiming) || "seu rolldown";
  const levelTiming = clean(tft.levelTiming) || "seu timing de level";

  const rules: ReviewRule[] = [];

  if (placement !== null && placement >= 5) {
    rules.push({
      priority: 95,
      diagnosis: `Você terminou em ${placement}º lugar, fora do Top 4. O foco principal deve ser entender se a derrota veio de board fraco, economia mal convertida, rolldown atrasado ou composição contestada.`,
      analysis: `No TFT, bottom 4 geralmente acontece quando você demora para estabilizar ou insiste em um plano que o lobby não permite. A comp ${composition} precisava de um spike claro de força antes de perder HP demais.`,
      correction: `Defina seu ponto de estabilização antes do stage 4. Se estiver perdendo muito HP, o objetivo deixa de ser top 1 e vira top 4: rolar antes, jogar board mais forte e aceitar transição.`,
      training: `Nas próximas 5 partidas, ao chegar no 3-2 e 4-1, responda: estou forte, médio ou fraco? Se estiver fraco, priorize estabilizar em vez de economizar demais.`,
      next_step: `Na próxima partida, defina no 3-2 se você está jogando para preservar HP ou para escalar.`,
      biggest_mistake: "Demorar para estabilizar e perder HP demais.",
      recurring_pattern: "Jogar para plano ideal mesmo quando o lobby exige top 4.",
      goal_title: "Estabilizar antes de perder HP crítico",
      goal_description:
        "Nas próximas 5 partidas, avaliar força do board no 3-2 e 4-1; se estiver fraco, rolar para estabilizar antes de cair abaixo de 40 HP.",
    });
  }

  if (contested.includes("sim") || contested.includes("muito") || contested.includes("2")) {
    rules.push({
      priority: 90,
      diagnosis: `Sua composição estava contestada. Isso reduz chance de completar upgrades e exige scouting ou transição mais cedo.`,
      analysis: `Quando 2+ jogadores disputam a mesma linha, insistir sem vantagem de itens, HP ou economia aumenta o risco de bottom 4. O problema não é só a comp, é a falta de adaptação ao lobby.`,
      correction: `No stage 3, faça scouting ativo. Se houver muitos jogadores na mesma direção, prepare plano B usando seus itens principais e unidades que aparecerem naturalmente.`,
      training: `Nas próximas 5 partidas, faça scout obrigatório no 3-2 e 4-1. Anote se sua comp tem 0, 1 ou 2+ contestando.`,
      next_step: `Na próxima partida, se houver 2+ jogadores na sua comp no 3-2, prepare transição antes do rolldown principal.`,
      biggest_mistake: "Insistir em composição contestada sem plano B.",
      recurring_pattern: "Baixa adaptação ao lobby.",
      goal_title: "Scoutar comp contestada",
      goal_description:
        "Por 5 partidas, scoutar no 3-2 e 4-1; se 2+ jogadores contestarem sua comp, preparar plano B antes do rolldown.",
    });
  }

  if (economyNotes.includes("fraco") || economyNotes.includes("quebrei") || economyNotes.includes("pobre")) {
    rules.push({
      priority: 84,
      diagnosis: `Suas notas indicam problema de economia. Isso provavelmente afetou timing de level, rolldown e qualidade final do board.`,
      analysis: `Economia ruim em TFT limita opções. Você rola menos, sobe level atrasado e tem menos margem para corrigir composição. O impacto aparece principalmente no stage 4.`,
      correction: `Controle melhor seus intervalos de economia. Evite rolar pequenas quantidades sem objetivo. Role quando houver spike claro: completar pares, estabilizar board ou subir qualidade no timing correto.`,
      training: `Nas próximas 5 partidas, anote seu gold no 3-2, 4-1 e 4-5. O objetivo é saber se você está quebrando economia sem ganhar força real.`,
      next_step: `Na próxima partida, só faça rolldown grande se tiver objetivo claro: estabilizar, completar pares ou subir spike da composição.`,
      biggest_mistake: "Gastar economia sem converter em força real.",
      recurring_pattern: "Rolldown sem plano claro de spike.",
      goal_title: "Converter economia em força",
      goal_description:
        "Nas próximas 5 partidas, anotar gold no 3-2, 4-1 e 4-5 e só rolar quando houver spike claro de força.",
    });
  }

  if (playedFor.includes("top 1") && placement !== null && placement >= 5) {
    rules.push({
      priority: 82,
      diagnosis: `Você tentou jogar para Top 1, mas terminou em ${placement}º. Isso indica que o plano foi ambicioso demais para a força real do board.`,
      analysis: `Jogar para Top 1 exige HP, economia, itens e direção fortes. Se esses fatores não existem, insistir em cap alto pode virar bottom 4. Em muitos lobbies, a decisão correta é jogar para Top 4.`,
      correction: `Quando estiver fraco ou com HP baixo, simplifique: board mais forte agora, upgrades imediatos e posicionamento seguro. Não segure economia para uma versão perfeita da comp.`,
      training: `Nas próximas 5 partidas, decida no stage 4: estou jogando para Top 4 ou Top 1? Essa decisão deve ser baseada em HP, board, itens e economia.`,
      next_step: `Na próxima partida, se chegar fraco no stage 4, jogue para Top 4 e não para cap máximo.`,
      biggest_mistake: "Jogar para Top 1 sem base suficiente.",
      recurring_pattern: "Ambição de cap alto quando o jogo pede preservação.",
      goal_title: "Escolher Top 4 ou Top 1",
      goal_description:
        "No stage 4 das próximas 5 partidas, definir se o plano é Top 4 ou Top 1 com base em HP, economia, itens e força do board.",
    });
  }

  if (isTilted(base.mentalState)) {
    rules.push({
      priority: 70,
      diagnosis: `Seu estado mental foi registrado como ${mentalLabel(base.mentalState)}. Em TFT, isso costuma gerar rolldown apressado, troca de plano sem scouting ou tilt após sequência de derrotas.`,
      analysis: `O mental ruim faz o jogador abandonar fundamentos: economia, scouting, posicionamento e força relativa do lobby. Isso transforma um possível top 4 em bottom 4.`,
      correction: `Quando perder duas rodadas seguidas forte, pare e avalie: estou fraco por board, item, level ou posicionamento? Só depois decida se rola, sobe level ou muda posicionamento.`,
      training: `Nas próximas 5 partidas, após perder duas lutas seguidas, faça uma pausa de 10 segundos para scoutar antes de gastar gold.`,
      next_step: `Na próxima partida, não faça rolldown imediatamente após tilt. Scout antes.`,
      biggest_mistake: "Tomar decisão econômica sob tilt.",
      recurring_pattern: "Rolldown ou transição emocional após sequência ruim.",
      goal_title: "Scoutar antes de rolar tiltado",
      goal_description:
        "Por 5 partidas, após perder duas rodadas seguidas, scoutar o lobby antes de gastar gold.",
    });
  }

  if (rules.length === 0) {
    rules.push({
      priority: 50,
      diagnosis: `A partida com ${composition} não mostrou um erro único dominante pelos dados registrados. O foco deve ser melhorar leitura de lobby, economia e timing de spike.`,
      analysis: `Quando não há um erro claro, TFT exige disciplina de processo: scouting, economia, itens, level e posicionamento. O review melhora muito quando você registra HP, gold e força do board por stage.`,
      correction: `Escolha um ponto de controle: 3-2, 4-1 e 5-1. Em cada um, avalie força do board, economia e direção de composição.`,
      training: `Nas próximas 5 partidas, anote no 3-2 e no 4-1: HP, gold, level, board forte/médio/fraco e comp contestada.`,
      next_step: `Na próxima partida, faça scout no 3-2 e defina se continua na comp ou prepara transição.`,
      biggest_mistake: "Falta de métrica clara para avaliar força do board.",
      recurring_pattern: "Decisões tomadas sem leitura estruturada do lobby.",
      goal_title: "Criar checkpoints de lobby",
      goal_description:
        "Nas próximas 5 partidas, anotar HP, gold, level, força do board e contestação no 3-2 e no 4-1.",
    });
  }

  return pickBestRule(rules);
}

function generateValorantReview(
  base: BaseReviewInput,
  valorant: ValorantReviewInput
): MatchReviewOutput {
  const agent = clean(valorant.agent) || "seu agente";
  const agentRole = clean(valorant.agentRole) || "sua função";
  const map = clean(valorant.map) || "o mapa";
  const utilityNotes = lower(valorant.utilityNotes);
  const communicationNotes = lower(valorant.communicationNotes);

  const rules: ReviewRule[] = [];

  if (valorant.firstDeaths >= 4) {
    rules.push({
      priority: 100,
      diagnosis: `Você teve ${valorant.firstDeaths} first deaths. Esse é provavelmente o erro mais caro da partida, porque coloca seu time em desvantagem numérica logo no início dos rounds.`,
      analysis: `Em Valorant, morrer primeiro sem trade muda completamente o round. Como ${agentRole}, você precisa gerar espaço, informação ou utilidade, mas não entregar vantagem de graça.`,
      correction: `Evite ser primeiro contato seco. Entre com utilitário, peça trade, jogue segundo contato ou recue após pegar informação. Se for entry, comunique o timing da entrada antes de avançar.`,
      training: `Nas próximas 5 partidas, conte seus first deaths. A meta é no máximo 2 por partida, exceto rounds de entrada coordenada com trade claro.`,
      next_step: `Na próxima partida com ${agent}, não tome primeiro contato sem trade combinado.`,
      biggest_mistake: "Morrer primeiro sem troca garantida.",
      recurring_pattern: "Contato inicial arriscado sem utilitário ou suporte.",
      goal_title: "Reduzir first deaths",
      goal_description:
        "Nas próximas 5 partidas, limitar first deaths a no máximo 2 e só entrar primeiro com utilitário ou trade combinado.",
    });
  }

  if (valorant.acs !== null && valorant.acs > 0 && valorant.acs < 170) {
    rules.push({
      priority: 88,
      diagnosis: `Seu ACS foi baixo (${valorant.acs}). Isso sugere baixo impacto médio por round, seja por dano, trade, entrada, sobrevivência ou uso de utilitário.`,
      analysis: `ACS baixo não significa apenas pouca kill. Pode indicar que você está chegando tarde, morrendo cedo, evitando duelo necessário ou usando utilitário sem conversão.`,
      correction: `Busque impacto por round: dano útil, trade, entrada coordenada, utilitário que força espaço ou sobrevivência para retake. Não jogue rounds inteiros sem influenciar zona importante do mapa.`,
      training: `Nas próximas 5 partidas, revise 3 rounds perdidos e responda: causei dano, troquei alguém, usei utilitário com intenção ou morri sem impacto?`,
      next_step: `Na próxima partida em ${map}, escolha uma zona do mapa para disputar impacto em todo round armado.`,
      biggest_mistake: "Baixo impacto médio por round.",
      recurring_pattern: "Rounds jogados sem dano, trade ou utilidade decisiva.",
      goal_title: "Aumentar impacto por round",
      goal_description:
        "Nas próximas 5 partidas, revisar 3 rounds perdidos e identificar se houve dano, trade, utilitário útil ou morte sem impacto.",
    });
  }

  if (valorant.deaths >= 18) {
    rules.push({
      priority: 82,
      diagnosis: `Você morreu ${valorant.deaths} vezes. O número é alto e pode indicar exposição excessiva, retakes mal coordenados ou duelos repetidos em desvantagem.`,
      analysis: `Morrer muito reduz sua presença em clutch, defesa de spike e retake. Mesmo com kills, excesso de mortes pode quebrar economia e deixar seu time jogando rounds incompletos.`,
      correction: `Após morrer duas vezes no mesmo tipo de situação, mude o padrão: troque posição, jogue mais recuado, peça flash/smoke ou pare de repetir o mesmo duelo.`,
      training: `Nas próximas 5 partidas, marque suas mortes por categoria: primeiro contato, retake, lurk, pós-plant, rotação ou duelo desnecessário.`,
      next_step: `Na próxima partida, se morrer duas vezes no mesmo lugar, mude imediatamente sua posição ou timing.`,
      biggest_mistake: "Repetir exposição e morrer em padrões parecidos.",
      recurring_pattern: "Insistir no mesmo duelo ou posição após ser punido.",
      goal_title: "Mapear mortes repetidas",
      goal_description:
        "Por 5 partidas, classificar cada morte e mudar posição/timing se morrer duas vezes do mesmo jeito.",
    });
  }

  if (
    utilityNotes.includes("tarde") ||
    utilityNotes.includes("ruim") ||
    utilityNotes.includes("não usei") ||
    utilityNotes.includes("nao usei")
  ) {
    rules.push({
      priority: 80,
      diagnosis: `Suas notas indicam problema de utilitário. Isso reduz entrada, defesa, retake e controle de mapa.`,
      analysis: `Utilitário em Valorant precisa ter intenção. Smoke atrasada, flash sem follow-up ou skill guardada demais pode perder timing de round.`,
      correction: `Antes do round começar, defina o objetivo do seu utilitário: tomar espaço, negar avanço, atrasar entrada, facilitar retake ou proteger spike.`,
      training: `Nas próximas 5 partidas, escolha 2 utilitários por half para usar com plano claro e depois revise se geraram espaço, dano, delay ou informação.`,
      next_step: `Na próxima partida com ${agent}, defina antes do round qual utilitário abre sua primeira jogada.`,
      biggest_mistake: "Utilitário usado sem timing ou intenção clara.",
      recurring_pattern: "Guardar ou gastar utilitário sem conversão.",
      goal_title: "Usar utilitário com intenção",
      goal_description:
        "Nas próximas 5 partidas, definir antes do round o objetivo do primeiro utilitário: espaço, delay, informação, retake ou pós-plant.",
    });
  }

  if (
    communicationNotes.includes("pouco") ||
    communicationNotes.includes("não") ||
    communicationNotes.includes("nao") ||
    communicationNotes.includes("ruim")
  ) {
    rules.push({
      priority: 76,
      diagnosis: `Suas notas indicam problema de comunicação. Isso reduz trades, retakes e leitura coletiva do round.`,
      analysis: `Boa comunicação não é falar muito; é falar o necessário no timing certo: posição, dano, quantidade, utilitário usado e intenção.`,
      correction: `Use calls curtas: onde viu, quanto dano deu, se vai recuar, se precisa de flash/smoke e qual plano para retake ou pós-plant.`,
      training: `Nas próximas 5 partidas, faça pelo menos 3 calls úteis por round armado: posição, dano ou intenção.`,
      next_step: `Na próxima partida, priorize calls curtas antes de retake e entrada.`,
      biggest_mistake: "Comunicação insuficiente para coordenar o round.",
      recurring_pattern: "Time joga sem informação clara de posição, dano ou intenção.",
      goal_title: "Melhorar calls úteis",
      goal_description:
        "Por 5 partidas, fazer calls curtas de posição, dano ou intenção em todo round armado.",
    });
  }

  if (isTilted(base.mentalState)) {
    rules.push({
      priority: 70,
      diagnosis: `Seu estado mental foi registrado como ${mentalLabel(base.mentalState)}. Em FPS tático, isso costuma gerar peek emocional, spray forçado e retake sem coordenação.`,
      analysis: `Quando o mental cai, você tende a acelerar decisões e buscar duelo de recuperação. Isso aumenta first deaths e rounds perdidos em sequência.`,
      correction: `Depois de perder um clutch ou morrer cedo, jogue o próximo round com regra simples: sem peek seco nos primeiros 15 segundos.`,
      training: `Nas próximas 5 partidas, após morrer cedo, use o round seguinte para jogar informação, trade ou utilitário, não duelo seco.`,
      next_step: `Na próxima partida, depois de uma morte ruim, o próximo round deve começar com utilitário ou posição segura.`,
      biggest_mistake: "Peek emocional após erro ou round perdido.",
      recurring_pattern: "Tentar recuperar confiança com duelo apressado.",
      goal_title: "Controlar peek emocional",
      goal_description:
        "Por 5 partidas, após morrer cedo, jogar o round seguinte sem peek seco nos primeiros 15 segundos.",
    });
  }

  if (rules.length === 0) {
    rules.push({
      priority: 50,
      diagnosis: `A partida com ${agent} em ${map} não mostrou um erro único dominante pelos dados registrados. O foco deve ser transformar sua função em impacto mensurável por round.`,
      analysis: `Quando não há falha clara, Valorant exige consistência: trade, utilitário, comunicação, sobrevivência e controle de espaço. Como ${agentRole}, seu valor precisa aparecer no plano do round.`,
      correction: `Defina antes de cada half qual será seu papel: abrir espaço, controlar área, iniciar contato, jogar trade, lurkar ou ancorar bomb.`,
      training: `Nas próximas 5 partidas, revise 3 rounds e responda: qual era meu papel nesse round e eu executei?`,
      next_step: `Na próxima partida, defina seu papel nos rounds armados antes da barreira cair.`,
      biggest_mistake: "Falta de papel claro por round.",
      recurring_pattern: "Impacto irregular por falta de plano antes do round.",
      goal_title: "Definir papel por round",
      goal_description:
        "Nas próximas 5 partidas, escolher antes de cada round armado seu papel: entry, trade, controle, lurk, defesa ou retake.",
    });
  }

  return pickBestRule(rules);
}

function generateFallbackReview(base: BaseReviewInput): MatchReviewOutput {
  if (isTilted(base.mentalState)) {
    return {
      diagnosis: `Seu principal ponto de atenção foi o estado mental: ${mentalLabel(base.mentalState)}. Isso pode ter afetado decisão, consistência e execução.`,
      analysis:
        "Quando o mental está instável, o jogador tende a acelerar jogadas, ignorar informação e repetir erros por impulso.",
      correction:
        "Use uma regra simples: após erro grande, faça uma pausa curta, revise o objetivo da partida e escolha a próxima decisão com base em informação, não emoção.",
      training:
        "Por 5 partidas, anote toda decisão tomada logo após morte, derrota de round ou erro importante.",
      next_step:
        "Na próxima partida, depois de um erro grande, pare 5 segundos antes de tomar a próxima decisão.",
      biggest_mistake: "Decisão emocional após erro.",
      recurring_pattern: "Tentativa de compensar erro com jogada apressada.",
      goal_title: "Reset mental após erro",
      goal_description:
        "Por 5 partidas, fazer pausa de 5 segundos após erro grande antes de tomar nova decisão.",
    };
  }

  return {
    diagnosis:
      "A partida foi registrada, mas os dados ainda não apontam um erro dominante. O foco deve ser melhorar a qualidade das informações registradas.",
    analysis:
      "Quanto mais específicos forem os dados, melhor será o diagnóstico. Registre mortes, decisões críticas, objetivos, economia, utilitário e estado mental.",
    correction:
      "Na próxima partida, escolha um foco principal antes de jogar e registre se você cumpriu ou não.",
    training:
      "Por 3 partidas, registre um erro caro, uma boa decisão e uma decisão que você faria diferente.",
    next_step:
      "Na próxima partida, escolha um foco único e anote se ele foi cumprido.",
    biggest_mistake: "Falta de dados suficientes para diagnóstico preciso.",
    recurring_pattern: "Registro genérico limita a qualidade do review.",
    goal_title: "Melhorar qualidade do registro",
    goal_description:
      "Nas próximas 3 partidas, registrar um erro caro, uma boa decisão e uma decisão que faria diferente.",
  };
}

function pickBestRule(rules: ReviewRule[]): MatchReviewOutput {
  const bestRule = [...rules].sort((a, b) => b.priority - a.priority)[0];

  return {
    diagnosis: bestRule.diagnosis,
    analysis: bestRule.analysis,
    correction: bestRule.correction,
    training: bestRule.training,
    next_step: bestRule.next_step,
    biggest_mistake: bestRule.biggest_mistake,
    recurring_pattern: bestRule.recurring_pattern,
    goal_title: bestRule.goal_title,
    goal_description: bestRule.goal_description,
  };
}

function clean(value: string | null | undefined) {
  return String(value ?? "").trim();
}

function lower(value: string | null | undefined) {
  return clean(value).toLowerCase();
}

function isTilted(mentalState: string) {
  return ["tiltado", "ansioso", "cansado"].includes(mentalState);
}

function mentalLabel(mentalState: string) {
  const labels: Record<string, string> = {
    focado: "focado",
    neutro: "neutro",
    cansado: "cansado",
    tiltado: "tiltado",
    ansioso: "ansioso",
    confiante: "confiante",
  };

  return labels[mentalState] ?? mentalState;
}