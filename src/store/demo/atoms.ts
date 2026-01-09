import { atom } from 'jotai';

export const counterAtom = atom(0);
export const darkPrefersAtom = atom<boolean | null>(null);
