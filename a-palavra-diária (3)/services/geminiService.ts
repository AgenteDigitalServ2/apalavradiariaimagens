
import { GoogleGenAI, Type, Modality } from "@google/genai";

const PEXELS_API_KEY = '0jlOztyKr3RcmCGI4otTNAzcAa4EvwQjuhYdwsGkrwdlueL4uUIn1Wh5';

// A diverse collection of high-quality vertical nature backgrounds for fallbacks
// Updated to force 9:16 aspect ratio (720x1280) via Unsplash parameters
const FALLBACK_IMAGES_COLLECTION = [
    "https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=80&w=720&h=1280&auto=format&fit=crop", // Lavender/Purple Landscape
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=720&h=1280&auto=format&fit=crop", // Foggy Forest
    "https://images.unsplash.com/photo-1507643179173-442727e34eac?q=80&w=720&h=1280&auto=format&fit=crop", // Mountains/Light
    "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=720&h=1280&auto=format&fit=crop", // Starry Sky
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=720&h=1280&auto=format&fit=crop", // Green Mountains
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=720&h=1280&auto=format&fit=crop", // Ocean/Beach
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=720&h=1280&auto=format&fit=crop", // Green Valley
    "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=720&h=1280&auto=format&fit=crop", // Dramatic Coast
    "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=720&h=1280&auto=format&fit=crop", // Galaxy/Stars
    "https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=720&h=1280&auto=format&fit=crop", // Waterfall
    "https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=720&h=1280&auto=format&fit=crop", // Dramatic Hills
    "https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=720&h=1280&auto=format&fit=crop", // Green Waterfall
    "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=720&h=1280&auto=format&fit=crop", // Tree/Nature
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=720&h=1280&auto=format&fit=crop", // Dark Forest
    "https://images.unsplash.com/photo-1439853949127-fa647821eba0?q=80&w=720&h=1280&auto=format&fit=crop"  // Peak
];

// Helper to get a random image from the collection
export function getFallbackImage(): string {
    const randomIndex = Math.floor(Math.random() * FALLBACK_IMAGES_COLLECTION.length);
    return FALLBACK_IMAGES_COLLECTION[randomIndex];
}

