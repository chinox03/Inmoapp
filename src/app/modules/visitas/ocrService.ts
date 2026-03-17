import { OCRResult } from './types';
import { MOCK_OCR_RESPONSES } from './mockData';

export async function simulateOCR(file: File): Promise<OCRResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * MOCK_OCR_RESPONSES.length);
      const mockResult = MOCK_OCR_RESPONSES[randomIndex];

      resolve({
        ...mockResult,
        confidence: 0.85 + Math.random() * 0.14
      });
    }, 2000);
  });
}

export function validateDocumentNumber(documentNumber: string): boolean {
  const pattern = /^[A-Z]{4}\d{6}[HM]DF$/;
  return pattern.test(documentNumber);
}
