export type FieldType = 'text' | 'email' | 'number' | 'select' | 'checkbox';

export type Condition = {
  enabled: boolean;
  fieldId: string;
  value: string;
};

export type FormField = {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  condition: Condition;
};

export type FormValues = Record<string, string | boolean>;

export type SavedForm = {
  id: string;
  name: string;
  schema: FormField[];
  updatedAt: string;
};
