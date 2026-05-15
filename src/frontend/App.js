import React, { useMemo, useState } from "https://esm.sh/react@18.2.0";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";
const h = React.createElement;

const FLOUR_CLASSES = {
  weak: {
    label: "Farinha fraca",
    protein: "Proteina abaixo de 10%",
    w: "W menor que 170",
    hydrationMin: 55,
    hydrationMax: 58,
    hydrationDefault: 57,
    yeastFresh: 1.5,
    yeastDry: 0.5,
    time: "2h a 4h",
    note: "Boa para fermentacao curta. Trabalhe com massa menos hidratada e observe o ponto."
  },
  medium: {
    label: "Farinha media",
    protein: "Proteina entre 10% e 11,5%",
    w: "W de 180 a 250",
    hydrationMin: 60,
    hydrationMax: 65,
    hydrationDefault: 63,
    yeastFresh: 0.5,
    yeastDry: 0.15,
    time: "8h a 12h",
    note: "Equilibrada para farinha nacional tipo 1 quando a proteina esta na faixa comum."
  },
  strong: {
    label: "Farinha forte",
    protein: "Proteina entre 12% e 13%",
    w: "W de 260 a 330",
    hydrationMin: 65,
    hydrationMax: 70,
    hydrationDefault: 67,
    yeastFresh: 0.2,
    yeastDry: 0.06,
    time: "24h a 48h",
    note: "Ideal para maturacao fria longa, com gluten suficiente para segurar mais agua."
  },
  special: {
    label: "Farinha especial",
    protein: "Proteina acima de 13,5%",
    w: "W maior que 330",
    hydrationMin: 70,
    hydrationMax: 80,
    hydrationDefault: 72,
    yeastFresh: 0.2,
    yeastDry: 0.06,
    time: "24h a 48h",
    note: "Absorve muita agua. Suba a hidratacao aos poucos se for sovar a mao."
  }
};

const REFERENCE_DOUGHS = [
  {
    title: "6.1 Massa basica com farinha nacional",
    details: "1 kg farinha tipo 1, 540 g agua, 40 g acucar, 10 g fermento seco, 20 g sal, 50 g azeite.",
    panetti: "Rende cerca de 5 panetti de 330 g ou 6 panetti de 275 g.",
    steps: [
      "Misture toda a agua, acucar, fermento e cerca de 1/3 da farinha ate formar uma esponja pastosa.",
      "Cubra e deixe fermentar de 15 a 30 minutos.",
      "Adicione a farinha aos poucos; incorpore azeite e sal quando a massa ainda estiver maleavel.",
      "Leve para a bancada, faca dobras e incorpore o restante da farinha.",
      "Sove por 10 a 15 minutos, faca o bolao e deixe em puntata ate dobrar de volume.",
      "Divida, boleie os panetti e leve para maturacao fria de 4 a 12 horas a 4-6 C.",
      "Retire da geladeira antes de abrir para a massa relaxar."
    ],
    use: "Referencia rapida para forno domestico e massa mais macia."
  },
  {
    title: "6.6 Italiana longa fermentacao",
    details: "1 kg farinha 00 W300, 650 g agua, 25 g sal, 30 g azeite. Fermento ajustado pelo tempo.",
    panetti: "Rende cerca de 6 panetti de 285 g ou 4 panetti de 425 g.",
    steps: [
      "Misture agua fria, fermento e cerca de 1/3 da farinha ate formar uma esponja.",
      "Cubra e deixe fermentar de 15 a 30 minutos.",
      "Adicione farinha aos poucos; incorpore azeite e sal com a massa ainda mole.",
      "Leve para a bancada, incorpore o restante da farinha e descanse 10 minutos.",
      "Sove por 10 minutos; se precisar, descanse e sove mais alguns minutos sem insistir demais.",
      "Faca o bolao, deixe em puntata por 15 a 30 minutos, divida e boleie.",
      "Mature em geladeira a 4-6 C por 24 a 72 horas, podendo ir alem se a geladeira estiver bem controlada."
    ],
    use: "Base forte para 24h a 72h em geladeira a 4-6 C."
  },
  {
    title: "6.7 Melhor borda napoletana",
    details: "1 kg Caputo Nuvola, 630 g agua fria, 25 g sal, 30 g azeite.",
    panetti: "Rende cerca de 6 panetti de 280 g ou 4 panetti de 420 g.",
    steps: [
      "Dissolva o fermento na agua fria.",
      "Adicione a farinha aos poucos ate a massa comecar a embolar.",
      "Entre com sal e azeite, misturando bem ainda na tigela.",
      "Leve para a bancada, faca dobras e incorpore a farinha reservada.",
      "Sove por 10 a 15 minutos; se nao houver ponto de veu, descanse 5 a 10 minutos.",
      "Faca o bolao, deixe em puntata por 15 a 30 minutos, divida e boleie.",
      "Mature a 4-6 C por 24 a 48 horas e retire antes de abrir para relaxar."
    ],
    use: "Boa referencia para borda alta, macia e hidratacao moderada."
  },
  {
    title: "6.8 Romana fina com biga",
    details: "Biga com 500 g Manitoba W360-380, 300 g agua e 2 g fermento seco; massa final com 1 kg W300-320, 675 g agua, 30 g sal e 25 g azeite.",
    panetti: "O PDF sugere panetti de 220 g para pizzas de 35 cm; rende cerca de 11 panetti e uma pequena sobra.",
    steps: [
      "Para a biga, misture farinha Manitoba e fermento, junte a agua e incorpore sem compactar.",
      "Mature a biga na geladeira por no minimo 24 horas, idealmente acima de 48 horas.",
      "Retire a biga para temperatura ambiente por 4 a 6 horas antes da massa final.",
      "Dissolva a biga na agua da massa final.",
      "Adicione azeite, sal e farinha aos poucos ate a massa embolar.",
      "Leve para a bancada, incorpore a farinha e sove por 10 a 15 minutos ate massa macia e sem grudar.",
      "Faca puntata de 15 a 30 minutos, divida em panetti de 220 g e mature a 4-6 C por 24 a 72 horas."
    ],
    use: "Processo avancado com pre-fermento para pizza fina tipo romana."
  },
  {
    title: "6.10 Borda napoletana com farinha nacional",
    details: "650 g agua, 100 g integral, 900 g tipo 1, 2 g fermento seco e 25 g sal.",
    panetti: "O PDF sugere 4 panetti de aproximadamente 400 g.",
    steps: [
      "Misture toda a agua com a farinha integral.",
      "Adicione farinha branca aos poucos junto com o fermento.",
      "Enquanto a mistura ainda estiver liquida, adicione o sal e dissolva bem.",
      "Continue adicionando farinha ate a massa engrossar e embolar.",
      "Leve para a bancada, faca dobras e ajuste com pouca agua se a farinha pedir.",
      "Sove por 10 a 15 minutos, usando Bertinet se estiver grudando.",
      "Deixe em puntata ate dobrar, divida em 4 panetti de cerca de 400 g e mature a 4-6 C por 24 a 48 horas."
    ],
    use: "Referencia nacional com 65% de hidratacao e maturacao fria de 24h a 48h."
  }
];

