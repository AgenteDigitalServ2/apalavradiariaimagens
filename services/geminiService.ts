
import { GoogleGenAI, Type, Modality } from "@google/genai";

const PEXELS_API_KEY = "0jlOztyKr3RcmCGI4otTNAzcAa4EvwQjuhYdwsGkrwdlueL4uUIn1Wh5";
const PIXABAY_API_KEY = "41035705-a87054ca78b4d4431c1a08ecb";

// Tipo para definir a fonte da imagem
export type ImageSource = 'auto' | 'pexels' | 'pixabay';

// Lista de termos compartilhada para garantir consistência temática em ambos os serviços de fallback
const NATURE_QUERIES = [
  'nature', 'sky', 'sunset', 'sunrise', 'mountains', 'ocean', 
  'clouds', 'forest', 'peaceful landscape', 'light rays', 
  'bible nature', 'heavenly sky', 'landscape vertical'
];

const verseSuggestionsSchema = {
  type: Type.OBJECT,
  properties: {
    verses: {
      type: Type.ARRAY,
      description: "Uma lista de versículos bíblicos (pode conter o capítulo todo ou uma seleção baseada no tema) em português do Brasil.",
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
  // Tenta obter a chave de várias formas comuns para aumentar a compatibilidade
  const apiKey = 
    (import.meta as any).env?.VITE_API_KEY || 
    (import.meta as any).env?.API_KEY ||
    (import.meta as any).env?.REACT_APP_API_KEY ||
    (import.meta as any).env?.NEXT_PUBLIC_API_KEY ||
    process.env.VITE_API_KEY ||
    process.env.API_KEY;
  
  if (!apiKey) {
    console.error("API Key not found in environment variables.");
    throw new Error("A chave da API do Google não foi configurada. Verifique se a variável de ambiente VITE_API_KEY está definida.");
  }
  return new GoogleGenAI({ apiKey: apiKey });
}

/**
 * Robust JSON cleaner that extracts the JSON object or array from the text,
 * handling markdown blocks or conversational filler text from the model.
 */
function cleanJsonString(text: string): string {
  // 1. Try to extract from markdown code block
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) {
    return match[1].trim();
  }
  
  // 2. Try to find the outermost JSON object or array boundaries
  // This handles cases where the model adds conversational text without code blocks
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  
  let startIndex = -1;
  let endIndex = -1;

  // Determine which comes first to identify the root type (Object vs Array)
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIndex = firstBrace;
    endIndex = text.lastIndexOf('}');
  } else if (firstBracket !== -1) {
    startIndex = firstBracket;
    endIndex = text.lastIndexOf(']');
  }

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    return text.substring(startIndex, endIndex + 1);
  }

  // 3. Fallback: return trimmed text (e.g. if the model just outputted raw JSON)
  return text.trim();
}

/**
 * executes a promise with retry logic for specific error codes (like 429 Quota Exceeded).
 * Increased default retries to 5 and delay to 4000ms to handle hosting constraints.
 */
async function withRetry<T>(operation: () => Promise<T>, retries = 5, delay = 4000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const message = error.message?.toLowerCase() || '';
    // Check for Quota (429) or Server Overload (503)
    const isQuotaError = message.includes('429') || message.includes('quota') || message.includes('resource exhausted') || message.includes('limit');
    const isServerOverload = message.includes('503') || message.includes('overloaded');

    if (retries > 0 && (isQuotaError || isServerOverload)) {
      console.warn(`API Limit/Error hit. Retrying in ${delay}ms... Attempts left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(operation, retries - 1, delay * 2); // Exponential backoff
    }
    throw error;
  }
}

async function fetchFromPexels(): Promise<string> {
    const randomQuery = NATURE_QUERIES[Math.floor(Math.random() * NATURE_QUERIES.length)];
    
    try {
        // Pexels API request
        const response = await fetch(`https://api.pexels.com/v1/search?query=${randomQuery}&orientation=portrait&per_page=1&page=${Math.floor(Math.random() * 50) + 1}`, {
            headers: {
                Authorization: PEXELS_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`Pexels API Error: ${response.status}`);
        }

        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
            return data.photos[0].src.portrait; // Retorna a URL da imagem em modo retrato (9:16 approx)
        }
        throw new Error("No photos found in Pexels.");
    } catch (error) {
        console.error("Error fetching from Pexels:", error);
        throw error;
    }
}

async function fetchFromPixabay(): Promise<string> {
  const randomQuery = NATURE_QUERIES[Math.floor(Math.random() * NATURE_QUERIES.length)];
  
  try {
      // Pixabay API request
      const response = await fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(randomQuery)}&image_type=photo&orientation=vertical&safesearch=true&per_page=3&page=${Math.floor(Math.random() * 20) + 1}`);

      if (!response.ok) {
          throw new Error(`Pixabay API Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.hits && data.hits.length > 0) {
          // Pixabay retorna array 'hits'. Pegamos um aleatório dos 3 retornados.
          const randomHit = data.hits[Math.floor(Math.random() * data.hits.length)];
          // 'largeImageURL' é geralmente boa qualidade, 'webformatURL' é mais leve
          return randomHit.largeImageURL || randomHit.webformatURL; 
      }
      throw new Error("No photos found in Pixabay.");
  } catch (error) {
      console.error("Error fetching from Pixabay:", error);
      throw error;
  }
}

