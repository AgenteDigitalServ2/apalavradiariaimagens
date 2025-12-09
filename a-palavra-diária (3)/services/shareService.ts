
import { VerseResult } from '../types';

const createShareableImage = (result: VerseResult): Promise<Blob> => {
    const { verseText, verseReference, imageUrl } = result;
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Não foi possível obter o contexto do canvas'));
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // --- Setup Canvas Matching Image Dimensions ---
        canvas.width = img.width;
        canvas.height = img.height;
        
        // --- Draw Image Full Size ---
        ctx.drawImage(img, 0, 0);

        // --- Configuration ---
        const PADDING = canvas.width * 0.08; // 8% padding
        const BACKGROUND_GRADIENT_HEIGHT = canvas.height * 0.6; // Gradient covers bottom 60%

        // --- Draw Gradient Overlay for Readability ---
        const gradient = ctx.createLinearGradient(0, canvas.height - BACKGROUND_GRADIENT_HEIGHT, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');       // Transparent at top
        gradient.addColorStop(0.5, 'rgba(0,0,0,0.6)');   // Darker in middle
        gradient.addColorStop(0.8, 'rgba(0,0,0,0.85)');  // Very dark behind text
        gradient.addColorStop(1, 'rgba(0,0,0,0.95)');    // Almost black at bottom
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, canvas.height - BACKGROUND_GRADIENT_HEIGHT, canvas.width, BACKGROUND_GRADIENT_HEIGHT);

        // --- Text Configuration ---
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

        // Font Sizes proportional to image width
        const verseFontSize = Math.max(24, Math.round(canvas.width * 0.055)); // ~5.5% of width
        const verseLineHeight = verseFontSize * 1.3;
        
        const refFontSize = Math.max(18, Math.round(canvas.width * 0.04));    // ~4% of width
        const refLineHeight = refFontSize * 1.5;

        const watermarkFontSize = Math.max(14, Math.round(canvas.width * 0.03)); // ~3% of width
        
        // --- Calculate Layout (Bottom-Up) ---
        let currentY = canvas.height - PADDING;

        ctx.textAlign = 'center';
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;

        // 1. Watermark (Bottom)
        ctx.font = `italic ${watermarkFontSize}px 'Dancing Script', cursive`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText('A Palavra Diária', canvas.width / 2, currentY);
        
        // Move up for Reference
        currentY -= (watermarkFontSize * 2.5);

        // 2. Reference
        ctx.font = `bold ${refFontSize}px 'Montserrat', sans-serif`;
        ctx.fillStyle = '#5eead4'; // Tailwind teal-300
        ctx.fillText(`- ${verseReference}`, canvas.width / 2, currentY);

        // Move up for Verse
        currentY -= (refLineHeight * 1.2);

        // 3. Verse Body
        ctx.font = `italic 500 ${verseFontSize}px 'Montserrat', sans-serif`;
        ctx.fillStyle = 'white';
        
        const maxWidth = canvas.width - (PADDING * 2);
        const verseLines = getLines(ctx, `"${verseText}"`, maxWidth);
        
        // Calculate total height of verse block to position the first line
        const totalVerseHeight = verseLines.length * verseLineHeight;
        let verseStartY = currentY - totalVerseHeight + verseLineHeight; // Adjust to baseline of last line, then up

        // Draw lines top-down from the calculated start position
        for (const line of verseLines) {
            ctx.fillText(line, canvas.width / 2, verseStartY);
            verseStartY += verseLineHeight;
        }

        // --- Convert to Blob ---
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('A conversão de Canvas para Blob falhou.'));
          }
        }, 'image/jpeg', 0.95); // High quality JPEG
      };

      img.onerror = () => {
        reject(new Error('Falha ao carregar a imagem para compartilhamento.'));
      };
      
      // Ensure we use the proxy/CORS friendly URL if needed, but usually base64 or Pexels works with anonymous crossOrigin
      img.src = imageUrl;
    });
};

export const shareVerse = async (result: VerseResult, setSharing: (isSharing: boolean) => void) => {
    if (!result.imageUrl) return;
    setSharing(true);
    
    const { verseText, verseReference } = result;
    
    const shareContent = `"${verseText}" - ${verseReference}\n\nGerado por A Palavra Diária.`;
    const title = 'A Palavra Diária';

    if (!navigator.share) {
        navigator.clipboard.writeText(shareContent).then(() => {
            alert('Conteúdo copiado para a área de transferência!');
        }).catch(err => {
            console.error('Falha ao copiar texto: ', err);
            alert('Falha ao copiar conteúdo.');
        });
        setSharing(false);
        return;
    }

    try {
        const blob = await createShareableImage(result);
        const file = new File([blob], "palavra-diaria.jpg", { type: "image/jpeg" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: title,
                text: shareContent,
                files: [file],
            });
        } else {
            // Fallback for browsers that support share but maybe not files in this context
            await navigator.share({ title, text: shareContent });
        }
    } catch (error) {
        console.error("Falha no compartilhamento:", error);
        try {
            await navigator.share({ title: title, text: shareContent });
        } catch (textShareError) {
            console.error("Falha no fallback de compartilhamento de texto:", textShareError);
            // Silent fail or simple alert if needed, but usually user cancelled
        }
    } finally {
        setSharing(false);
    }
  };