// NEW: Fetch high quality image from Pexels to ensure variety
export async function fetchPexelsImage(query: string = "nature"): Promise<string | null> {
    try {
        // Updated themes to exclude "flowers" or generic terms that might yield close-ups/plants
        const themes = ["nature", "landscape", "sky", "mountains", "ocean", "forest", "sunset", "valley", "light", "clouds", "peaceful", "horizon", "canyon"];
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];
        
        // If the query is too complex or long, default to a random nature theme mixed with "landscape"
        const searchQuery = query.length > 30 ? randomTheme : query;
        // Force "landscape" in query to avoid macro shots
        const finalQuery = `${searchQuery} landscape wide shot`;

        const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(finalQuery)}&orientation=portrait&per_page=30`, {
            headers: { Authorization: PEXELS_API_KEY }
        });

        if (!response.ok) return null;
        
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
             // Randomize selection from the results page
             const randomIndex = Math.floor(Math.random() * data.photos.length);
             return data.photos[randomIndex].src.portrait;
        }
        return null;
    } catch (e) {
        console.error("Pexels fetch failed", e);
        return null;
    }
}

// Async fallback that tries Pexels first, then static list
export async function getDynamicFallbackImage(context: string): Promise<string> {
    const pexelsImage = await fetchPexelsImage(context);
    if (pexelsImage) return pexelsImage;
    return getFallbackImage();
}

// Fallback data to ensure the app never shows an error on the first load
const FALLBACK_VERSES = [
    {
        id: "fallback-1",
        verseText: "O Senhor é o meu pastor, nada me faltará.",
        verseReference: "Salmos 23:1",
        explanation: "Uma declaração de confiança absoluta na provisão, no cuidado e na proteção de Deus sobre nossas vidas em todos os momentos.",
        imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=720&h=1280&auto=format&fit=crop",
        isFavorite: false,
        createdAt: Date.now()
    },
    {
        id: "fallback-2",
        verseText: "Porque sou eu que conheço os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.",
        verseReference: "Jeremias 29:11",
        explanation: "Uma promessa poderosa de que Deus tem o controle do nosso destino e que Seus propósitos são sempre para o nosso bem e crescimento.",
        imageUrl: "https://images.unsplash.com/photo-1507643179173-442727e34eac?q=80&w=720&h=1280&auto=format&fit=crop",
        isFavorite: false,
        createdAt: Date.now()
    },
    {
        id: "fallback-3",
        verseText: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.",
        verseReference: "1 Coríntios 13:4",
        explanation: "A definição divina do amor verdadeiro, que não se baseia em sentimentos passageiros, mas em atitudes de bondade e paciência.",
        imageUrl: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=720&h=1280&auto=format&fit=crop",
        isFavorite: false,
        createdAt: Date.now()
    },
    {
        id: "fallback-4",
        verseText: "Tudo posso naquele que me fortalece.",
        verseReference: "Filipenses 4:13",
        explanation: "Um lembrete de que nossa força não vem de nós mesmos, mas da capacidade que Deus nos dá para enfrentar qualquer desafio.",
        imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=720&h=1280&auto=format&fit=crop",
        isFavorite: false,
        createdAt: Date.now()
    },
    {
        id: "fallback-5",
        verseText: "Deixo-lhes a paz; a minha paz lhes dou. Não a dou como o mundo a dá. Não se perturbem os seus corações, nem tenham medo.",
        verseReference: "João 14:27",
        explanation: "Jesus oferece uma paz sobrenatural que independe das circunstâncias externas, acalmando nossos corações em meio às tempestades.",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=720&h=1280&auto=format&fit=crop",
        isFavorite: false,
        createdAt: Date.now()
    }
];

// Expanded Fallback Dictionary to prevent "Wrong Topic" issues when API fails
const FALLBACK_SUGGESTIONS_DB: Record<string, { verseText: string; verseReference: string }[]> = {
  'fé': [
    { verseText: "Ora, a fé é a certeza daquilo que esperamos e a prova das coisas que não vemos.", verseReference: "Hebreus 11:1" },
    { verseText: "Porque vivemos por fé, e não pelo que vemos.", verseReference: "2 Coríntios 5:7" },
    { verseText: "Sem fé é impossível agradar a Deus, pois quem dele se aproxima precisa crer que ele existe e que recompensa aqueles que o buscam.", verseReference: "Hebreus 11:6" },
    { verseText: "Jesus olhou para eles e respondeu: \"Para o homem é impossível, mas para Deus todas as coisas são possíveis\".", verseReference: "Mateus 19:26" },
    { verseText: "Consequentemente, a fé vem por se ouvir a mensagem, e a mensagem é ouvida mediante a palavra de Cristo.", verseReference: "Romanos 10:17" }
  ],
  'esperança': [
    { verseText: "Mas os que esperam no Senhor renovarão as forças, subirão com asas como águias; correrão, e não se cansarão; caminharão, e não se fatigarão.", verseReference: "Isaías 40:31" },
    { verseText: "Porque sou eu que conheço os planos que tenho para vocês', diz o Senhor, 'planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.", verseReference: "Jeremias 29:11" },
    { verseText: "Que o Deus da esperança os encha de toda alegria e paz, por sua confiança nele, para que vocês transbordem de esperança, pelo poder do Espírito Santo.", verseReference: "Romanos 15:13" },
    { verseText: "Alegrem-se na esperança, sejam pacientes na tribulação, perseverem na oração.", verseReference: "Romanos 12:12" },
    { verseText: "Bendito o homem que confia no Senhor, e cuja confiança é o Senhor.", verseReference: "Jeremias 17:7" }
  ],
  'amor': [
    { verseText: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.", verseReference: "1 Coríntios 13:4" },
    { verseText: "Acima de tudo, porém, revistam-se do amor, que é o elo perfeito.", verseReference: "Colossenses 3:14" },
    { verseText: "Nós amamos porque ele nos amou primeiro.", verseReference: "1 João 4:19" },
    { verseText: "Ainda que eu tenha o dom de profecia e saiba todos os mistérios e todo o conhecimento, e tenha uma fé capaz de mover montanhas, se não tiver amor, nada serei.", verseReference: "1 Coríntios 13:2" },
    { verseText: "Quem não ama não conhece a Deus, porque Deus é amor.", verseReference: "1 João 4:8" }
  ],
  'gratidão': [
    { verseText: "Deem graças em todas as circunstâncias, pois esta é a vontade de Deus para vocês em Cristo Jesus.", verseReference: "1 Tessalonicenses 5:18" },
    { verseText: "Este é o dia em que o Senhor agiu; alegremo-nos e exultemos neste dia.", verseReference: "Salmos 118:24" },
    { verseText: "Tudo o que fizerem, seja em palavra ou em ação, façam-no em nome do Senhor Jesus, dando por meio dele graças a Deus Pai.", verseReference: "Colossenses 3:17" },
    { verseText: "Rendam graças ao Senhor, pois ele é bom; o seu amor dura para sempre.", verseReference: "Salmos 107:1" },
    { verseText: "Bendiga o Senhor a minha alma! Não esqueça de nenhuma de suas bênçãos!", verseReference: "Salmos 103:2" }
  ],
  'paz': [
    { verseText: "Deixo-lhes a paz; a minha paz lhes dou. Não a dou como o mundo a dá. Não se perturbem os seus corações, nem tenham medo.", verseReference: "João 14:27" },
    { verseText: "E a paz de Deus, que excede todo o entendimento, guardará os seus corações e as suas mentes em Cristo Jesus.", verseReference: "Filipenses 4:7" },
    { verseText: "Bem-aventurados os pacificadores, pois serão chamados filhos de Deus.", verseReference: "Mateus 5:9" },
    { verseText: "O Senhor dá força ao seu povo; o Senhor dá a seu povo a bênção da paz.", verseReference: "Salmos 29:11" },
    { verseText: "Em paz me deito e logo adormeço, pois só tu, Senhor, me fazes viver em segurança.", verseReference: "Salmos 4:8" }
  ],
  'força': [
    { verseText: "Tudo posso naquele que me fortalece.", verseReference: "Filipenses 4:13" },
    { verseText: "O Senhor é a minha luz e a minha salvação; de quem terei temor? O Senhor é o meu forte refúgio; de quem terei medo?", verseReference: "Salmos 27:1" },
    { verseText: "Sejam fortes e corajosos. Não tenham medo nem fiquem apavorados por causa deles, pois o Senhor, o seu Deus, vai com vocês; nunca os deixará, nunca os abandonará.", verseReference: "Deuteronômio 31:6" },
    { verseText: "Deus é o nosso refúgio e a nossa fortaleza, auxílio sempre presente na adversidade.", verseReference: "Salmos 46:1" },
    { verseText: "Mas os que esperam no Senhor renovarão as forças.", verseReference: "Isaías 40:31" }
  ],
  // NEW THEMES ADDED
  'ansiedade': [
      { verseText: "Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.", verseReference: "1 Pedro 5:7" },
      { verseText: "Não andeis ansiosos por coisa alguma; antes em tudo sejam os vossos pedidos conhecidos diante de Deus pela oração e súplica com ações de graças.", verseReference: "Filipenses 4:6" },
      { verseText: "Busquei ao Senhor, e ele me respondeu; livrou-me de todos os meus temores.", verseReference: "Salmos 34:4" },
      { verseText: "A ansiedade no coração do homem o abate, mas uma boa palavra o alegra.", verseReference: "Provérbios 12:25" },
      { verseText: "Quando os cuidados do meu coração se multiplicam, as tuas consolações recreiam a minha alma.", verseReference: "Salmos 94:19" }
  ],
  'família': [
      { verseText: "Crê no Senhor Jesus e serás salvo, tu e a tua casa.", verseReference: "Atos 16:31" },
      { verseText: "Mas, se alguém não tem cuidado dos seus, e principalmente dos da sua família, negou a fé, e é pior do que o infiel.", verseReference: "1 Timóteo 5:8" },
      { verseText: "Eu e a minha casa serviremos ao Senhor.", verseReference: "Josué 24:15" },
      { verseText: "Honra a teu pai e a tua mãe, para que se prolonguem os teus dias na terra que o Senhor teu Deus te dá.", verseReference: "Êxodo 20:12" },
      { verseText: "Eis que os filhos são herança do Senhor, e o fruto do ventre o seu galardão.", verseReference: "Salmos 127:3" }
  ],
  'perdão': [
      { verseText: "Antes sede uns para com os outros benignos, misericordiosos, perdoando-vos uns aos outros, como também Deus vos perdoou em Cristo.", verseReference: "Efésios 4:32" },
      { verseText: "Se confessarmos os nossos pecados, ele é fiel e justo para nos perdoar os pecados, e nos purificar de toda a injustiça.", verseReference: "1 João 1:9" },
      { verseText: "Suportando-vos uns aos outros, e perdoando-vos uns aos outros, se alguém tiver queixa contra outro; assim como Cristo vos perdoou, assim fazei vós também.", verseReference: "Colossenses 3:13" },
      { verseText: "Porque, se perdoardes aos homens as suas ofensas, também vosso Pai celestial vos perdoará a vós.", verseReference: "Mateus 6:14" },
      { verseText: "Tu, Senhor, és bom, e pronto a perdoar, e abundante em benignidade para todos os que te invocam.", verseReference: "Salmos 86:5" }
  ],
  'sabedoria': [
      { verseText: "Se algum de vós tem falta de sabedoria, peça-a a Deus, que a todos dá liberalmente, e o não lança em rosto, e ser-lhe-á dada.", verseReference: "Tiago 1:5" },
      { verseText: "O temor do Senhor é o princípio da sabedoria, e o conhecimento do Santo a prudência.", verseReference: "Provérbios 9:10" },
      { verseText: "Porque o Senhor dá a sabedoria; da sua boca é que vem o conhecimento e o entendimento.", verseReference: "Provérbios 2:6" },
      { verseText: "A sabedoria, porém, lá do alto é, primeiramente pura, depois pacífica, moderada, tratável, cheia de misericórdia e de bons frutos, sem parcialidade, e sem hipocrisia.", verseReference: "Tiago 3:17" },
      { verseText: "Ensina-nos a contar os nossos dias, de tal maneira que alcancemos corações sábios.", verseReference: "Salmos 90:12" }
  ],
  'tristeza': [
      { verseText: "O Senhor está perto dos que têm o coração quebrantado e salva os de espírito abatido.", verseReference: "Salmos 34:18" },
      { verseText: "Bem-aventurados os que choram, pois serão consolados.", verseReference: "Mateus 5:4" },
      { verseText: "O choro pode durar uma noite, mas a alegria vem pela manhã.", verseReference: "Salmos 30:5" },
      { verseText: "Ele cura os que têm o coração partido e trata das suas feridas.", verseReference: "Salmos 147:3" },
      { verseText: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.", verseReference: "Mateus 11:28" }
  ],
  'proteção': [
      { verseText: "Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.", verseReference: "Salmos 91:1" },
      { verseText: "Mil cairão ao teu lado, e dez mil à tua direita, mas não chegará a ti.", verseReference: "Salmos 91:7" },
      { verseText: "O Senhor te guardará de todo o mal; guardará a tua alma.", verseReference: "Salmos 121:7" },
      { verseText: "Nenhuma arma forjada contra ti prosperará.", verseReference: "Isaías 54:17" },
      { verseText: "O anjo do Senhor acampa-se ao redor dos que o temem, e os livra.", verseReference: "Salmos 34:7" }
  ],
  'cura': [
      { verseText: "Verdadeiramente ele tomou sobre si as nossas enfermidades, e as nossas dores levou sobre si.", verseReference: "Isaías 53:4" },
      { verseText: "Sara-me, Senhor, e sararei; salva-me, e serei salvo; porque tu és o meu louvor.", verseReference: "Jeremias 17:14" },
      { verseText: "Confessai as vossas culpas uns aos outros, e orai uns pelos outros, para que sareis. A oração feita por um justo pode muito em seus efeitos.", verseReference: "Tiago 5:16" },
      { verseText: "Enviou a sua palavra, e os sarou; e os livrou da sua destruição.", verseReference: "Salmos 107:20" },
      { verseText: "Bendiga o Senhor a minha alma, e não esqueça de nenhuma de suas bênçãos! É ele que perdoa todos os seus pecados e cura todas as suas doenças.", verseReference: "Salmos 103:2-3" }
  ]
};

// Flatten for a generic list pool (do not slice here to allow dynamic random selection later)
const FULL_FALLBACK_POOL = Object.values(FALLBACK_SUGGESTIONS_DB).flat();

const verseSuggestionsSchema = {
  type: Type.OBJECT,
  properties: {
    verses: {
      type: Type.ARRAY,
      description: "Uma lista de 5 versículos bíblicos inspiradores em português do Brasil, relacionados ao tema.",
      items: {
        type: Type.OBJECT,
        properties: {
          verseText: {
            type: Type.STRING,
            description: "O texto completo do versículo bíblico.",
          },
          verseReference: {
            type: Type.STRING,
            description: "A referência do versículo (ex: João 3:16).",
          },
        },
        required: ["verseText", "verseReference"],
      },
    },
  },
  required: ["verses"],
};

const singleVerseSuggestionSchema = {
    type: Type.OBJECT,
    properties: {
      verseText: {
        type: Type.STRING,
        description: "O texto completo do versículo bíblico.",
      },
      verseReference: {
        type: Type.STRING,
        description: "A referência do versículo (ex: João 3:16).",
      },
    },
    required: ["verseText", "verseReference"],
};

const explanationSchema = {
    type: Type.OBJECT,
    properties: {
        explanation: {
            type: Type.STRING,
            description: "Uma explicação curta, inspiradora e de fácil entendimento do versículo, em português do Brasil.",
        },
    },
    required: ["explanation"],
};

function getGoogleGenAI() {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    throw new Error("A chave da API do Google não foi configurada.");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
}

function cleanJsonString(text: string): string {
    // Remove potential markdown code blocks
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(json)?/, '').replace(/```$/, '');
    }
    cleaned = cleaned.trim();

    // Find the first outer brace or bracket to ensure valid JSON structure
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');

    // Determine if we are looking for an object or an array
    let start = -1;
    let end = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        start = firstBrace;
        end = cleaned.lastIndexOf('}');
    } else if (firstBracket !== -1) {
        start = firstBracket;
        end = cleaned.lastIndexOf(']');
    }

    if (start !== -1 && end !== -1 && end > start) {
        return cleaned.substring(start, end + 1);
    }

    return cleaned;
}

