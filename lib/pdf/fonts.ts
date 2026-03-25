import { Font } from '@react-pdf/renderer';
import path from 'path';

let fontsRegistered = false;

export function registerFonts() {
  if (fontsRegistered) return;

  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansJP-Regular.ttf');

  Font.register({
    family: 'NotoSansJP',
    src: fontPath,
  });

  // Disable hyphenation for Japanese text
  Font.registerHyphenationCallback((word) => [word]);

  fontsRegistered = true;
}
