import type { UserData, SlidesData } from '../store/useAppStore';
import QRCode from "qrcode";

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export async function generateReportImage(
  userData: UserData,
  slidesData: SlidesData
): Promise<Blob> {
  const url = import.meta.env.VITE_DEPLOYMENT_URL || "https://git2025.hust.online";
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = 900;
  canvas.height = 1400;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;

  try {
    const avatarImg = await loadImage(userData.avatarUrl);
    
    ctx.save();
    ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
    ctx.shadowBlur = 30;
    
    ctx.beginPath();
    ctx.arc(centerX, 140, 70, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, centerX - 70, 70, 140, 140);
    ctx.restore();

    const gradient = ctx.createLinearGradient(centerX - 80, 70, centerX + 80, 210);
    gradient.addColorStop(0, '#10b981');
    gradient.addColorStop(1, '#059669');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(centerX, 140, 72, 0, Math.PI * 2);
    ctx.stroke();
  } catch (error) {
    console.error('Failed to load avatar:', error);
    drawAvatarPlaceholder(ctx, centerX, 140, 70);
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 36px ${FONT_FAMILY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(userData.name || userData.login, centerX, 260);

  const titleGradient = ctx.createLinearGradient(centerX - 200, 300, centerX + 200, 340);
  titleGradient.addColorStop(0, '#10b981');
  titleGradient.addColorStop(0.5, '#34d399');
  titleGradient.addColorStop(1, '#10b981');
  ctx.fillStyle = titleGradient;
  ctx.font = `bold 60px ${FONT_FAMILY}`;
  ctx.shadowColor = 'rgba(16, 185, 129, 0.3)';
  ctx.shadowBlur = 20;
  ctx.fillText('GitHub 2025', centerX, 330);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#9ca3af';
  ctx.font = `28px ${FONT_FAMILY}`;
  ctx.fillText('Annual Report', centerX, 375);

  const statsY = 460;
  const stats = [
    { label: 'Total Commits', value: slidesData.totalCommits.toLocaleString() },
    { label: 'PRs Created', value: slidesData.totalPRs.toLocaleString() },
    { label: 'Stars Earned', value: slidesData.totalStars.toLocaleString() },
    { label: 'Repositories', value: slidesData.totalRepos.toLocaleString() },
  ];

  const cardWidth = 200;
  const cardGap = 30;
  const cardHeight = 110;
  const totalWidth = cardWidth * 2 + cardGap;
  const startX = (canvas.width - totalWidth) / 2;

  stats.forEach((stat, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = startX + col * (cardWidth + cardGap);
    const y = statsY + row * (cardHeight + 20);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(x, y, cardWidth, cardHeight, 16);
    } else {
        ctx.rect(x, y, cardWidth, cardHeight);
    }
    ctx.fill();

    ctx.fillStyle = '#9ca3af';
    ctx.font = `16px ${FONT_FAMILY}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(stat.label, x + cardWidth / 2, y + 20);

    ctx.fillStyle = '#10b981';
    ctx.font = `bold 40px ${FONT_FAMILY}`;
    ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
    ctx.shadowBlur = 10;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(stat.value, x + cardWidth / 2, y + 90);
    ctx.shadowBlur = 0;
  });

  const langY = 740; 
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 28px ${FONT_FAMILY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Top Languages', canvas.width / 2, langY);

  const langBarWidth = 700;
  const langStartX = (canvas.width - langBarWidth) / 2;

  slidesData.topLanguages.slice(0, 3).forEach((lang, index) => {
    const y = langY + 50 + index * 85; 

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 22px ${FONT_FAMILY}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(lang.name, langStartX, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#10b981';
    ctx.font = `bold 28px ${FONT_FAMILY}`;
    ctx.fillText(`${lang.percentage.toFixed(1)}%`, langStartX + langBarWidth, y);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(langStartX, y + 35, langBarWidth, 8); 

    const barWidth = langBarWidth * (lang.percentage / 100);
    if (barWidth > 0) {
      const langGradient = ctx.createLinearGradient(langStartX, y + 35, langStartX + barWidth, y + 43);
      const baseColor = lang.color || '#10b981';
      langGradient.addColorStop(0, baseColor);
      langGradient.addColorStop(1, adjustColorBrightness(baseColor, 20));
      
      ctx.fillStyle = langGradient;
      if(ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(langStartX, y + 35, barWidth, 8, 4);
          ctx.fill();
      } else {
          ctx.fillRect(langStartX, y + 35, barWidth, 8);
      }
    }
  });

  const personaY = 1020; 

  const personaLabels: Record<string, string> = {
    'high-achiever': 'High Achiever',
    'burst-coder': 'Burst Coder',
    'streak-master': 'Streak Master',
    'language-explorer': 'Language Explorer',
    'collaborator': 'Collaborator',
    'maintainer': 'Maintainer',
    'weekend-warrior': 'Weekend Warrior',
    'consistent-contributor': 'Marathon Runner',
    'focused-coder': 'Focused Coder',
    'night-owl': 'Night Owl Coder',
    'steady-builder': 'Steady Builder',
    'early-bird': 'Early Bird Engineer',
    default: 'Code Architect',
  };

  const personaLabel = personaLabels[slidesData.persona] || personaLabels.default;

  ctx.fillStyle = '#10b981';
  ctx.font = `bold 32px ${FONT_FAMILY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
  ctx.shadowBlur = 20;
  ctx.fillText(personaLabel, canvas.width / 2, personaY);
  ctx.shadowBlur = 0;

  // 6. Persona & Comment Section (Modified for Left Align)
  const commentY = 1080;
  const maxWidth = 800;
  
  ctx.fillStyle = '#d1d5db';
  ctx.font = `italic 20px ${FONT_FAMILY}`;
  
  // CHANGED: Align left
  ctx.textAlign = 'left'; 
  
  // CHANGED: Calculate X to center the text block, but align text left within it
  // Canvas(900) - MaxWidth(800) = 100 margin total -> 50px left margin
  const commentX = (canvas.width - maxWidth) / 2; 

  wrapTextSimple(ctx, `"${slidesData.aiComment}"`, commentX, commentY, maxWidth, 30);

  // 7. Footer Section
  const qrSize = 110;
  const footerPadding = 40; 
  
  const qrX = canvas.width - qrSize - footerPadding;
  const qrY = canvas.height - qrSize - footerPadding;

  const qrDataUrl = await QRCode.toDataURL(url, { 
      width: qrSize, 
      margin: 1, 
      color: { dark: '#000000', light: '#ffffff' } 
  });
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10);
  
  const qrImg = await loadImage(qrDataUrl);
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  const textRightX = qrX - 25; 
  const textBaseY = qrY + 25; 
  
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';

  ctx.font = `bold 30px ${FONT_FAMILY}`;
  ctx.fillStyle = "#B191E4"; 
  ctx.fillText("Check Your 2025 Analysis", textRightX, textBaseY);

  ctx.font = `22px ${FONT_FAMILY}`;
  ctx.fillStyle = "#61afef"; 
  const urlText = url.replace(/^http(s|):\/\//g, ""); 
  ctx.fillText(urlText, textRightX, textBaseY + 35);

  const studioText = "BingyanStudio";
  const poweredByText = "Powered by ";
  const logoSize = 32;
  const footerRowCenterY = textBaseY + 70; 

  ctx.textBaseline = 'middle'; 

  ctx.font = `bold 22px ${FONT_FAMILY}`;
  ctx.fillStyle = "rgba(245, 171, 61, 0.9)"; 
  ctx.fillText(studioText, textRightX, footerRowCenterY);

  const studioWidth = ctx.measureText(studioText).width;
  const logoPadding = 10;
  const poweredByPadding = 5;
  
  const studioStartX = textRightX - studioWidth;
  const logoX = studioStartX - logoSize - logoPadding;
  const logoY = footerRowCenterY - logoSize / 2;

  ctx.font = `18px ${FONT_FAMILY}`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.fillText(poweredByText, logoX - poweredByPadding, footerRowCenterY);

  try {
    const logoImg = await loadImage("/by-logo.png");
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
  } catch (error) {
    console.error('Failed to load logo:', error);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/png');
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function wrapTextSimple(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const chars = text.split('');
  const lines: string[] = [];
  let line = '';

  for (let n = 0; n < chars.length; n++) {
    const testLine = line + chars[n];
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line);
      line = chars[n];
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  ctx.textBaseline = 'alphabetic';
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
}

function drawAvatarPlaceholder(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.fillStyle = '#1f2937';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('👤', x, y);
}

function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `rgb(${R}, ${G}, ${B})`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}