import { renderToBuffer } from '@react-pdf/renderer';
import { registerFonts } from './fonts';
import { mapJobToPdfData } from './helpers/fieldMapper';
import { DetailedTemplate } from './templates/DetailedTemplate';
import { ModernTemplate } from './templates/ModernTemplate';

export type PdfStyle = 'detailed' | 'modern';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateJobPdf(job: any, style: PdfStyle = 'detailed'): Promise<Buffer> {
  registerFonts();

  const data = mapJobToPdfData(job);

  const Template = style === 'modern'
    ? <ModernTemplate data={data} />
    : <DetailedTemplate data={data} />;

  const buffer = await renderToBuffer(Template);
  return Buffer.from(buffer);
}
