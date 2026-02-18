export const TEXTS: Record<string, string[]> = {
  ru: [
    'Программирование это искусство создавать решения из ничего',
    'Скорость печати важна для эффективной работы за компьютером',
    'Каждый символ имеет значение в коде и в жизни',
    'Тренировка пальцев развивает мышечную память',
    'Клавиатура становится продолжением мысли при практике',
    'Русская раскладка требует отдельной мышечной памяти',
    'Текст на русском языке содержит больше букв в словах',
    'Соревнования по скоропечатанию проводятся по всему миру',
    'Точность важнее скорости на первых этапах обучения',
    'Регулярные упражнения значительно улучшают результат',
  ],
  en: [
    'The quick brown fox jumps over the lazy dog',
    'Programming is the art of telling another human what you want the computer to do',
    'Typing speed matters when you work with code every day',
    'Practice makes perfect when it comes to keyboard skills',
    'Every keystroke counts in both code and communication',
    'Efficiency comes from muscle memory and focus',
    'English layout is the default for most developers',
    'Speed typing competitions are held around the world',
    'Accuracy matters more than speed when you start',
    'Regular practice will significantly improve your results',
  ],
  de: [
    'Übung macht den Meister beim Tippen auf der Tastatur',
    'Programmierung ist die Kunst Probleme zu lösen',
    'Die deutsche Sprache hat viele zusammengesetzte Wörter',
    'Geschwindigkeit und Genauigkeit sind beide wichtig',
    'Jeder Buchstabe zählt beim Schreiben von Code',
    'Die Tastatur wird zur Verlängerung der Gedanken',
    'Weltweit finden Wettbewerbe im Schnellschreiben statt',
    'Regelmäßiges Training verbessert die Ergebnisse',
    'Die deutsche Tastatur hat eine besondere Anordnung',
    'Muskelgedächtnis entwickelt sich durch Wiederholung',
  ],
  es: [
    'La práctica hace al maestro en la mecanografía',
    'La programación es el arte de resolver problemas con código',
    'Cada tecla cuenta cuando escribes en el ordenador',
    'La velocidad y la precisión son igualmente importantes',
    'El español tiene caracteres especiales como la ñ',
    'Los concursos de escritura rápida son populares',
    'El entrenamiento regular mejora los resultados',
    'La memoria muscular se desarrolla con repetición',
    'La disposición del teclado en español es diferente',
    'Escribir rápido aumenta la productividad diaria',
  ],
  fr: [
    'La pratique rend parfait pour la dactylographie',
    "La programmation est l'art de résoudre des problèmes",
    'Chaque touche compte quand on travaille sur ordinateur',
    'La vitesse et la précision sont toutes deux importantes',
    'Le français utilise des accents et des caractères spéciaux',
    'Les concours de frappe rapide ont lieu partout dans le monde',
    'Un entraînement régulier améliore considérablement les résultats',
    'La mémoire musculaire se développe par la répétition',
    'Le clavier azerty est utilisé dans les pays francophones',
    'Taper vite augmente la productivité au quotidien',
  ],
  uk: [
    'Програмування це мистецтво створювати рішення з нічого',
    "Швидкість друку важлива для ефективної роботи за комп'ютером",
    'Кожен символ має значення в коді та в житті',
    "Тренування пальців розвиває м'язову пам'ять",
    'Клавіатура стає продовженням думки при практиці',
    "Українська розкладка потребує окремої м'язової пам'яті",
    'Змагання з швидкодруку проводяться по всьому світу',
    'Точність важливіша за швидкість на перших етапах навчання',
    'Регулярні вправи значно покращують результат',
    'Текст українською містить багато літер у словах',
  ],
  it: [
    'La pratica rende perfetti nella dattilografia',
    "La programmazione è l'arte di risolvere problemi con il codice",
    'Ogni tasto conta quando lavori al computer',
    'La velocità e la precisione sono entrambe importanti',
    "La tastiera diventa un'estensione del pensiero con la pratica",
    'Le gare di battitura veloce si svolgono in tutto il mondo',
    'Un allenamento regolare migliora notevolmente i risultati',
    'La memoria muscolare si sviluppa con la ripetizione',
    'La tastiera italiana ha una disposizione particolare',
    'Scrivere velocemente aumenta la produttività quotidiana',
  ],
  pt: [
    'A prática leva à perfeição na datilografia',
    'A programação é a arte de resolver problemas com código',
    'Cada tecla conta quando se trabalha no computador',
    'A velocidade e a precisão são igualmente importantes',
    'O teclado torna-se uma extensão do pensamento com a prática',
    'Competições de digitação rápida acontecem em todo o mundo',
    'O treino regular melhora significativamente os resultados',
    'A memória muscular desenvolve-se com a repetição',
    'O teclado em português tem uma disposição específica',
    'Digitar rápido aumenta a produtividade no dia a dia',
  ],
  ar: [
    'البرمجة هي فن إنشاء الحلول من لا شيء',
    'سرعة الكتابة مهمة للعمل الفعال على الكمبيوتر',
    'كل حرف له معنى في الكود وفي الحياة',
    'تدريب الأصابع يطور الذاكرة العضلية',
    'لوحة المفاتيح تصبح امتداداً للفكر مع الممارسة',
    'مسابقات الطباعة السريعة تقام في جميع أنحاء العالم',
    'الدقة أهم من السرعة في المراحل الأولى من التعلم',
    'الممارسة المنتظمة تحسن النتائج بشكل كبير',
    'اللغة العربية تحتوي على حروف خاصة واتصال الحروف',
    'الكتابة السريعة تزيد من الإنتاجية اليومية',
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomWords(lang: string, minWords: number = 80): string {
  const list = TEXTS[lang] ?? TEXTS.en;
  const parts: string[] = [];
  let wordCount = 0;
  while (wordCount < minWords) {
    const sentence = pickRandom(list);
    parts.push(sentence);
    wordCount += sentence.split(/\s+/).length;
  }
  return parts.join(' ');
}
