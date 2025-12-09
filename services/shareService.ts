
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
        // --- Setup Canvas Size (Same as Image) ---
        canvas.width = img.width;
        canvas.height = img.height;

        // --- Draw Image ---
        ctx.drawImage(img, 0, 0);

        // --- Draw Overlay (Darkening) ---
        // Adiciona um escurecimento para garantir que o texto branco apareça
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // --- Text Configuration ---
        const PADDING = img.width * 0.1; // 10% padding
        const maxWidth = img.width - (PADDING * 2);
        
        // Helper function to wrap text
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

        // --- Draw Verse Text (Centered) ---
        // Usar uma fonte cursiva/artística para o versículo
        // Calculamos um tamanho de fonte dinâmico baseado na largura da imagem
        const verseFontSize = Math.max(40, Math.round(img.width / 18));
        const verseLineHeight = verseFontSize * 1.4;
        
        ctx.font = `normal ${verseFontSize}px 'Dancing Script', cursive`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Shadow for better readability
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        const verseLines = getLines(ctx, `"${verseText}"`, maxWidth);
        
        // Calculate total height of text block to center it vertically
        const refFontSize = Math.max(24, Math.round(img.width / 35));
        const refMarginTop = verseLineHeight;
        const totalTextHeight = (verseLines.length * verseLineHeight) + refMarginTop + refFontSize;
        
        let currentY = (canvas.height - totalTextHeight) / 2 + (verseLineHeight / 2);

        // Draw Verse Lines
        for (const line of verseLines) {
            ctx.fillText(line, canvas.width / 2, currentY);
            currentY += verseLineHeight;
        }

        // --- Draw Reference ---
        currentY += (refMarginTop - verseLineHeight) + 10; // Adjust spacing
        ctx.font = `bold ${refFontSize}px 'Montserrat', sans-serif`;
        // Keep shadow
        ctx.fillText(`— ${verseReference} —`, canvas.width / 2, currentY);

        // --- Draw Watermark (Bottom) ---
        const watermarkFontSize = Math.max(20, Math.round(img.width / 40));
        ctx.font = `normal ${watermarkFontSize}px 'Montserrat', sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.shadowBlur = 4;
        ctx.fillText('A Palavra Diária', canvas.width / 2, canvas.height - (PADDING / 2));

        // --- Convert to Blob ---
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('A conversão de Canvas para Blob falhou.'));
          }
        }, 'image/jpeg', 0.95);
      };
      
      img.onerror = () => {
        reject(new Error('Falha ao carregar a imagem para compartilhamento.'));
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
             // Fallback for desktop/unsupported browsers: Download logic could go here, 
             // but navigator.share is standard on mobile.
             // We can use a download link fallback if needed, but for now simple share.
             if (navigator.share) {
                 await navigator.share({ title, text: shareText });
             } else {
                alert("Seu navegador não suporta compartilhamento direto. Tente salvar a imagem manualmente.");
             }
        }
    } catch (error) {
        console.error("Falha no compartilhamento:", error);
    } finally {
        setSharing(false);
    }
};
