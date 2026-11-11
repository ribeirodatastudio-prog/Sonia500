// Venecia500 — mesmo jogo da Sonia500, em espanhol.
window.CONFIG = {
  prefixo: 'venecia500',
  teclado: ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM⌫↵'],
  textos: {
    erros: { 'Faltam letras': 'Faltan letras', 'Letras demais': 'Sobran letras', 'Palavra não encontrada': 'No está en la lista' },
    jaTentou: 'Ya probaste esa',
    faltam: 'Faltan letras',
    vazio: 'vacío', marcada: { fora: 'marcada en rojo', existe: 'marcada en amarillo', certa: 'marcada en verde' },
    linha: (p) => `${p.palavra}: ${p.verdes} en su lugar, ${p.amarelas} en otro lugar, ${p.vermelhas} no están`,
    apagar: 'Borrar', enviar: 'Enviar',
    parabens: '¡Felicidades, Venecia!', naoFoi: 'Esta vez no se pudo',
    dePrimeira: '¡La adivinaste a la primera!', acertouEm: (n) => `La adivinaste en ${n} intentos.`,
    falta: (q) => `Todavía te falta la palabra ${q} de hoy.`, amanha: 'Mañana hay dos palabras nuevas.',
    jogar: (q) => `Jugar la palabra ${q}`,
    palavra: (q) => `Palabra ${q}`, acertou: ', adivinada', naoAcertou: ', no adivinada',
    jogos: 'partidas', acertos: 'aciertos', seguidos: 'aciertos seguidos', melhor: 'mejor racha',
    emQuantas: 'Adivinaste en cuántos intentos',
    semNumeros: 'Los números empiezan a contar cuando termines la primera palabra.',
    palpitePrimeiro: 'Primero haz un intento', temTudo: '¡Ya tienes todo para adivinarla!',
    dicaPronta: 'Una palabra que encaja con las pistas', semMarcas: 'No hay marcas para borrar',
  },
};
