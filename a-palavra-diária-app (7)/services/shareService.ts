
import { VerseResult } from '../types';

const createShareableImage = (result: VerseResult): Promise<Blob> => {
    const { verseText, verseReference, explanation, imageUrl } = result;
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Não foi possível obter o contexto do canvas'));
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // --- Setup Canvas Size (Maintain standard social aspect) ---
        // Let's force a slightly higher resolution for clarity if needed, but original img size is usually fine
        canvas.width = img.width;
        canvas.height = img.height;

        // --- Draw Image ---
        ctx.drawImage(img, 0, 0);

        // --- Draw Overlay (Darkening for readability) ---
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // --- Helper function to wrap text ---
        const getLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
            const words = text.split(' ');
            const lines: string[] = [];
            let currentLine = words[0] || '';
            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                const width = ctx.measureText(currentLine + " " + word).width;
                if (width < maxWidth) {
                    currentLine += " " + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            lines.push(currentLine);
            return lines;
        }

        // --- Configuration ---
        const PADDING = canvas.width * 0.1;
        const CONTENT_WIDTH = canvas.width - (PADDING * 2);
        
        // --- Verse Style ---
        const verseFontSize = Math.max(36, Math.round(canvas.width / 18));
        const verseLineHeight = verseFontSize * 1.3;
        ctx.font = `normal ${verseFontSize}px 'Dancing Script', cursive`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        const verseLines = getLines(ctx, `"${verseText}"`, CONTENT_WIDTH);
        
        // --- Reference Style ---
        const refFontSize = Math.max(20, Math.round(canvas.width / 35));
        
        // --- Explanation Style ---
        const expFontSize = Math.max(18, Math.round(canvas.width / 45));
        const expLineHeight = expFontSize * 1.4;
        ctx.font = `normal ${expFontSize}px 'Montserrat', sans-serif`;
        const expLines = getLines(ctx, explanation, CONTENT_WIDTH);

        // --- Layout Calculations ---
        const verseTotalHeight = verseLines.length * verseLineHeight;
        const spacing = 40;
        const totalHeight = verseTotalHeight + spacing + refFontSize + spacing + (expLines.length * expLineHeight);
        
        let startY = (canvas.height - totalHeight) / 2 + (verseLineHeight / 2);

        // 1. Draw Verse
        ctx.font = `normal ${verseFontSize}px 'Dancing Script', cursive`;
        for (const line of verseLines) {
            ctx.fillText(line, canvas.width / 2, startY);
            startY += verseLineHeight;
        }

        // 2. Draw Reference
        startY += spacing / 2;
        ctx.font = `bold ${refFontSize}px 'Montserrat', sans-serif`;
        ctx.fillText(`— ${verseReference} —`, canvas.width / 2, startY);
        startY += spacing;

        // 3. Draw Explanation
        ctx.font = `italic ${expFontSize}px 'Montserrat', sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = 5; // Less shadow for smaller text
        for (const line of expLines) {
            ctx.fillText(line, canvas.width / 2, startY);
            startY += expLineHeight;
        }

        // --- Draw Watermark (Bottom) ---
        const watermarkFontSize = Math.max(16, Math.round(canvas.width / 50));
        ctx.font = `normal ${watermarkFontSize}px 'Montserrat', sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 4;
        ctx.fillText('A Palavra Diária', canvas.width / 2, canvas.height - (PADDING / 1.5));

        // --- Convert to Blob ---
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Falha na geração do arquivo.'));
          }
        }, 'image/jpeg', 0.92);
      };
      
      img.onerror = () => {
        reject(new Error('Erro ao carregar imagem.'));
      };
      img.src = imageUrl;
    });
};

export const shareVerse = async (result: VerseResult, setSharing: (isSharing: boolean) => void) => {
    if (!result.imageUrl) return;
    setSharing(true);
    
    const { verseText, verseReference } = result;
    const title = 'A Palavra Diária';
    const shareText = `"${verseText}" - ${verseReference}`;

    try {
        const blob = await createShareableImage(result);
        const file = new File([blob], "palavra-diaria.jpg", { type: "image/jpeg" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: title,
                text: shareText
            });
        } else {
             if (navigator.share) {
                 await navigator.share({ title, text: shareText });
             } else {
                alert("Navegador incompatível com compartilhamento direto. Tente salvar a imagem.");
             }
        }
    } catch (error) {
        console.error("Erro ao compartilhar:", error);
    } finally {
        setSharing(false);
    }
};
