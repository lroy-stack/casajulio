import type { ReactElement } from 'react';
import type { CodigoAlergeno } from '@/lib/types';

interface AlergenoIconProps {
  readonly code: CodigoAlergeno;
  readonly size?: number;
  readonly className?: string;
}

const ICON_PATHS: Readonly<Record<CodigoAlergeno, () => ReactElement>> = {
  gluten: () => (
    <>
      <line x1="12" y1="22" x2="12" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="9" cy="10" rx="3" ry="1.8" transform="rotate(-30 9 10)" fill="currentColor" opacity="0.85" />
      <ellipse cx="15" cy="8" rx="3" ry="1.8" transform="rotate(30 15 8)" fill="currentColor" opacity="0.85" />
    </>
  ),
  lacteos: () => (
    <>
      <path d="M8 4 L7 20 L17 20 L16 4 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M8.4 11 L15.6 11 L16 4 L8 4 Z" fill="currentColor" opacity="0.25" />
    </>
  ),
  huevos: () => (
    <>
      <ellipse cx="12" cy="13" rx="6" ry="7.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="14" r="2.5" fill="currentColor" opacity="0.7" />
    </>
  ),
  mariscos: () => (
    <>
      <path d="M7 18 C5 14 6 9 10 7 C14 5 17 7 17 11 C17 14 15 16 13 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M7 18 L5 21 M7 18 L7.5 21.5 M7 18 L9.5 20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </>
  ),
  pescado: () => (
    <>
      <path d="M4 12 C4 8 8 5 13 5 C18 5 20 8 20 12 C20 16 18 19 13 19 C8 19 4 16 4 12 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M3 12 L-1 8 M3 12 L-1 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="16" cy="11" r="1.2" fill="currentColor" />
    </>
  ),
  frutos_secos: () => (
    <>
      <path d="M12 3 C16 3 20 6.5 20 11 C20 16 16.5 21 12 21 C7.5 21 4 16 4 11 C4 6.5 8 3 12 3 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M12 3 C10 7 10 15 12 21" stroke="currentColor" strokeWidth="1" fill="none" />
    </>
  ),
  soja: () => (
    <>
      <path d="M6 19 C4 16 4 8 12 4 C20 8 20 16 18 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="10" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <circle cx="14" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </>
  ),
  apio: () => (
    <>
      <path d="M12 22 L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 8 C12 8 8 4 5 5 C6 8 10 9 12 8 Z" fill="currentColor" opacity="0.8" />
      <path d="M12 8 C12 8 16 4 19 5 C18 8 14 9 12 8 Z" fill="currentColor" opacity="0.8" />
      <path d="M12 12 C12 12 9 9 7 10 C8 13 11 13 12 12 Z" fill="currentColor" opacity="0.6" />
    </>
  ),
  mostaza: () => (
    <>
      <path d="M9 21 L9 14 L7 10 L7 6 Q7 4 9 4 L15 4 Q17 4 17 6 L17 10 L15 14 L15 21 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M12 4 L12 2 M12 2 Q14 0 14 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </>
  ),
  sesamo: () => (
    <>
      <ellipse cx="8" cy="9" rx="2.5" ry="1.4" transform="rotate(-20 8 9)" fill="currentColor" opacity="0.85" />
      <ellipse cx="14" cy="7" rx="2.5" ry="1.4" transform="rotate(15 14 7)" fill="currentColor" opacity="0.85" />
      <ellipse cx="16" cy="14" rx="2.5" ry="1.4" transform="rotate(-10 16 14)" fill="currentColor" opacity="0.85" />
      <ellipse cx="9" cy="16" rx="2.5" ry="1.4" transform="rotate(25 9 16)" fill="currentColor" opacity="0.85" />
      <ellipse cx="12" cy="12" rx="2.5" ry="1.4" transform="rotate(5 12 12)" fill="currentColor" opacity="0.7" />
    </>
  ),
  sulfitos: () => (
    <>
      <path d="M8 3 L16 3 C16 3 15 10 12 12 C9 10 8 3 8 3 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <line x1="12" y1="12" x2="12" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="19" x2="16" y2="19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  moluscos: () => (
    <>
      <path d="M4 14 C4 10 7.5 7 12 7 C16.5 7 20 10 20 14 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M4 14 C6 17 9 19 12 19 C15 19 18 17 20 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="12" cy="7" r="1.2" fill="currentColor" />
    </>
  ),
  altramuces: () => (
    <>
      <line x1="12" y1="22" x2="12" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="12" cy="10" rx="4" ry="2.2" fill="currentColor" opacity="0.85" />
      <ellipse cx="12" cy="14" rx="3.5" ry="2" fill="currentColor" opacity="0.7" />
      <ellipse cx="12" cy="18" rx="3" ry="1.8" fill="currentColor" opacity="0.55" />
    </>
  ),
  cacahuetes: () => (
    <>
      <path d="M12 3 C9 3 7 5 7 7.5 C7 9.5 8.5 11 10 11.5 C8.5 12 7 13.5 7 15.5 C7 18 9 21 12 21 C15 21 17 18 17 15.5 C17 13.5 15.5 12 14 11.5 C15.5 11 17 9.5 17 7.5 C17 5 15 3 12 3 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="9" y1="11.5" x2="15" y2="11.5" stroke="currentColor" strokeWidth="1" />
    </>
  ),
};

export function AlergenoIcon({ code, size = 20, className }: AlergenoIconProps) {
  const IconContent = ICON_PATHS[code];

  if (!IconContent) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-label={code}
        className={className}
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">?</text>
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-label={code}
      className={className}
    >
      <IconContent />
    </svg>
  );
}
