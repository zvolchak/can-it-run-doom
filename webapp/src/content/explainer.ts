export interface ExplainerContent {
    lang: "en" | "pt-BR"
    path: string
    title: string
    description: string
    heading: string
    answer: string
    sections: { heading: string, paragraphs: string[] }[]
    faq: { question: string, answer: string }[]
    tagsHeading: string
    tagLink: (label: string, count: number) => string
    browseLabel: string
}

export const EXPLAINER_EN: ExplainerContent = {
    lang: "en",
    path: "/why-doom-runs-on-everything",
    title: "Why Can Doom Run on Everything? | Can It Run Doom?",
    description: "Why Doom has been ported to calculators, printers, pregnancy tests and more: a small portable C codebase, fixed-point math, separate game data and source code that has been public since 1997.",
    heading: "Why can Doom run on everything?",
    answer: "Doom runs on almost anything because it is small, written in portable C, needs no floating-point hardware or GPU, and its source code has been public since 1997.",
    sections: [
        {
            heading: "It was built for very modest hardware",
            paragraphs: [
                "Doom shipped in 1993 for DOS PCs built around an Intel 386 with 4 MB of RAM. It renders at 320×200 in 256 colors, entirely in software, so a port needs only a place to put pixels.",
                "The engine uses fixed-point integer math rather than floating point, which means it runs on processors that have no floating-point unit at all, such as small microcontrollers.",
            ],
        },
        {
            heading: "The source code is public and portable",
            paragraphs: [
                "id Software released the Doom source code in December 1997 and relicensed it under the GNU GPL in 1999. Anyone can read it, change it and port it.",
                "The code is plain C with a thin platform layer. Most of a port is a handful of functions: draw a frame, read a key press, get the time and sleep. Projects such as doomgeneric reduce that layer to a minimum so new ports can be written quickly.",
            ],
        },
        {
            heading: "The game data is separate from the engine",
            paragraphs: [
                "Levels, graphics and sounds live in WAD files, not in the engine. The shareware episode is freely distributable, so a port can ship with playable content, and owners of the full game can load their own WAD.",
            ],
        },
        {
            heading: "It became a tradition",
            paragraphs: [
                "Because Doom is easy to port and instantly recognizable, getting it to run on an unlikely device became a way to show that the device is a real computer. That is where the question \"Can it run Doom?\" comes from, and why this archive exists.",
            ],
        },
    ],
    faq: [
        { question: "Why can Doom run on so many devices?", answer: "It is a small, portable C program that uses integer math, renders in software and keeps its game data in separate files, so it needs very little from the hardware." },
        { question: "Is Doom open source?", answer: "Yes. id Software released the source code in 1997 and relicensed it under the GNU GPL in 1999. The original game data is not free, apart from the shareware episode." },
        { question: "Do I need to own Doom to run a port?", answer: "The engine is free. The shareware WAD can be used without buying anything, and the full game's data files require a copy of the game." },
    ],
    tagsHeading: "Browse Doom ports by tag",
    tagLink: (label, count) => `${label} (${count})`,
    browseLabel: "Browse the full archive",
}

export const EXPLAINER_PT: ExplainerContent = {
    lang: "pt-BR",
    path: "/pt-br/por-que-doom-roda-em-tudo",
    title: "Por que o Doom roda em tudo? | Can It Run Doom?",
    description: "Por que o Doom foi portado para calculadoras, impressoras, testes de gravidez e muito mais: código C pequeno e portátil, matemática de ponto fixo, dados do jogo separados e código-fonte público desde 1997.",
    heading: "Por que o Doom roda em tudo?",
    answer: "O Doom roda em quase tudo porque é pequeno, escrito em C portátil, não precisa de ponto flutuante nem de GPU e tem o código-fonte público desde 1997.",
    sections: [
        {
            heading: "Foi feito para hardware muito modesto",
            paragraphs: [
                "O Doom foi lançado em 1993 para PCs com DOS baseados em um Intel 386 com 4 MB de RAM. Ele renderiza em 320×200 com 256 cores, totalmente por software, então um port só precisa de um lugar para desenhar pixels.",
                "O motor usa matemática inteira de ponto fixo em vez de ponto flutuante, o que permite rodar em processadores sem unidade de ponto flutuante, como pequenos microcontroladores.",
            ],
        },
        {
            heading: "O código-fonte é público e portátil",
            paragraphs: [
                "A id Software liberou o código-fonte do Doom em dezembro de 1997 e o relicenciou sob a GNU GPL em 1999. Qualquer pessoa pode ler, modificar e portar o código.",
                "O código é C simples com uma camada fina de plataforma. A maior parte de um port se resume a poucas funções: desenhar um quadro, ler uma tecla, obter o tempo e esperar. Projetos como o doomgeneric reduzem essa camada ao mínimo para que novos ports sejam escritos rapidamente.",
            ],
        },
        {
            heading: "Os dados do jogo ficam separados do motor",
            paragraphs: [
                "Fases, gráficos e sons ficam em arquivos WAD, não no motor. O episódio shareware pode ser distribuído livremente, então um port pode incluir conteúdo jogável, e quem tem o jogo completo pode carregar o próprio WAD.",
            ],
        },
        {
            heading: "Virou uma tradição",
            paragraphs: [
                "Como o Doom é fácil de portar e imediatamente reconhecível, fazê-lo rodar em um dispositivo improvável virou uma forma de mostrar que o aparelho é um computador de verdade. Daí vem a pergunta \"Can it run Doom?\" e a razão de este arquivo existir.",
            ],
        },
    ],
    faq: [
        { question: "Por que o Doom roda em tantos dispositivos?", answer: "É um programa em C pequeno e portátil que usa matemática inteira, renderiza por software e guarda os dados do jogo em arquivos separados, então exige muito pouco do hardware." },
        { question: "O Doom é código aberto?", answer: "Sim. A id Software liberou o código-fonte em 1997 e o relicenciou sob a GNU GPL em 1999. Os dados originais do jogo não são livres, exceto o episódio shareware." },
        { question: "Preciso ter o Doom para rodar um port?", answer: "O motor é gratuito. O WAD shareware pode ser usado sem comprar nada, e os arquivos do jogo completo exigem uma cópia do jogo." },
    ],
    tagsHeading: "Veja ports de Doom por tag",
    tagLink: (label, count) => `${label} (${count})`,
    browseLabel: "Ver o arquivo completo",
}