const SAUCES = [
  {
    title: "Molho 1: tomates maduros",
    items: ["1,5 kg tomates maduros", "40 g azeite extra virgem", "10 g sal", "Folhas de manjericao"],
    steps: ["Triture ou amasse os tomates ate formar um molho rustico.", "Misture sal, azeite e manjericao.", "Ajuste acidez apenas se necessario com bicarbonato ou acucar, conforme observacao do PDF."]
  },
  {
    title: "Molho 2: passata rustica",
    items: ["520 g passata rustica", "20 g azeite extra virgem", "5 g sal", "Folhas de manjericao"],
    steps: ["Misture a passata rustica com sal.", "Adicione azeite e folhas de manjericao.", "Ajuste acidez apenas se necessario com bicarbonato ou acucar, conforme observacao do PDF."]
  },
  {
    title: "Molho 3: pomodori pelati",
    items: ["480 g pomodori pelati", "20 g azeite extra virgem", "5 g sal", "Folhas de manjericao"],
    steps: ["Amasse ou triture levemente o pomodori pelati.", "Misture sal, azeite e manjericao.", "Ajuste acidez apenas se necessario com bicarbonato ou acucar, conforme observacao do PDF."]
  }
];

const TOPPINGS = [
  {
    title: "Quatro queijos",
    ingredients: ["150 g molho pomodori pelati", "200 g mussarela em cubos", "80 g gorgonzola em cubos", "120 g provolone em cubos", "100 g parmesao ralado grosso", "Azeitonas pretas", "Oregano", "Azeite"],
    assembly: "Molho, mussarela, gorgonzola, provolone e parmesao. Forno. Finalize com azeitonas, oregano e azeite."
  },
  {
    title: "Pepperoni",
    ingredients: ["150 g molho pomodori pelati", "300 g mussarela ralada", "150 g pepperoni fatiado", "100 g tomates cereja", "Manjericao", "Oregano", "Azeite"],
    assembly: "Molho, mussarela, pepperoni, tomatinhos e manjericao. Forno. Finalize com oregano e azeite."
  },
  {
    title: "Di Parma",
    ingredients: ["150 g molho pomodori pelati", "150 g presunto parma", "200 g mussarela em cubos", "1 tomate caqui", "50 g gorgonzola opcional", "Oregano", "Azeite"],
    assembly: "Molho, rodelas de tomate, mussarela e gorgonzola opcional. Forno. Finalize com parma, oregano e azeite."
  },
  {
    title: "Frango com catupiry",
    ingredients: ["200 g molho de tomates", "300 g frango cozido e desfiado", "150 g mussarela ralada", "300 g catupiry", "Azeitonas", "Oregano", "Azeite"],
    assembly: "Use 2/3 do molho e da mussarela, frango, catupiry em desenho, azeite, restante do molho e mussarela. Forno. Finalize com oregano, azeitonas e azeite."
  },
  {
    title: "Spianata romana",
    ingredients: ["200 g molho pomodori pelati", "150 g mozzarella de bufala fresca", "120 g spianata romana ou salame", "Manjericao", "Oregano", "Azeite"],
    assembly: "Molho, metade da bufala, spianata, restante da bufala, manjericao e azeite. Forno. Finalize com oregano e azeite."
  },
  {
    title: "Pancetta",
    ingredients: ["200 g molho pomodori pelati", "300 g mussarela", "150 g pancetta ou bacon fatiado fino", "Manjericao", "Oregano", "Azeite"],
    assembly: "Molho, mussarela e pancetta. Forno. Finalize com manjericao, oregano e azeite."
  },
  {
    title: "Alcachofra / Carciofini",
    ingredients: ["200 g molho pomodori pelati", "300 g mussarela em cubos", "150 g coracao de alcachofra", "150 g pecorino romano ou parmesao", "Oregano", "Azeite"],
    assembly: "Molho, mussarela, alcachofra fatiada, pecorino/parmesao e azeite. Forno. Finalize com oregano."
  },
  {
    title: "Camarao ao creme",
    ingredients: ["150 g molho pomodori pelati", "200 g creme de leite", "100 g mozzarella de bufala", "250 g mussarela ralada", "300 g camaroes medios", "50 g parmesao", "50 g tomates cereja", "Oregano", "Azeite"],
    assembly: "Molho, metade do creme, metade da bufala, metade dos camaroes, mussarela, restante dos camaroes, tomates, creme e bufala. Parmesao, azeite e forno. Finalize com oregano."
  },
  {
    title: "Burrata com rucula",
    ingredients: ["150 g molho pomodori pelati", "150 g tomates cereja", "1 burrata de 200 g", "50 g parmesao", "Rucula", "Pesto de manjericao", "Azeite"],
    assembly: "Molho e parmesao. Forno. Finalize com tomates, rucula, burrata no centro, pesto e azeite."
  },
  {
    title: "Carpaccio com rucula",
    ingredients: ["150 g molho de tomates", "150 g mozzarella de bufala", "Manjericao", "100 g carpaccio bovino", "Rucula", "100 g parmesao ou pecorino em lascas", "Azeite"],
    assembly: "Molho, mozzarella e manjericao no azeite. Forno. Finalize com carpaccio, rucula no azeite e lascas de queijo."
  },
  {
    title: "Parma speciale",
    ingredients: ["200 g molho de tomates", "1 burrata de 200 g", "200 g mucarela", "100 g presunto parma", "150 g tomates cereja", "Oregano", "Azeite"],
    assembly: "Molho e mucarela. Forno. Finalize com parma, burrata ao centro, tomates, azeite, oregano e mais azeite."
  },
  {
    title: "Atum com catupiry",
    ingredients: ["200 g molho de tomates", "340 g atum em pedacos", "150 g mussarela ralada", "400 g catupiry", "1 tomate", "Azeitonas pretas", "Oregano", "Azeite"],
    assembly: "Molho, mussarela, atum, catupiry, tomates fatiados e azeite. Forno. Finalize com oregano, azeitonas e azeite."
  },
  {
    title: "Salame e mozzarella",
    ingredients: ["200 g molho de tomates", "50 g parmesao", "200 g mozzarella de bufala rasgada", "50 g salame tipo italiano", "Manjericao", "Azeite"],
    assembly: "Molho, parmesao, mozzarella fresca, salame e azeite. Forno. Finalize com oregano e mais azeite se quiser."
  },
  {
    title: "Calabresa",
    ingredients: ["200 g molho de tomates", "300 g calabresa fatiada", "250 g mussarela ralada", "1 cebola julienne", "Oregano", "Azeitonas pretas", "Azeite"],
    assembly: "Molho, 2/3 da mussarela, calabresa, restante da mussarela e cebola. Forno. Finalize com azeitonas, oregano e azeite."
  },
  {
    title: "Portuguesa",
    ingredients: ["200 g molho de tomates", "200 g mussarela ralada", "150 g presunto cozido", "50 g azeitonas pretas", "2 ovos cozidos", "50 g parmesao", "1 tomate", "50 g ervilhas", "Oregano", "Azeite", "Cebola, pimentao ou palmito opcionais"],
    assembly: "Molho, parmesao, 2/3 da mussarela, presunto, restante da mussarela, tomate, ovos e ervilhas. Forno. Finalize com azeitonas, oregano e azeite."
  },
  {
    title: "Caprese",
    ingredients: ["150 g molho de tomates", "150 g mussarela em cubos", "200 g mozzarella de bufala", "1 tomate caqui", "Pesto de azeitonas pretas", "Manjericao", "Oregano", "Azeite"],
    assembly: "Molho, oregano e mussarela em cubos. Forno. Finalize com tomate, bufala, manjericao, oregano, pesto e azeite."
  },
  {
    title: "Zucchini",
    ingredients: ["150 g molho de tomates", "1 abobrinha pequena refogada no azeite com alho", "250 g mussarela em cubos", "50 g parmesao ou pecorino", "Manjericao ou oregano", "Azeite"],
    assembly: "Molho, abobrinha, mussarela e queijo ralado. Forno. Finalize com manjericao/oregano e azeite."
  },
  {
    title: "Melanzana",
    ingredients: ["150 g molho de tomates", "1 berinjela refogada no azeite com alho", "250 g mussarela em cubos", "100 g parmesao ou pecorino", "Manjericao ou oregano", "Azeite"],
    assembly: "Molho, metade do queijo ralado, berinjela, mussarela e restante do queijo. Forno. Finalize com manjericao/oregano e azeite."
  },
  {
    title: "Margherita napoletana",
    ingredients: ["150 g molho de tomates", "250 g mozzarella de bufala fresca", "Manjericao fresco", "Azeite"],
    assembly: "Molho com borda de 4 cm, mozzarella e algumas folhas de manjericao. Forno. Finalize com mais manjericao e azeite."
  }
];

