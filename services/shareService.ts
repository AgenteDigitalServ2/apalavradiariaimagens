
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
        // --- Force 9:16 Aspect Ratio (Standard Stories/Reels) ---
        // We use the image height as the base and calculate width for 9:16
        const targetHeight = img.height;
        const targetWidth = (targetHeight * 9) / 16;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // --- Draw Image with "Cover" logic (Centering and Scaling) ---
        const imgAspect = img.width / img.height;
        const canvasAspect = canvas.width / canvas.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgAspect > canvasAspect) {
          // Image is wider than 9:16
          drawHeight = canvas.height;
          drawWidth = img.width * (canvas.height / img.height);
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        } else {
          // Image is narrower than 9:16 (rare for our gen but handles stock)
          drawWidth = canvas.width;
          drawHeight = img.height * (canvas.width / img.width);
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        // --- Draw Overlay (Darkening for readability) ---
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'; 
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
        const PADDING = canvas.width * 0.12; // Slightly more padding for narrow 9:16
        const CONTENT_WIDTH = canvas.width - (PADDING * 2);
        
        // --- Verse Style ---
        const verseFontSize = Math.max(40, Math.round(canvas.width / 14));
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
        const refFontSize = Math.max(24, Math.round(canvas.width / 25));
        
        // --- Explanation Style ---
        const expFontSize = Math.max(22, Math.round(canvas.width / 32));
        const expLineHeight = expFontSize * 1.5;
        ctx.font = `normal ${expFontSize}px 'Montserrat', sans-serif`;
        const expLines = getLines(ctx, explanation, CONTENT_WIDTH);

        // --- Layout Calculations ---
        const verseTotalHeight = verseLines.length * verseLineHeight;
        const spacing = canvas.height * 0.04; // Responsive spacing
        const totalHeight = verseTotalHeight + spacing + refFontSize + spacing + (expLines.length * expLineHeight);
        
        let startY = (canvas.height - totalHeight) / 2 + (verseLineHeight / 2);

        // 1. Draw Verse
        ctx.font = `normal ${verseFontSize}px 'Dancing Script', cursive`;
        ctx.fillStyle = '#FFFFFF';
        for (const line of verseLines) {
            ctx.fillText(line, canvas.width / 2, startY);
            startY += verseLineHeight;
        }

        // 2. Draw Reference
        startY += spacing / 2;
        ctx.font = `bold ${refFontSize}px 'Montserrat', sans-serif`;
        ctx.fillStyle = '#fde047'; // yellow-300
        ctx.fillText(`— ${verseReference} —`, canvas.width / 2, startY);
        startY += spacing;

        // 3. Draw Explanation
        ctx.font = `normal ${expFontSize}px 'Montserrat', sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 8;
        for (const line of expLines) {
            ctx.fillText(line, canvas.width / 2, startY);
            startY += expLineHeight;
        }

        // --- Draw Watermark (Bottom) ---
        const watermarkFontSize = Math.max(18, Math.round(canvas.width / 40));
        ctx.font = `bold ${watermarkFontSize}px 'Montserrat', sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.shadowBlur = 4;
        ctx.fillText('A Palavra Diária', canvas.width / 2, canvas.height - (canvas.height * 0.06));

        // --- Convert to Blob ---
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Falha na geração do arquivo.'));
          }
        }, 'image/jpeg', 0.95);
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
