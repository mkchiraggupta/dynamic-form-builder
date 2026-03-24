import type { FieldType } from './types';

export const FIELD_TEMPLATES: { type: FieldType; label: string }[] = [
  { type: 'text', label: 'Text' },
  { type: 'email', label: 'Email' },
  { type: 'number', label: 'Number' },
  { type: 'select', label: 'Select' },
  { type: 'checkbox', label: 'Checkbox' },
];
