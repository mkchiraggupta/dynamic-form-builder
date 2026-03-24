import type { FormField, SavedForm } from '../types';

const FORMS_STORAGE_KEY = 'dfb_forms';

const readForms = (): SavedForm[] => {
  const raw = localStorage.getItem(FORMS_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as SavedForm[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeForms = (forms: SavedForm[]) => {
  localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(forms));
};

export const getAllForms = (): SavedForm[] => readForms();

export const getFormById = (id: string): SavedForm | undefined =>
  readForms().find((item) => item.id === id);

export const saveForm = (id: string, name: string, schema: FormField[]): SavedForm => {
  const forms = readForms();
  const next: SavedForm = {
    id,
    name: name.trim() || 'Untitled form',
    schema,
    updatedAt: new Date().toISOString(),
  };

  const index = forms.findIndex((item) => item.id === id);
  if (index >= 0) {
    forms[index] = next;
  } else {
    forms.unshift(next);
  }

  writeForms(forms);
  return next;
};