export function getRandomFallbackVerse() {
    return {
        ...FALLBACK_VERSES[Math.floor(Math.random() * FALLBACK_VERSES.length)],
        createdAt: Date.now()
    };
}

export async function generateRandomVerseSuggestion(): Promise<{ verseText: string; verseReference: string; }> {
    try {
      const ai = getGoogleGenAI();
      // Unique ID to prevent caching
      const uniqueId = Date.now().toString();

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Forneça um único versículo bíblico inspirador aleatório da tradução Almeida Corrigida Fiel (ACF) ou Revista e Corrigida (ARC), conforme usado pela CCB. ID:${uniqueId}`,
        config: {
          systemInstruction: "Você é um assistente especialista em estudos bíblicos e na doutrina da Congregação Cristã no Brasil. Sempre use a versão Almeida. Não repita versículos recentes.",
          responseMimeType: "application/json",
          responseSchema: singleVerseSuggestionSchema,
          temperature: 1.0, 
        },
      });
  
      const jsonString = response.text ? response.text.trim() : "";
      if (!jsonString) throw new Error("Resposta vazia da API.");

      const cleanJson = cleanJsonString(jsonString);
      const parsed = JSON.parse(cleanJson);
      
      if (parsed.verseText && parsed.verseReference) {
        return parsed;
      } else {
        throw new Error("Invalid single verse suggestion structure received from API.");
      }
    } catch (error) {
      console.error("Error generating random verse suggestion:", error);
      throw error;
    }
  }

export async function generateVerseSuggestions(theme: string): Promise<{ verseText: string; verseReference: string; }[]> {
  try {
    const ai = getGoogleGenAI();
    // Generate a unique timestamp ID to force the model to treat this as a fresh request
    const uniqueId = new Date().getTime() + Math.random();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      // Prompt updated to explicitly handle typos and infer intent
      contents: `Atue como um assistente bíblico. O usuário digitou o tema: "${theme}". 
      Instruções Críticas:
      1. Se o tema for uma palavra válida em português (ex: "Dinheiro", "Trabalho", "Inveja"), forneça versículos ESTRITAMENTE sobre esse tema. NÃO MUDAR O TEMA.
      2. Apenas se parecer um erro de digitação claro (ex: "viadade" -> "vaidade"), corrija.
      3. Forneça uma lista de EXATAMENTE 5 versículos bíblicos distintos e inspiradores.
      4. Utilize EXCLUSIVAMENTE a tradução João Ferreira de Almeida (Corrigida Fiel ou Revista e Corrigida).
      (ID da solicitação: ${uniqueId})`,
      config: {
        // System instruction reinforces the persona and constraints. 
        // Temperature lowered to 0.6 to ensure stickiness to the topic.
        systemInstruction: "Você é um assistente bíblico profundo e preciso, especialista na versão Almeida (ACF/ARC). Sua prioridade máxima é a relevância temática. Se o usuário pedir sobre 'Ansiedade', responda apenas sobre 'Ansiedade'. Ignore erros gramaticais do usuário e foque na essência espiritual.",
        responseMimeType: "application/json",
        responseSchema: verseSuggestionsSchema,
        temperature: 0.6, 
      },
    });

    const jsonString = response.text ? response.text.trim() : "";
    if (!jsonString) throw new Error("Resposta vazia da API.");

    const cleanJson = cleanJsonString(jsonString);
    const parsed = JSON.parse(cleanJson);
    
    if (parsed.verses && Array.isArray(parsed.verses) && parsed.verses.length > 0) {
      return parsed.verses;
    } else if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].verseText) {
        // Handle case where model returns just the array
        return parsed;
    } else {
      throw new Error("Invalid verse suggestions structure received from API.");
    }
  } catch (error) {
    console.error("Error generating verse suggestions (switching to fallback):", error);
    
    // Fallback logic
    const normalizedTheme = theme.toLowerCase().trim();
    const matchedKey = Object.keys(FALLBACK_SUGGESTIONS_DB).find(key => normalizedTheme.includes(key));

    if (matchedKey) {
        return FALLBACK_SUGGESTIONS_DB[matchedKey];
    }
    
    // IMPORTANT: Randomize the generic fallback selection every time to prevent "stuck" UI
    return [...FULL_FALLBACK_POOL].sort(() => 0.5 - Math.random()).slice(0, 5);
  }
}

export async function generateExplanationForVerse(verseText: string, verseReference: string): Promise<string> {
    try {
        const ai = getGoogleGenAI();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Forneça uma explicação breve e inspiradora para o seguinte versículo bíblico: "${verseText}" (${verseReference}). A explicação deve ser em português do Brasil.`,
            config: {
                systemInstruction: "Você é um especialista em teologia que explica versículos bíblicos de forma clara e inspiradora. Sempre responda em português do Brasil. Não use nenhum outro idioma.",
                responseMimeType: "application/json",
                responseSchema: explanationSchema,
            },
        });
        
        const jsonString = response.text ? response.text.trim() : "";
        if (!jsonString) throw new Error("Resposta vazia da API.");
        
        const cleanJson = cleanJsonString(jsonString);
        const parsed = JSON.parse(cleanJson);

        if (parsed.explanation) {
            return parsed.explanation;
        } else {
            throw new Error("Invalid explanation structure received from API.");
        }
    } catch (error) {
        console.error("Error generating explanation:", error);
        // Simple fallback explanation if API fails
        return `Este versículo nos convida a refletir sobre a profundidade da fé e o amor divino presente em nossas vidas através da palavra. (${verseReference})`;
    }
}

