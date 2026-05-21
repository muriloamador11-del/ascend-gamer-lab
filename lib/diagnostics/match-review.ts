export type Game = "league_of_legends" | "teamfight_tactics" | "valorant";

export type BaseMatchInput = {
  game: Game;
  result: string;
  mentalState: string;
  notes: string;
};

export type LolInput = {
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

export type TftInput = {
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

export type ValorantInput = {
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

export type ReviewOutput = {
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

export function generateMatchReview({
  base,
  lol,
  tft,
  valorant,
}: {
  base: BaseMatchInput;
  lol?: LolInput;
  tft?: TftInput;
  valorant?: ValorantInput;
}): ReviewOutput {
  if (base.game === "league_of_legends" && lol) {
    return generateLolReview(base, lol);
  }

  if (base.game === "teamfight_tactics" && tft) {
    return generateTftReview(base, tft);
  }

  if (base.game === "valorant" && valorant) {
    return generateValorantReview(base, valorant);
  }

  return {
    diagnosis:
      "A partida foi registrada, mas ainda não há dados suficientes para um diagnóstico específico.",
    analysis:
      "Quanto mais contexto você registrar, mais preciso o Ascend será para encontrar padrões de erro.",
    correction:
      "Na próxima partida, registre pelo menos resultado, estado mental, erro percebido e dados principais do jogo.",
    training:
      "Faça um review curto de 3 minutos após a partida: o que funcionou, o que custou caro e qual será a próxima meta.",
    next_step:
      "Na próxima partida, preencha mais detalhes para receber uma análise mais útil.",
    biggest_mistake: "Dados insuficientes para identificar o erro mais caro.",
    recurring_pattern: "Ainda sem padrão recorrente identificado.",
    goal_title: "Registrar mais contexto da partida",
    goal_description:
      "Na próxima partida, registre detalhes suficientes para o Ascend identificar erro mais caro, correção e treino.",
  };
}

function generateLolReview(base: BaseMatchInput, lol: LolInput): ReviewOutput {
  const kdaDeaths = lol.deaths;
  const lowCs10 = lol.cs10 !== null && lol.cs10 > 0 && lol.cs10 < 60;
  const lowVision =
    lol.visionScore !== null && lol.visionScore > 0 && lol.visionScore < 15;
  const diedBeforeObjective = lol.deathsBeforeObjective >= 2;
  const manyDeaths = kdaDeaths >= 7;
  const lostLane = normalize(lol.laneResult).includes("perd");

  if (diedBeforeObjective) {
    return {
      diagnosis:
        "Você perdeu impacto por morrer antes de objetivos importantes.",
      analysis:
        "Em League of Legends, morrer antes de dragão, arauto ou barão remove sua pressão do mapa e força seu time a ceder espaço ou lutar em desvantagem.",
      correction:
        "Prepare o objetivo com antecedência: resete antes, compre controle de visão e evite andar sozinho em região escura do mapa.",
      training:
        "Nas próximas 5 partidas, sua meta é chegar 45 segundos antes do objetivo com vida, recurso e visão colocada.",
      next_step:
        "Na próxima partida, não lute no minuto anterior ao objetivo sem prioridade de wave e visão mínima.",
      biggest_mistake: "Morrer antes de objetivo.",
      recurring_pattern:
        "Risco de macro apressado: entrar em luta ou facecheck antes de preparar o mapa.",
      goal_title: "Não morrer antes de objetivo",
      goal_description:
        "Nas próximas partidas de LoL, chegue 45 segundos antes do objetivo com vida, recurso e visão mínima colocada.",
    };
  }

  if (lowVision) {
    return {
      diagnosis:
        "Seu controle de visão parece baixo para uma partida competitiva.",
      analysis:
        "Baixa visão reduz sua leitura de jungle, rotações e preparação de objetivos. Isso aumenta mortes evitáveis e lutas ruins.",
      correction:
        "Compre pinks, use ward em timers de objetivo e troque a visão quando mudar o lado forte do mapa.",
      training:
        "Em 5 partidas, acompanhe seu vision score e force o hábito de wardar antes de avançar no rio ou jungle inimiga.",
      next_step:
        "Na próxima partida, compre pelo menos uma pink antes do primeiro objetivo importante.",
      biggest_mistake: "Baixo controle de visão.",
      recurring_pattern:
        "Jogar no escuro e tomar decisões com pouca informação.",
      goal_title: "Aumentar controle de visão",
      goal_description:
        "Na próxima partida de LoL, compre pink antes do primeiro objetivo e use wards antes de avançar no rio ou jungle.",
    };
  }

  if (lowCs10) {
    return {
      diagnosis: "Seu farm aos 10 minutos está abaixo do ideal.",
      analysis:
        "CS baixo atrasa item, reduz pressão de lane e diminui sua capacidade de influenciar objetivos no mid game.",
      correction:
        "Priorize last hit, evite trocas desnecessárias em wave ruim e organize recalls sem perder ondas grandes.",
      training:
        "Treine 10 minutos de last hit em ferramenta de treino e jogue 5 partidas com meta mínima de 65 de CS aos 10 minutos.",
      next_step:
        "Na próxima partida, sua meta principal é farmar melhor até os 10 minutos, mesmo que isso reduza lutas forçadas.",
      biggest_mistake: "Farm baixo na fase de rotas.",
      recurring_pattern:
        "Trocar ou rotacionar sem antes garantir recurso básico de ouro e experiência.",
      goal_title: "Melhorar CS aos 10 minutos",
      goal_description:
        "Na próxima partida de LoL, jogue a lane com foco em atingir pelo menos 65 de CS aos 10 minutos.",
    };
  }

  if (manyDeaths || lostLane) {
    return {
      diagnosis:
        "A partida indica perda de consistência na lane ou excesso de mortes.",
      analysis:
        "Muitas mortes reduzem tempo ativo no mapa, entregam ouro e dificultam jogar sua condição de vitória.",
      correction:
        "Jogue com mais respeito aos power spikes inimigos, controle wave perto de zona segura e evite all-in sem informação do jungle.",
      training:
        "Nas próximas 5 partidas, limite suas mortes na lane a no máximo 2 antes dos 14 minutos.",
      next_step:
        "Na próxima partida, jogue os primeiros 10 minutos priorizando wave, vida e leitura do jungle.",
      biggest_mistake: "Morrer demais ou perder lane sem estabilizar.",
      recurring_pattern:
        "Forçar jogadas antes de ter condição real de luta.",
      goal_title: "Estabilizar a fase de rotas",
      goal_description:
        "Na próxima partida de LoL, limite suas mortes antes dos 14 minutos e priorize wave, vida e leitura do jungle.",
    };
  }

  return {
    diagnosis:
      "A partida não mostra um erro crítico óbvio pelos dados registrados.",
    analysis:
      "Isso pode indicar uma partida estável ou falta de dados mais específicos sobre o momento decisivo.",
    correction:
      "Use as anotações pós-jogo para identificar o minuto em que a partida mudou e qual decisão mais impactou o resultado.",
    training:
      "Faça review de uma luta ou objetivo decisivo e responda: eu tinha visão, prioridade e condição de vitória?",
    next_step:
      "Na próxima partida, registre o momento exato do erro mais caro para melhorar a precisão do diagnóstico.",
    biggest_mistake: "Erro crítico não identificado pelos dados atuais.",
    recurring_pattern:
      "Necessidade de registrar mais contexto sobre lutas, objetivos e rotações.",
    goal_title: "Registrar momento decisivo",
    goal_description:
      "Na próxima partida de LoL, anote o minuto exato em que a partida mudou e qual decisão causou isso.",
  };
}

function generateTftReview(base: BaseMatchInput, tft: TftInput): ReviewOutput {
  const placement = tft.placement ?? 0;
  const badPlacement = placement >= 6;
  const topFour = placement > 0 && placement <= 4;
  const contested = normalize(tft.contested).includes("sim");
  const playedForTop1 = normalize(tft.playedFor).includes("top 1");
  const economyNote = normalize(tft.economyNotes);

  if (badPlacement && economyNote.includes("rico")) {
    return {
      diagnosis:
        "Você provavelmente segurou economia demais enquanto seu board estava fraco.",
      analysis:
        "No TFT, vida é recurso. Se você preserva ouro, mas perde vida demais, chega tarde ao estágio decisivo e perde margem para top 4.",
      correction:
        "Quando estiver fraco no estágio 3 ou início do 4, role para estabilizar antes de pensar em composição perfeita.",
      training:
        "Nas próximas 5 partidas, faça uma checagem no 3-2 e 4-1: meu board vence pelo menos metade do lobby?",
      next_step:
        "Na próxima partida, se estiver abaixo de 60 de vida no 3-5 com board fraco, considere estabilizar antes.",
      biggest_mistake: "Greedar economia com board fraco.",
      recurring_pattern:
        "Valorizar ouro demais e vida de menos em lobby agressivo.",
      goal_title: "Estabilizar antes de perder vida demais",
      goal_description:
        "Na próxima partida de TFT, se estiver abaixo de 60 de vida no 3-5 com board fraco, role para estabilizar.",
    };
  }

  if (badPlacement && contested) {
    return {
      diagnosis:
        "Você insistiu em uma direção contestada e perdeu força relativa no lobby.",
      analysis:
        "Quando muitas pessoas disputam as mesmas unidades, seu spike atrasa e o custo para estabilizar aumenta.",
      correction:
        "Faça scouting antes do roll down e prepare uma linha alternativa com itens compatíveis.",
      training:
        "Em 5 partidas, faça scouting obrigatório antes de decidir composição final no estágio 3-2 e 4-1.",
      next_step:
        "Na próxima partida, se duas ou mais pessoas contestarem sua comp, avalie pivot antes de gastar todo o ouro.",
      biggest_mistake: "Insistir em composição contestada.",
      recurring_pattern:
        "Falta de scouting antes de comprometer economia e direção.",
      goal_title: "Scouting antes de fechar composição",
      goal_description:
        "Na próxima partida de TFT, faça scouting no 3-2 e 4-1 antes de comprometer ouro em uma composição.",
    };
  }

  if (badPlacement) {
    return {
      diagnosis:
        "A partida indica dificuldade de estabilização antes do late game.",
      analysis:
        "Bottom 4 geralmente vem de transição atrasada, board fraco ou decisão ruim de level/roll.",
      correction:
        "Identifique mais cedo se você está jogando para top 4 ou top 1 e ajuste risco conforme vida, ouro e força do lobby.",
      training:
        "Revise o estágio 3-5 e 4-1 das próximas partidas e anote se você deveria ter rolado, upado ou pivotado.",
      next_step:
        "Na próxima partida, defina no 3-2 se você está forte para economizar ou fraco para estabilizar.",
      biggest_mistake: "Estabilização tardia.",
      recurring_pattern:
        "Demora para adaptar economia, level e direção à força real do lobby.",
      goal_title: "Decidir plano no estágio 3-2",
      goal_description:
        "Na próxima partida de TFT, defina no 3-2 se você vai preservar economia, rolar para estabilizar ou preparar pivot.",
    };
  }

  if (topFour && playedForTop1) {
    return {
      diagnosis:
        "Você alcançou top 4, mas talvez tenha faltado conversão para top 1.",
      analysis:
        "Quando o objetivo é ganhar lobby, o detalhe passa a ser posicionamento, upgrades finais, scouting e itemização fina.",
      correction:
        "No late game, faça scouting a cada round e ajuste posicionamento contra os principais carries inimigos.",
      training:
        "Nas próximas partidas top 4, revise os últimos 3 rounds e anote se perdeu por posicionamento, cap de board ou item.",
      next_step:
        "Na próxima partida em top 4, foque em scouting e posicionamento antes de cada round.",
      biggest_mistake: "Falta de refinamento no late game.",
      recurring_pattern:
        "Boa base de jogo, mas precisa melhorar conversão de vantagem.",
      goal_title: "Melhorar scouting no late game",
      goal_description:
        "Na próxima partida de TFT em top 4, faça scouting antes de cada round e ajuste posicionamento contra os carries inimigos.",
    };
  }

  return {
    diagnosis:
      "A partida parece estável pelos dados registrados.",
    analysis:
      "Para aumentar a precisão, registre vida por estágio, momento exato de roll e se o lobby estava agressivo.",
    correction:
      "Use o review para identificar se sua decisão principal foi economia, level, roll ou pivot.",
    training:
      "Após cada partida, anote: meu maior erro foi economia, direção, item, scouting ou posicionamento?",
    next_step:
      "Na próxima partida, registre o momento em que decidiu sua composição final.",
    biggest_mistake: "Erro crítico não identificado pelos dados atuais.",
    recurring_pattern:
      "Necessidade de registrar mais detalhes sobre estágios e decisões de economia.",
    goal_title: "Registrar decisão de composição",
    goal_description:
      "Na próxima partida de TFT, anote o estágio em que decidiu sua composição final e por quê.",
  };
}

function generateValorantReview(
  base: BaseMatchInput,
  valorant: ValorantInput
): ReviewOutput {
  const manyFirstDeaths = valorant.firstDeaths >= 4;
  const lowImpact =
    valorant.acs !== null && valorant.acs > 0 && valorant.acs < 170;
  const negativeKd = valorant.deaths > valorant.kills;
  const utilityNotes = normalize(valorant.utilityNotes);
  const communicationNotes = normalize(valorant.communicationNotes);

  if (manyFirstDeaths) {
    return {
      diagnosis:
        "Você morreu cedo demais em muitos rounds e reduziu o impacto do time.",
      analysis:
        "First deaths em excesso quebram setups, dificultam trade e deixam o time jogando retake ou ataque em desvantagem.",
      correction:
        "Evite abrir contato sem trade possível. Use utilitário antes do peek e jogue mais próximo de um companheiro.",
      training:
        "Em 5 partidas, sua meta é morrer primeiro no máximo 3 vezes. Revise todo round em que você foi o primeiro a morrer.",
      next_step:
        "Na próxima partida, antes de abrir qualquer pixel, pergunte: alguém consegue me trocar?",
      biggest_mistake: "Excesso de first deaths.",
      recurring_pattern:
        "Tomar primeiro contato sem suporte, utilitário ou plano de saída.",
      goal_title: "Reduzir first deaths",
      goal_description:
        "Na próxima partida de Valorant, morra primeiro no máximo 3 vezes e só abra contato quando houver trade ou utilitário.",
    };
  }

  if (utilityNotes.includes("tarde") || utilityNotes.includes("pouco")) {
    return {
      diagnosis:
        "Seu uso de utilitário parece estar atrasado ou abaixo do necessário.",
      analysis:
        "Em Valorant, utilitário define espaço, entrada, retake e sobrevivência. Usar tarde demais reduz impacto mesmo acertando tiro.",
      correction:
        "Planeje seu utilitário antes do round começar e use skills para ganhar espaço, não só para reagir depois.",
      training:
        "Escolha um mapa e treine 3 setups simples de utilitário para ataque e defesa.",
      next_step:
        "Na próxima partida, defina antes de cada round qual utilitário será usado no primeiro contato.",
      biggest_mistake: "Uso atrasado ou fraco de utilitário.",
      recurring_pattern:
        "Jogar mais no improviso do que com plano de round.",
      goal_title: "Usar utilitário com plano",
      goal_description:
        "Na próxima partida de Valorant, defina antes de cada round qual utilitário será usado para ganhar espaço ou segurar avanço.",
    };
  }

  if (communicationNotes.includes("pouco") || communicationNotes.includes("sem")) {
    return {
      diagnosis:
        "A comunicação registrada indica baixa troca de informação útil.",
      analysis:
        "Comunicação objetiva melhora rotação, retake, trade e leitura do adversário. Pouca call faz o time jogar com informação incompleta.",
      correction:
        "Faça calls curtas: posição, dano, utilitário gasto, número de inimigos e intenção de rotação.",
      training:
        "Em 5 partidas, pratique calls de até 3 segundos sem reclamar ou explicar demais.",
      next_step:
        "Na próxima partida, comunique toda informação de contato em formato simples: onde, quantos, dano e intenção.",
      biggest_mistake: "Comunicação insuficiente.",
      recurring_pattern:
        "Guardar informação ou comunicar tarde demais.",
      goal_title: "Melhorar calls objetivas",
      goal_description:
        "Na próxima partida de Valorant, faça calls curtas sobre posição, quantidade, dano e intenção, sem explicar demais.",
    };
  }

  if (lowImpact || negativeKd) {
    return {
      diagnosis:
        "A partida indica baixo impacto em duelos ou dificuldade para converter presença em vantagem.",
      analysis:
        "Baixo impacto pode vir de mira, posicionamento, entrada sem suporte ou escolha ruim de timing.",
      correction:
        "Melhore crosshair placement, jogue com trade e evite reposicionar para ângulos previsíveis.",
      training:
        "Faça 10 minutos de crosshair placement, 10 minutos de prefire e 1 deathmatch focado em não agachar no primeiro tiro.",
      next_step:
        "Na próxima partida, foque em sobreviver ao primeiro contato e jogar para trade.",
      biggest_mistake: "Baixo impacto em contato.",
      recurring_pattern:
        "Duelos desfavoráveis ou entrada sem estrutura.",
      goal_title: "Jogar para trade e sobreviver",
      goal_description:
        "Na próxima partida de Valorant, foque em sobreviver ao primeiro contato e jogar próximo de alguém que possa trocar.",
    };
  }

  return {
    diagnosis:
      "A partida não mostra um erro crítico óbvio pelos dados registrados.",
    analysis:
      "Para melhorar a precisão, registre rounds em que morreu primeiro, uso de utilitário e decisões de retake.",
    correction:
      "Após a partida, escolha um round perdido e identifique se o erro foi mira, timing, utilitário, comunicação ou posicionamento.",
    training:
      "Faça um review curto de 1 round perdido por tomada de decisão.",
    next_step:
      "Na próxima partida, registre o motivo das suas 3 primeiras mortes.",
    biggest_mistake: "Erro crítico não identificado pelos dados atuais.",
    recurring_pattern:
      "Necessidade de registrar mais contexto de rounds decisivos.",
    goal_title: "Registrar motivo das primeiras mortes",
    goal_description:
      "Na próxima partida de Valorant, anote o motivo das suas 3 primeiras mortes para identificar padrão.",
  };
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}