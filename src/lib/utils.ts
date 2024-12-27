import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import bcrypt from 'bcryptjs';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export function validateStudentName(name: string): boolean {
  // Allow letters, spaces, hyphens, and accents
  const nameRegex = /^[A-Za-zÀ-ÿ\s\-']+$/;
  return nameRegex.test(name);
}

export function formatStudentName(lastName: string, firstName: string): string {
  return `${lastName.toUpperCase()} ${firstName.charAt(0).toUpperCase()}${firstName.slice(1).toLowerCase()}`;
}

export function parseStudentName(fullName: string): { lastName: string; firstName: string } {
  const words = fullName.trim().split(' ');
  const upperCaseWords: string[] = [];
  const remainingWords: string[] = [];

  // Separate uppercase and mixed/lowercase words
  words.forEach(word => {
    if (word === word.toUpperCase() && word.length > 1) { // Check length to avoid single letters
      upperCaseWords.push(word);
    } else {
      remainingWords.push(word);
    }
  });

  return {
    lastName: upperCaseWords.join(' '),
    firstName: remainingWords.join(' ')
  };
}