// Helpers for variety in Image Generation
const LIGHTING_STYLES = [
    "luz dourada do amanhecer", "crepúsculo dramático", "luz suave e difusa", 
    "raios de sol rompendo as nuvens (god rays)", "iluminação etérea e celestial", 
    "noite estrelada serena", "luz natural brilhante de meio-dia"
];

const VIEW_ANGLES = [
    "vista aérea majestosa", "vista panorâmica de grande angular (wide shot)", 
    "horizonte distante", "vista ampla do vale", "paisagem vasta e infinita"
];

const NATURE_ELEMENTS = [
    "montanhas imponentes sob o céu", 
    "oceano vasto e profundo", 
    "floresta antiga vista do alto", 
    "cachoeira grandiosa entre rochas", 
    "deserto vasto e sereno", 
    "vale verdejante entre colinas distantes", 
    "céu dramático com nuvens e raios de sol",
    "lago cristalino refletindo montanhas"
];

function getRandomElement(arr: string[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    const ai = getGoogleGenAI();
    
    // Construct a unique style modifier for every request to prevent duplicates
    const randomLighting = getRandomElement(LIGHTING_STYLES);
    const randomAngle = getRandomElement(VIEW_ANGLES);
    const randomElement = getRandomElement(NATURE_ELEMENTS);
    
    // Mix the verse context with random visual directives.
    // RIGOROUS PROMPT ENGINEERING TO PREVENT INDOORS/PLANTS/CLOSE-UPS.
    const fullPrompt = `
      Crie uma imagem de paisagem natural GRANDIOSA e AO AR LIVRE (OUTDOOR LANDSCAPE).
      Contexto: ${prompt}.
      Cenário: ${randomElement}.
      Iluminação: ${randomLighting}.
      Angulo: ${randomAngle} (sempre vista ampla/wide shot).
      Estilo: Fotografia de natureza premiada, 8k, fotorrealista, cinemático, épico.
      
      PROIBIDO (NEGATIVE PROMPT):
      - Interiores, locais fechados, quartos, salas, janelas, portas, móveis.
      - Vasos, plantas domésticas, jardins fechados, close-ups de flores ou folhas, botânica detalhada.
      - Texto, letras, marcas d'água.
      - Pessoas, rostos, figuras humanas, corpos.
      - Animais.
      - Arquitetura, prédios, casas, construções urbanas.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Nano Banana series
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
          responseModalities: [Modality.IMAGE],
          imageConfig: {
              aspectRatio: "9:16"
          }
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/jpeg';
          return `data:${mimeType};base64,${base64ImageBytes}`;
        }
      }
    }

    throw new Error("Nenhuma imagem foi gerada.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}
