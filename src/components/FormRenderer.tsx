import { useState } from 'react';
import type { FormField, FormValues } from '../types';

type FormRendererProps = {
  fields: FormField[];
  submitLabel?: string;
  onValidSubmit?: (values: FormValues) => void;
};

export const FormRenderer = ({
  fields,
  submitLabel = 'Submit',
  onValidSubmit,
}: FormRendererProps) => {
  const [formValues, setFormValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFieldVisible = (field: FormField): boolean => {
    if (!field.condition.enabled || !field.condition.fieldId) {
      return true;
    }

    const compareValue = formValues[field.condition.fieldId];
    return String(compareValue ?? '') === field.condition.value;
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    fields.filter(isFieldVisible).forEach((field) => {
      if (!field.required) return;
      const value = formValues[field.id];
      const missing =
        field.type === 'checkbox' ? !value : String(value ?? '').trim() === '';

      if (missing) {
        nextErrors[field.id] = `${field.label} is required`;
      }
    });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onValidSubmit?.(formValues);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="preview-form">
      {fields.filter(isFieldVisible).map((field) => (
        <div key={field.id} className="preview-field">
          {field.type === 'checkbox' ? (
            <label className="checkbox">
              <input
                type="checkbox"
                checked={Boolean(formValues[field.id])}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, [field.id]: event.target.checked }))
                }
              />
              {field.label}
            </label>
          ) : (
            <>
              <label>{field.label}</label>
              {field.type === 'select' ? (
                <select
                  value={String(formValues[field.id] ?? '')}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, [field.id]: event.target.value }))
                  }
                >
                  <option value="">Select option...</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={String(formValues[field.id] ?? '')}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, [field.id]: event.target.value }))
                  }
                />
              )}
            </>
          )}
          {errors[field.id] && <small className="error">{errors[field.id]}</small>}
        </div>
      ))}

      <button type="submit">{submitLabel}</button>
    </form>
  );
};