const PREFERMENTS = [
  {
    title: "Esponja",
    subtitle: "Pre-fermento para massa de 1 kg de farinha e curta fermentacao.",
    ingredients: ["50 g farinha de trigo Tipo 1", "10 g fermento biologico seco", "70 g agua filtrada"],
    steps: [
      "Coloque a agua em um recipiente e dissolva o fermento biologico seco.",
      "Adicione a farinha e misture ate formar uma pasta homogenea.",
      "Cubra com pano umido, plastico filme ou tampa.",
      "Deixe ativar por 15 a 30 minutos, ate formar uma mistura aerada.",
      "Use essa esponja no inicio da massa principal, junto com a agua e parte da farinha."
    ],
    note: "O PDF indica essa quantidade para uma massa com 1 kg de farinha de trigo em curta fermentacao."
  },
  {
    title: "Biga",
    subtitle: "Pre-fermento firme para massas de longa maturacao.",
    ingredients: ["500 g farinha Caputo Manitoba ou Manitoba de outra marca", "2 g fermento biologico seco", "300 g agua filtrada fria"],
    steps: [
      "Misture a farinha com o fermento seco em uma caixa ou tigela.",
      "Adicione a agua fria e misture apenas ate incorporar.",
      "Mantenha a biga em grumos, sem sovar e sem compactar a massa.",
      "Cubra e leve para maturacao em geladeira a 4-6 C por no minimo 24 horas; idealmente 48 horas.",
      "Antes de usar, retire para temperatura ambiente por algumas horas, ate ficar aromatica e levemente alcoolica.",
      "Na massa final, dissolva a biga na agua da receita antes de adicionar farinha, sal e azeite."
    ],
    note: "A biga trabalha com hidratacao baixa, em torno de 60%, e ajuda sabor, estrutura e digestibilidade."
  },
  {
    title: "Poolish",
    subtitle: "Pre-fermento liquido com partes iguais de farinha e agua.",
    ingredients: ["500 g farinha Manitoba ou farinha italiana W acima de 300", "2 g fermento biologico seco", "500 g agua filtrada fria"],
    steps: [
      "Dissolva o fermento na agua fria.",
      "Adicione a farinha e misture ate nao haver farinha seca.",
      "Cubra o recipiente, deixando espaco para crescimento.",
      "Mature em geladeira a 4-6 C por 12 a 24 horas, ou ate ficar cheio de bolhas e com aroma fermentado agradavel.",
      "Use o poolish na massa final descontando a farinha e a agua que ja estao nele."
    ],
    note: "Por ser 100% hidratado, o poolish deixa a massa mais extensivel e aromatica."
  }
];