export async function generateRandomVerseSuggestion(): Promise<{ verseText: string; verseReference: string; }> {
    return withRetry(async () => {
      try {
        const ai = getGoogleGenAI();
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          // Adicionamos um fator de aleatoriedade no prompt para evitar respostas cacheadas pelo modelo
          contents: `Forneça um único versículo bíblico inspirador aleatório da tradução Almeida Corrigida Fiel (ACF) em português do Brasil. Tente variar os livros e capítulos. (Random seed: ${Math.random()})`,
          config: {
            systemInstruction: "Você é um assistente especialista em estudos bíblicos. Sempre responda em português do Brasil. Não use nenhum outro idioma.",
            responseMimeType: "application/json",
            responseSchema: singleVerseSuggestionSchema,
            temperature: 1.5, // Temperatura alta para garantir variedade
          },
        });
    
        const jsonString = cleanJsonString(response.text);
        const parsed = JSON.parse(jsonString);
        
        if (parsed.verseText && parsed.verseReference) {
          return parsed;
        } else {
          throw new Error("Invalid single verse suggestion structure received from API.");
        }
      } catch (error) {
        console.error("Error generating random verse suggestion:", error);
        throw error;
      }
    });
}

export async function generateVerseSuggestions(
  theme: string,
  book?: string,
  chapter?: string,
  verse?: string
): Promise<{ verseText: string; verseReference: string; }[]> {
  return withRetry(async () => {
    try {
      const ai = getGoogleGenAI();
      let prompt = '';

      const bookTrimmed = book?.trim();
      const chapterTrimmed = chapter?.trim();
      const verseTrimmed = verse?.trim();

      if (bookTrimmed && chapterTrimmed) {
          prompt = `Liste todos os versículos do livro de ${bookTrimmed}, capítulo ${chapterTrimmed} da Bíblia Sagrada (versão ACF).`;
          
          if (verseTrimmed) {
             prompt += ` O usuário buscou especificamente pelo versículo ${verseTrimmed}, certifique-se de incluí-lo, mas traga também os versículos ao redor ou o capítulo todo para que ele tenha escolha.`;
          } else {
             prompt += ` Liste o máximo de versículos possível deste capítulo para permitir a escolha do usuário.`;
          }
      } else if (theme && theme.trim().length > 0) {
        prompt = `Para o tema '${theme}', forneça uma lista de 5 versículos bíblicos inspiradores da tradução Almeida Corrigida Fiel (ACF) em português do Brasil.`;
        
        if (bookTrimmed) prompt += ` Filtre apenas pelo livro de ${bookTrimmed}.`;
      } else {
          prompt = "Forneça 5 versículos bíblicos inspiradores aleatórios.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Você é um assistente especialista em estudos bíblicos. Sempre responda em português do Brasil. Não use nenhum outro idioma.",
          responseMimeType: "application/json",
          responseSchema: verseSuggestionsSchema,
        },
      });

      const jsonString = cleanJsonString(response.text);
      const parsed = JSON.parse(jsonString);
      
      if (parsed.verses && Array.isArray(parsed.verses)) {
        return parsed.verses;
      } else {
        throw new Error("Invalid verse suggestions structure received from API.");
      }
    } catch (error) {
      console.error("Error generating verse suggestions:", error);
      throw error;
    }
  });
}

export async function generateExplanationForVerse(verseText: string, verseReference: string): Promise<string> {
    return withRetry(async () => {
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
            
            const jsonString = cleanJsonString(response.text);
            const parsed = JSON.parse(jsonString);

            if (parsed.explanation) {
                return parsed.explanation;
            } else {
                throw new Error("Invalid explanation structure received from API.");
            }
        } catch (error) {
            console.error("Error generating explanation:", error);
            throw error;
        }
    });
}

export async function generateImage(prompt: string, source: ImageSource = 'auto'): Promise<string> {
    // Se a fonte for especificada manualmente, usamos ela diretamente
    if (source === 'pixabay') {
        return await fetchFromPixabay();
    }
    
    if (source === 'pexels') {
        return await fetchFromPexels();
    }

    // Modo Automático (source === 'auto')
    // Tenta gerar com Gemini primeiro.
    // Se falhar, tenta Pexels.
    // Se Pexels falhar, tenta Pixabay.
    try {
      return await withRetry(async () => {
        try {
            const ai = getGoogleGenAI();
            
            const fullPrompt = `${prompt}. A imagem deve ter uma proporção de 9:16 (vertical). Não inclua nenhum tipo de texto, palavras, letras, números, marcas d'água, assinaturas, ou legendas.`;
    
            const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: fullPrompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
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
    
            throw new Error("Nenhuma imagem foi gerada pelo Gemini.");
        } catch (error) {
            // Re-throw para ser capturado pelo bloco externo e ativar o fallback
            throw error;
        }
      }, 3, 2000); 
    } catch (geminiError) {
        console.warn("Gemini image generation failed. Falling back to Stock Images...", geminiError);
        
        try {
            // Tentativa 1 de Fallback: Pexels
            console.log("Trying Pexels...");
            return await fetchFromPexels();
        } catch (pexelsError) {
            console.warn("Pexels failed. Trying Pixabay...", pexelsError);
            
            try {
                // Tentativa 2 de Fallback: Pixabay
                console.log("Trying Pixabay...");
                return await fetchFromPixabay();
            } catch (pixabayError) {
                console.error("All image services failed (Gemini, Pexels, Pixabay).", pixabayError);
                throw geminiError; // Se tudo falhar, joga o erro original
            }
        }
    }
}