const SECTIONS = [
  { id: "massa", label: "Massa" },
  { id: "receitas", label: "Receitas do curso" },
  { id: "prefermentos", label: "Pre-Fermentacao" },
  { id: "molhos", label: "Molhos" },
  { id: "sabores", label: "Coberturas / Sabores" }
];

const MATURATION_TABLE = {
  24: { dry: [5, 10], fresh: [15, 30] },
  48: { dry: [4, 8], fresh: [12, 24] },
  72: { dry: [2, 4], fresh: [6, 12] },
  96: { dry: [1, 2], fresh: [3, 6] }
};

const PROFESSOR_MASS_PRESETS = [
  {
    type: "Farinha Nacional - Curta Fermentacao Pobre",
    flourType: "Usar Farinha Nacional - Tipo 1",
    salt: 0.02,
    oliveOil: 0.05,
    water: 0.54,
    milk: 0,
    butter: 0,
    sugar: 0.04,
    egg: 0,
    milkPowder: 0,
    dryYeast: 0.01,
    vegetableOil: 0
  },
  {
    type: "Farinha Nacional - Curta Fermentacao Rica",
    flourType: "Usar Farinha Nacional - Tipo 1",
    salt: 0.025,
    oliveOil: 0.04,
    water: 0.25,
    milk: 0.25,
    butter: 0.04,
    sugar: 0.04,
    egg: 0.001,
    milkPowder: 0,
    dryYeast: 0.01,
    vegetableOil: 0
  },
  {
    type: "Farinha Nacional - Longa Fermentacao (24 h)",
    flourType: "Usar Farinha Nacional - Tipo 1 (Forte)",
    salt: 0.025,
    oliveOil: 0.04,
    water: 0.6,
    milk: 0,
    butter: 0,
    sugar: 0,
    egg: 0,
    milkPowder: 0,
    dryYeast: 0.01,
    vegetableOil: 0
  },
  {
    type: "Farinha Nacional - Longa Fermentacao (48 h)",
    flourType: "Usar Farinha Nacional - Tipo 1 (Forte)",
    salt: 0.025,
    oliveOil: 0.04,
    water: 0.6,
    milk: 0,
    butter: 0,
    sugar: 0,
    egg: 0,
    milkPowder: 0,
    dryYeast: 0.005,
    vegetableOil: 0
  },
  {
    type: "Farinha Italiana - Curta Fermentacao",
    flourType: "Usar Farinha Italiana 00 Classica",
    salt: 0.025,
    oliveOil: 0.03,
    water: 0.6,
    milk: 0,
    butter: 0,
    sugar: 0,
    egg: 0,
    milkPowder: 0,
    dryYeast: 0.01,
    vegetableOil: 0
  },
  {
    type: "Farinha Italiana - Longa Fermentacao (24 h)",
    flourType: "Usar Farinha Italiana 00 W superior ou igual a 300",
    salt: 0.025,
    oliveOil: 0.03,
    water: 0.65,
    milk: 0,
    butter: 0,
    sugar: 0,
    egg: 0,
    milkPowder: 0,
    dryYeast: 0.01,
    vegetableOil: 0
  },
  {
    type: "Farinha Italiana - Longa Fermentacao (48 h)",
    flourType: "Usar Farinha Italiana 00 W superior ou igual a 300",
    salt: 0.025,
    oliveOil: 0.03,
    water: 0.65,
    milk: 0,
    butter: 0,
    sugar: 0,
    egg: 0,
    milkPowder: 0,
    dryYeast: 0.008,
    vegetableOil: 0
  },
  {
    type: "Farinha Italiana - Longa Fermentacao (72 h)",
    flourType: "Usar Farinha Italiana 00 W superior ou igual a 300",
    salt: 0.025,
    oliveOil: 0.03,
    water: 0.65,
    milk: 0,
    butter: 0,
    sugar: 0,
    egg: 0,
    milkPowder: 0,
    dryYeast: 0.004,
    vegetableOil: 0
  },
  {
    type: "Farinha Italiana - Longa Fermentacao (96 h)",
    flourType: "Usar Farinha Italiana 00 W superior ou igual a 300",
    salt: 0.025,
    oliveOil: 0.03,
    water: 0.65,
    milk: 0,
    butter: 0,
    sugar: 0,
    egg: 0,
    milkPowder: 0,
    dryYeast: 0.002,
    vegetableOil: 0
  },
  {
    type: "Farinha Italiana - Longa Fermentacao (120 h)",
    flourType: "Usar Farinha Italiana 00 W superior ou igual a 300",
    salt: 0.025,
    oliveOil: 0.03,
    water: 0.65,
    milk: 0,
    butter: 0,
    sugar: 0,
    egg: 0,
    milkPowder: 0,
    dryYeast: 0.001,
    vegetableOil: 0
  },
  {
    type: "Massa PAN Hut",
    flourType: "Usar Farinha Nacional - Tipo 1",
    flourPerPizza: 300,
    salt: 0.0083,
    oliveOil: 0,
    water: 0.5833,
    milk: 0,
    butter: 0,
    sugar: 0.0417,
    egg: 0,
    milkPowder: 0.0583,
    dryYeast: 0.0166,
    vegetableOil: 0.0666
  },
  {
    type: "Massa PAN Domino's",
    aliases: ["Massa PAN Domino´s"],
    flourType: "Usar Farinha Nacional - Tipo 1 (Forte)",
    flourPerPizza: 200,
    salt: 0.0167,
    oliveOil: 0,
    water: 0.5833,
    milk: 0,
    butter: 0,
    sugar: 0.0833,
    egg: 0,
    milkPowder: 0.05,
    dryYeast: 0.0083,
    vegetableOil: 0.0666
  }
];

function classifyFlour({ protein, w }) {
  const proteinValue = Number(protein);
  const wValue = Number(w);

  if (Number.isFinite(proteinValue) && proteinValue > 0) {
    if (proteinValue < 10) return "weak";
    if (proteinValue < 12) return "medium";
    if (proteinValue < 13.5) return "strong";
    return "special";
  }

  if (Number.isFinite(wValue) && wValue > 0) {
    if (wValue < 170) return "weak";
    if (wValue < 260) return "medium";
    if (wValue <= 330) return "strong";
    return "special";
  }

  return "medium";
}

function grams(value) {
  if (!Number.isFinite(value)) return "0 g";
  const rounded = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded.toLocaleString("pt-BR")} g`;
}

function formatProfessorAmount(value, unit) {
  if (unit === "un") return `${Math.round(value).toLocaleString("pt-BR")} un`;
  return grams(value);
}

function pct(value) {
  return `${String(value).replace(".", ",")}%`;
}

function sentenceSteps(text) {
  return text
    .split(".")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `${item}.`);
}

function getMaturationYeastRange(maturationHours, yeastType, flourGrams) {
  const tableRange = MATURATION_TABLE[maturationHours]?.[yeastType];
  if (!tableRange || flourGrams <= 0) return null;
  const factor = flourGrams / 1000;
  const gramsRange = tableRange.map((value) => value * factor);
  const percentRange = gramsRange.map((value) => value / flourGrams * 100);
  return {
    gramsMin: gramsRange[0],
    gramsMax: gramsRange[1],
    gramsMid: (gramsRange[0] + gramsRange[1]) / 2,
    percentMin: percentRange[0],
    percentMax: percentRange[1],
    percentMid: (percentRange[0] + percentRange[1]) / 2
  };
}

function calculateProfessorPreset({ presetType, flour, pizzaCount }) {
  const preset = PROFESSOR_MASS_PRESETS.find((item) => item.type === presetType || item.aliases?.includes(presetType)) || PROFESSOR_MASS_PRESETS[0];
  const pizzas = Math.max(Number(pizzaCount) || 0, 0);
  const flourGrams = preset.flourPerPizza ? pizzas * preset.flourPerPizza : Math.max(Number(flour) || 0, 0);
  const rows = [
    { label: "Farinha", amount: flourGrams, unit: "g", percent: 1, showZero: true },
    { label: "Sal", amount: flourGrams * preset.salt, unit: "g", percent: preset.salt },
    { label: "Azeite", amount: flourGrams * preset.oliveOil, unit: "g", percent: preset.oliveOil },
    { label: "Agua", amount: flourGrams * preset.water, unit: "g", percent: preset.water, showZero: true },
    { label: "Leite integral", amount: flourGrams * preset.milk, unit: "g", percent: preset.milk },
    { label: "Manteiga", amount: flourGrams * preset.butter, unit: "g", percent: preset.butter },
    { label: "Acucar", amount: flourGrams * preset.sugar, unit: "g", percent: preset.sugar },
    { label: "Ovo", amount: Math.ceil(flourGrams * preset.egg), unit: "un", percent: preset.egg },
    { label: "Leite em po", amount: Math.ceil(flourGrams * preset.milkPowder), unit: "g", percent: preset.milkPowder },
    { label: "Fermento biologico seco", amount: Math.ceil(flourGrams * preset.dryYeast), unit: "g", percent: preset.dryYeast },
    { label: "ou fermento biologico fresco", amount: Math.ceil(flourGrams * preset.dryYeast) * 3, unit: "g", percent: preset.dryYeast * 3 },
    { label: "Oleo vegetal", amount: Math.ceil(flourGrams * preset.vegetableOil), unit: "g", percent: preset.vegetableOil }
  ];
  const total = rows.reduce((sum, row) => sum + (row.unit === "g" ? row.amount : 0), 0);
  return { preset, flourGrams, rows, total };
}

function calculateRecipe({ flour, protein, w, hydration, yeastType, yeastMode, yeastValue, maturationHours, napoletana }) {
  const flourGrams = Math.max(Number(flour) || 0, 0);
  const classKey = classifyFlour({ protein, w });
  const flourClass = FLOUR_CLASSES[classKey];
  const selectedHydration = Math.min(Math.max(Number(hydration) || flourClass.hydrationDefault, flourClass.hydrationMin), flourClass.hydrationMax);
  const water = flourGrams * selectedHydration / 100;
  const salt = flourGrams * 0.025;
  const oilPercent = napoletana && selectedHydration > 70 ? 0 : 2;
  const oil = flourGrams * oilPercent / 100;
  const maturationRange = getMaturationYeastRange(maturationHours, yeastType, flourGrams);
  const suggestedYeastPercent = maturationRange?.percentMid ?? (yeastType === "fresh" ? flourClass.yeastFresh : flourClass.yeastDry);
  const customYeastValue = Math.max(Number(yeastValue) || 0, 0);
  const yeastPercent = yeastMode === "grams" && flourGrams > 0 ? customYeastValue / flourGrams * 100 : customYeastValue;
  const yeast = yeastMode === "grams" ? customYeastValue : flourGrams * yeastPercent / 100;
  const total = flourGrams + water + salt + oil + yeast;

  return {
    classKey,
    flourClass,
    flourGrams,
    hydration: selectedHydration,
    oilPercent,
    yeastPercent,
    suggestedYeastPercent,
    maturationRange,
    ingredients: [
      { label: "Farinha", amount: flourGrams, percent: 100, mark: "F" },
      { label: "Agua", amount: water, percent: selectedHydration, mark: "H2O" },
      { label: "Sal", amount: salt, percent: 2.5, mark: "S" },
      { label: "Azeite", amount: oil, percent: oilPercent, mark: "A" },
      { label: yeastType === "fresh" ? "Fermento fresco" : "Fermento seco", amount: yeast, percent: yeastPercent, mark: "Fe" }
    ],
    total
  };
}

function App() {
  const [flour, setFlour] = useState(1000);
  const [protein, setProtein] = useState(11);
  const [w, setW] = useState("");
  const [yeastType, setYeastType] = useState("dry");
  const [yeastMode, setYeastMode] = useState("percent");
  const [yeastValue, setYeastValue] = useState(0.75);
  const [maturationHours, setMaturationHours] = useState(24);
  const [napoletana, setNapoletana] = useState(false);
  const [activeSection, setActiveSection] = useState("massa");
  const [professorPresetType, setProfessorPresetType] = useState(PROFESSOR_MASS_PRESETS[0].type);
  const [professorFlour, setProfessorFlour] = useState(1000);
  const [professorPizzaCount, setProfessorPizzaCount] = useState(3);
  const classKey = classifyFlour({ protein, w });
  const flourClass = FLOUR_CLASSES[classKey];
  const [hydration, setHydration] = useState(flourClass.hydrationDefault);
  const [ballWeight, setBallWeight] = useState(280);

  const adjustedHydration = Math.min(Math.max(Number(hydration) || flourClass.hydrationDefault, flourClass.hydrationMin), flourClass.hydrationMax);
  const recipe = useMemo(
    () => calculateRecipe({ flour, protein, w, hydration: adjustedHydration, yeastType, yeastMode, yeastValue, maturationHours, napoletana }),
    [flour, protein, w, adjustedHydration, yeastType, yeastMode, yeastValue, maturationHours, napoletana]
  );
  const balls = Math.floor(recipe.total / (Number(ballWeight) || 1));
  const leftover = recipe.total - balls * (Number(ballWeight) || 0);
  const professorRecipe = useMemo(
    () => calculateProfessorPreset({ presetType: professorPresetType, flour: professorFlour, pizzaCount: professorPizzaCount }),
    [professorPresetType, professorFlour, professorPizzaCount]
  );

  function applyClassDefault() {
    setHydration(flourClass.hydrationDefault);
  }

  function applySuggestedYeast() {
    const range = getMaturationYeastRange(maturationHours, yeastType, Math.max(Number(flour) || 0, 0));
    const suggested = range?.percentMid ?? (yeastType === "fresh" ? flourClass.yeastFresh : flourClass.yeastDry);
    setYeastMode("percent");
    setYeastValue(suggested);
  }

  return h("div", { className: "app-shell" },
    h("header", { className: "hero" },
      h("div", { className: "hero-copy" },
        h("p", { className: "eyebrow" }, "Mestre da Pizza"),
        h("h1", null, "Calculadora Especialista de Pizza"),
        h("p", null, "Informe a farinha, proteina ou W, e receba uma formula precisa por porcentagem do padeiro.")
      ),
      h("div", { className: "hero-panel" },
        h("span", { className: "hero-mark" }, "Pizza"),
        h("strong", null, grams(recipe.total)),
        h("span", null, "massa total estimada")
      )
    ),
    h("nav", { className: "section-tabs", "aria-label": "Secoes do programa" },
      SECTIONS.map((section) => h("button", {
        key: section.id,
        type: "button",
        className: activeSection === section.id ? "active" : "",
        onClick: () => setActiveSection(section.id)
      }, section.label))
    ),
    h("main", { className: "workspace" },
      activeSection === "massa" ? h(React.Fragment, null,
        h("section", { className: "calculator-grid" },
        h("form", { className: "panel controls", onSubmit: (event) => event.preventDefault() },
          h("div", { className: "panel-heading" },
            h("span", { className: "heading-icon" }, "01"),
            h("div", null,
              h("h2", null, "Sua farinha"),
              h("p", null, "Proteina tem prioridade. Use W quando nao souber a proteina.")
            )
          ),
          h(NumberField, { label: "Farinha (g)", value: flour, onChange: setFlour, min: 1, step: 50 }),
          h("div", { className: "split" },
            h(NumberField, { label: "Proteina (%)", value: protein, onChange: setProtein, min: 0, step: 0.1 }),
            h(NumberField, { label: "W da farinha", value: w, onChange: setW, min: 0, step: 10, placeholder: "Opcional" })
          ),
          h("div", { className: "range-card" },
            h("div", { className: "range-top" },
              h("label", { htmlFor: "hydration" }, "Hidratacao"),
              h("strong", null, pct(adjustedHydration))
            ),
            h("input", {
              id: "hydration",
              type: "range",
              min: flourClass.hydrationMin,
              max: flourClass.hydrationMax,
              step: 1,
              value: adjustedHydration,
              onChange: (event) => setHydration(Number(event.target.value))
            }),
            h("div", { className: "range-meta" },
              h("span", null, pct(flourClass.hydrationMin)),
              h("button", { type: "button", onClick: applyClassDefault }, "Usar ideal"),
              h("span", null, pct(flourClass.hydrationMax))
            )
          ),
          h("div", { className: "split" },
            h("label", { className: "field" },
              h("span", null, "Fermento"),
              h("select", {
                value: yeastType,
                onChange: (event) => {
                  setYeastType(event.target.value);
                  const range = getMaturationYeastRange(maturationHours, event.target.value, Math.max(Number(flour) || 0, 0));
                  const nextSuggested = range?.percentMid ?? (event.target.value === "fresh" ? flourClass.yeastFresh : flourClass.yeastDry);
                  setYeastMode("percent");
                  setYeastValue(nextSuggested);
                }
              },
                h("option", { value: "dry" }, "Biologico seco"),
                h("option", { value: "fresh" }, "Fresco")
              )
            ),
            h(NumberField, { label: "Peso do panetto (g)", value: ballWeight, onChange: setBallWeight, min: 100, step: 10 })
          ),
          h("label", { className: "field" },
            h("span", null, "Tempo de maturacao"),
            h("select", {
              value: maturationHours,
              onChange: (event) => {
                const hours = Number(event.target.value);
                const range = getMaturationYeastRange(hours, yeastType, Math.max(Number(flour) || 0, 0));
                setMaturationHours(hours);
                if (range) {
                  setYeastMode("percent");
                  setYeastValue(range.percentMid);
                }
              }
            },
              h("option", { value: 24 }, "24h"),
              h("option", { value: 48 }, "48h"),
              h("option", { value: 72 }, "72h"),
              h("option", { value: 96 }, "96h")
            )
          ),
          h("div", { className: "yeast-card" },
            h("div", { className: "range-top" },
              h("label", null, "Quantidade de fermento"),
              h("strong", null, yeastMode === "grams" ? grams(Number(yeastValue) || 0) : pct(Number(yeastValue) || 0))
            ),
            h("div", { className: "mode-switch", role: "group", "aria-label": "Modo de fermento" },
              h("button", {
                type: "button",
                className: yeastMode === "percent" ? "active" : "",
                onClick: () => {
                  const flourGrams = Math.max(Number(flour) || 0, 0);
                  setYeastValue(flourGrams > 0 ? (Number(yeastValue) || 0) / flourGrams * 100 : 0);
                  setYeastMode("percent");
                }
              }, "Percentual"),
              h("button", {
                type: "button",
                className: yeastMode === "grams" ? "active" : "",
                onClick: () => {
                  const flourGrams = Math.max(Number(flour) || 0, 0);
                  setYeastValue(flourGrams * (Number(yeastValue) || 0) / 100);
                  setYeastMode("grams");
                }
              }, "Gramas")
            ),
            h("input", {
              type: "number",
              min: 0,
              step: yeastMode === "grams" ? 0.1 : 0.01,
              value: yeastValue,
              onChange: (event) => setYeastValue(event.target.value)
            }),
            h("div", { className: "yeast-meta" },
              h("span", null, recipe.maturationRange
                ? `Tabela ${maturationHours}h: ${grams(recipe.maturationRange.gramsMin)} a ${grams(recipe.maturationRange.gramsMax)} (${pct(Math.round(recipe.maturationRange.percentMin * 100) / 100)} a ${pct(Math.round(recipe.maturationRange.percentMax * 100) / 100)}). Sugestao: ${grams(recipe.maturationRange.gramsMid)}`
                : `Sugestao para esta farinha: ${pct(recipe.suggestedYeastPercent)} (${grams(recipe.flourGrams * recipe.suggestedYeastPercent / 100)})`),
              h("button", { type: "button", onClick: applySuggestedYeast }, "Usar sugestao")
            )
          ),
          h("label", { className: "checkline" },
            h("input", { type: "checkbox", checked: napoletana, onChange: (event) => setNapoletana(event.target.checked) }),
            h("span", null, "Estilo napolitano puro: omitir azeite quando a hidratacao passar de 70%.")
          )
        ),
        h("section", { className: "panel result" },
          h("div", { className: "panel-heading" },
            h("span", { className: "heading-icon" }, "02"),
            h("div", null,
              h("h2", null, "Receita calculada"),
              h("p", null, `${recipe.flourClass.label} - fermentacao sugerida de ${recipe.flourClass.time}`)
            )
          ),
          h("div", { className: "ingredient-list" },
            recipe.ingredients.map((ingredient) => h(IngredientRow, { key: ingredient.label, ingredient }))
          ),
          h("div", { className: "summary-band" },
            h("div", null, h("span", null, "Massa total"), h("strong", null, grams(recipe.total))),
            h("div", null, h("span", null, "Panetti"), h("strong", null, `${Number.isFinite(balls) ? balls : 0} x ${grams(Number(ballWeight) || 0)}`)),
            h("div", null, h("span", null, "Sobra"), h("strong", null, grams(leftover)))
          ),
          h("p", { className: "chef-note" }, recipe.flourClass.note)
        )
        ),
        h("section", { className: "professor-panel panel" },
          h("div", { className: "panel-heading" },
            h("span", { className: "heading-icon" }, "P"),
            h("div", null,
              h("h2", null, "Modelo do professor"),
              h("p", null, "Calculadora extraida da planilha Mestre da Pizza; a selecao equivale a celula C7.")
            )
          ),
          h("div", { className: "professor-controls" },
            h("label", { className: "field professor-type" },
              h("span", null, "Tipo de massa"),
              h("select", { value: professorPresetType, onChange: (event) => setProfessorPresetType(event.target.value) },
                PROFESSOR_MASS_PRESETS.map((preset) => h("option", { key: preset.type, value: preset.type }, preset.type))
              )
            ),
            h(NumberField, { label: "Quantidade de farinha (g)", value: professorFlour, onChange: setProfessorFlour, min: 0, step: 50 }),
            h(NumberField, { label: "Quantidade de pizzas", value: professorPizzaCount, onChange: setProfessorPizzaCount, min: 0, step: 1 })
          ),
          h("div", { className: "professor-summary" },
            h("div", null, h("span", null, "Tipo de farinha"), h("strong", null, professorRecipe.preset.flourType)),
            h("div", null, h("span", null, "Farinha calculada"), h("strong", null, grams(professorRecipe.flourGrams))),
            h("div", null, h("span", null, "Massa aprox."), h("strong", null, grams(professorRecipe.total)))
          ),
          h("div", { className: "professor-table" },
            professorRecipe.rows.map((row) => h("div", { className: row.amount > 0 || row.showZero ? "professor-row" : "professor-row muted", key: row.label },
              h("span", null, row.label),
              h("strong", null, row.amount > 0 || row.showZero ? formatProfessorAmount(row.amount, row.unit) : "-"),
              h("small", null, row.percent ? pct(Math.round(row.percent * 10000) / 100) : "-")
            ))
          ),
          h("p", { className: "chef-note" }, "Nos modelos PAN, a farinha e calculada pela quantidade de pizzas: 300 g por pizza na PAN Hut e 200 g por pizza na PAN Domino's.")
        ),
        h("section", { className: "info-grid" },
        h("article", { className: "panel guidance" },
          h("div", { className: "panel-heading" },
            h("span", { className: "heading-icon" }, "03"),
            h("div", null, h("h2", null, "Regra de uso"), h("p", null, "Fluxo pratico para sua rotina"))
          ),
          h("ol", null,
            h("li", null, "Misture agua, fermento e parte da farinha ate formar uma esponja quando estiver fazendo massa rapida."),
            h("li", null, "Adicione farinha aos poucos; entre com sal e azeite enquanto a massa ainda esta maleavel."),
            h("li", null, "Sove de 10 a 15 minutos, descanse se precisar, e busque massa lisa com boa extensibilidade."),
            h("li", null, "Faca puntata, divida em panetti, maturacao fria a 4-6 C quando a farinha suportar fermentacao longa.")
          )
        ),
        h("article", { className: "panel flour-map" },
          h("div", { className: "panel-heading" },
            h("span", { className: "heading-icon" }, "04"),
            h("div", null, h("h2", null, "Mapa farinha x hidratacao"), h("p", null, "Baseado nas suas regras"))
          ),
          Object.entries(FLOUR_CLASSES).map(([key, item]) => h("div", { className: key === recipe.classKey ? "map-row active" : "map-row", key },
            h("strong", null, item.label),
            h("span", null, `${item.protein} - ${item.w}`),
            h("b", null, `${pct(item.hydrationMin)} a ${pct(item.hydrationMax)}`)
          ))
        ),
        h("article", { className: "panel maturation-map" },
          h("div", { className: "panel-heading" },
            h("span", { className: "heading-icon" }, "05"),
            h("div", null, h("h2", null, "Maturacao x fermento"), h("p", null, "Faixas da tabela do curso para cada 1 kg de farinha."))
          ),
          h("div", { className: "maturation-table" },
            h("div", { className: "maturation-row head" },
              h("strong", null, "Horas"),
              h("strong", null, "Seco"),
              h("strong", null, "Fresco")
            ),
            Object.entries(MATURATION_TABLE).map(([hours, item]) => h("div", {
              className: Number(hours) === Number(maturationHours) ? "maturation-row active" : "maturation-row",
              key: hours
            },
              h("span", null, `${hours}h`),
              h("span", null, `${item.dry[0]} a ${item.dry[1]} g`),
              h("span", null, `${item.fresh[0]} a ${item.fresh[1]} g`)
            ))
          )
        )
        )
      ) : null,
      activeSection === "receitas" ? h("section", { className: "section-block" },
        h("div", { className: "section-title" },
          h("h2", null, "Receitas do curso registradas"),
          h("p", null, "Referencias extraidas dos PDFs anexados para consulta rapida.")
        ),
        h("div", { className: "cards" },
          REFERENCE_DOUGHS.map((item) => h("article", { className: "recipe-card", key: item.title },
            h("h3", null, item.title),
            h("p", null, item.details),
            h("b", null, item.panetti),
            h(StepList, { title: "Passo a passo", steps: item.steps }),
            h("span", null, item.use)
          ))
        )
      ) : null,
      activeSection === "prefermentos" ? h("section", { className: "section-block" },
        h("div", { className: "section-title" },
          h("h2", null, "Pre-Fermentacao"),
          h("p", null, "Esponja, biga e poolish registrados dos PDFs do curso.")
        ),
        h("div", { className: "preferment-grid" },
          PREFERMENTS.map((item) => h("article", { className: "panel preferment-card", key: item.title },
            h("h3", null, item.title),
            h("p", { className: "preferment-subtitle" }, item.subtitle),
            h("h4", null, "Ingredientes"),
            h("ul", null, item.ingredients.map((ingredient) => h("li", { key: ingredient }, ingredient))),
            h(StepList, { title: "Passo a passo", steps: item.steps }),
            h("p", { className: "preferment-note" }, item.note)
          ))
        )
      ) : null,
      activeSection === "molhos" ? h("section", { className: "section-block" },
        h("div", { className: "section-title" },
          h("h2", null, "Molhos"),
          h("p", null, "Pomodoro separado da massa, como voce pediu.")
        ),
        h("div", { className: "sauce-grid" },
          SAUCES.map((sauce) => h("article", { className: "panel sauce-card", key: sauce.title },
            h("h3", null, sauce.title),
            h("h4", null, "Ingredientes"),
            h("ul", null, sauce.items.map((item) => h("li", { key: item }, item))),
            h(StepList, { title: "Preparo / uso", steps: sauce.steps }),
            h("p", null, "Se estiver acido, use uma pitada de bicarbonato ou meia colher de sopa de acucar para suavizar.")
          ))
        )
      ) : null,
      activeSection === "sabores" ? h("section", { className: "section-block" },
        h("div", { className: "section-title" },
          h("h2", null, "Coberturas / Sabores"),
          h("p", null, `${TOPPINGS.length} pizzas registradas dos PDFs para consulta rapida.`)
        ),
        h("div", { className: "flavor-grid" },
          TOPPINGS.map((flavor) => h("article", { className: "panel flavor-card", key: flavor.title },
            h("h3", null, flavor.title),
            h("h4", null, "Ingredientes"),
            h("ul", null, flavor.ingredients.map((item) => h("li", { key: item }, item))),
            h(StepList, { title: "Montagem", steps: sentenceSteps(flavor.assembly) })
          ))
        ),
        h("article", { className: "panel oven-note" },
          h("h3", null, "Forneamento padrao do curso"),
          h("p", null, "Forno profissional acima de 350 C no teto e 320 C no lastro. Em forno domestico, preaqueca por cerca de 1 hora na temperatura maxima com pedra refrataria, pedra sabao ou chapa de aco; asse por aproximadamente 8 a 10 minutos.")
        )
      ) : null
    )
  );
}

function NumberField({ label, value, onChange, min, step, placeholder }) {
  return h("label", { className: "field" },
    h("span", null, label),
    h("input", {
      type: "number",
      value,
      min,
      step,
      placeholder,
      onChange: (event) => onChange(event.target.value)
    })
  );
}

function IngredientRow({ ingredient }) {
  return h("div", { className: "ingredient-row" },
    h("div", { className: "ingredient-icon" }, ingredient.mark),
    h("div", null,
      h("strong", null, ingredient.label),
      h("span", null, `${pct(ingredient.percent)} do padeiro`)
    ),
    h("b", null, grams(ingredient.amount))
  );
}

function StepList({ title, steps }) {
  return h("div", { className: "step-list" },
    h("h4", null, title),
    h("ol", null, steps.map((step) => h("li", { key: step }, step)))
  );
}

createRoot(document.getElementById("root")).render(h(App));
