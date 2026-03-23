import { useMemo, useState } from 'react';
import './App.css';

type FieldType = 'text' | 'email' | 'number' | 'select' | 'checkbox';

type Condition = {
  enabled: boolean;
  fieldId: string;
  value: string;
};

type FormField = {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  condition: Condition;
};

type FormValues = Record<string, string | boolean>;

const FIELD_TEMPLATES: { type: FieldType; label: string }[] = [
  { type: 'text', label: 'Text' },
  { type: 'email', label: 'Email' },
  { type: 'number', label: 'Number' },
  { type: 'select', label: 'Select' },
  { type: 'checkbox', label: 'Checkbox' },
];

const createField = (type: FieldType): FormField => {
  const uid = `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const base: FormField = {
    id: uid,
    type,
    label: `${type[0].toUpperCase()}${type.slice(1)} field`,
    placeholder: type === 'checkbox' ? '' : `Enter ${type}...`,
    required: false,
    condition: { enabled: false, fieldId: '', value: '' },
  };

  if (type === 'select') {
    base.options = ['Option 1', 'Option 2'];
  }

  return base;
};

function App() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [formValues, setFormValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [exportData, setExportData] = useState<string>('');
  const [importValue, setImportValue] = useState<string>('');

  const selectedField = useMemo(
    () => fields.find((field) => field.id === selectedFieldId),
    [fields, selectedFieldId],
  );

  const isFieldVisible = (field: FormField): boolean => {
    if (!field.condition.enabled || !field.condition.fieldId) {
      return true;
    }

    const compareValue = formValues[field.condition.fieldId];
    return String(compareValue ?? '') === field.condition.value;
  };

  const addField = (type: FieldType) => {
    const newField = createField(type);
    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newField.id);
  };

  const handleCanvasDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    const fieldType = event.dataTransfer.getData('fieldType') as FieldType;
    if (FIELD_TEMPLATES.some((template) => template.type === fieldType)) {
      addField(fieldType);
    }
  };

  const updateSelectedField = (patch: Partial<FormField>) => {
    if (!selectedFieldId) return;
    setFields((prev) =>
      prev.map((field) =>
        field.id === selectedFieldId ? { ...field, ...patch } : field,
      ),
    );
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
    setSelectedFieldId((prev) => (prev === id ? '' : prev));
    setFormValues((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
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
      window.alert('Form is valid and ready to submit.');
    }
  };

  const exportSchema = () => {
    setExportData(JSON.stringify(fields, null, 2));
  };

  const importSchema = () => {
    try {
      const parsed = JSON.parse(importValue) as FormField[];
      if (!Array.isArray(parsed)) throw new Error('Schema should be an array');
      setFields(parsed);
      setSelectedFieldId(parsed[0]?.id ?? '');
      setErrors({});
      setFormValues({});
      setExportData('');
      window.alert('Schema imported successfully.');
    } catch (error) {
      window.alert(`Invalid schema: ${(error as Error).message}`);
    }
  };

  return (
    <main className="app">
      <header className="app__header">
        <h1>Dynamic Form Builder</h1>
        <p>Drag fields into the canvas, edit settings, and preview instantly.</p>
      </header>

      <section className="layout">
        <aside className="panel">
          <h2>Field Palette</h2>
          <div className="palette">
            {FIELD_TEMPLATES.map((item) => (
              <button
                key={item.type}
                draggable
                onDragStart={(event) => event.dataTransfer.setData('fieldType', item.type)}
                onClick={() => addField(item.type)}
                className="palette__item"
                type="button"
              >
                + {item.label}
              </button>
            ))}
          </div>
        </aside>

        <section
          className="panel panel--canvas"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleCanvasDrop}
        >
          <h2>Builder Canvas</h2>
          {fields.length === 0 ? (
            <p className="muted">Drop a field here or click an item from palette.</p>
          ) : (
            <ul className="field-list">
              {fields.map((field, idx) => (
                <li
                  key={field.id}
                  className={`field-list__item ${selectedFieldId === field.id ? 'is-selected' : ''}`}
                >
                  <button
                    className="field-list__select"
                    type="button"
                    onClick={() => setSelectedFieldId(field.id)}
                  >
                    {idx + 1}. {field.label} ({field.type})
                  </button>
                  <button type="button" className="danger" onClick={() => removeField(field.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="panel">
          <h2>Field Settings</h2>
          {!selectedField ? (
            <p className="muted">Select a field to edit its behavior.</p>
          ) : (
            <div className="settings">
              <label>
                Label
                <input
                  value={selectedField.label}
                  onChange={(event) => updateSelectedField({ label: event.target.value })}
                />
              </label>

              {selectedField.type !== 'checkbox' && (
                <label>
                  Placeholder
                  <input
                    value={selectedField.placeholder ?? ''}
                    onChange={(event) => updateSelectedField({ placeholder: event.target.value })}
                  />
                </label>
              )}

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={selectedField.required}
                  onChange={(event) => updateSelectedField({ required: event.target.checked })}
                />
                Required
              </label>

              {selectedField.type === 'select' && (
                <label>
                  Options (comma separated)
                  <input
                    value={(selectedField.options ?? []).join(', ')}
                    onChange={(event) =>
                      updateSelectedField({
                        options: event.target.value
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </label>
              )}

              <h3>Conditional visibility</h3>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={selectedField.condition.enabled}
                  onChange={(event) =>
                    updateSelectedField({
                      condition: {
                        ...selectedField.condition,
                        enabled: event.target.checked,
                      },
                    })
                  }
                />
                Enable condition
              </label>

              <label>
                Show when field
                <select
                  value={selectedField.condition.fieldId}
                  onChange={(event) =>
                    updateSelectedField({
                      condition: {
                        ...selectedField.condition,
                        fieldId: event.target.value,
                      },
                    })
                  }
                  disabled={!selectedField.condition.enabled}
                >
                  <option value="">Select field...</option>
                  {fields
                    .filter((field) => field.id !== selectedField.id)
                    .map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.label}
                      </option>
                    ))}
                </select>
              </label>

              <label>
                Equals value
                <input
                  value={selectedField.condition.value}
                  onChange={(event) =>
                    updateSelectedField({
                      condition: {
                        ...selectedField.condition,
                        value: event.target.value,
                      },
                    })
                  }
                  disabled={!selectedField.condition.enabled}
                />
              </label>
            </div>
          )}
        </aside>
      </section>

      <section className="panel panel--preview">
        <h2>Real-time Preview</h2>
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

          <button type="submit">Validate Form</button>
        </form>
      </section>

      <section className="panel panel--io">
        <h2>Schema Export / Import</h2>
        <div className="io-actions">
          <button type="button" onClick={exportSchema}>
            Export Schema
          </button>
          <button type="button" onClick={importSchema}>
            Import Schema
          </button>
        </div>
        <textarea
          className="schema-box"
          placeholder="Exported schema appears here. You can also paste schema and click Import."
          value={importValue || exportData}
          onChange={(event) => {
            setImportValue(event.target.value);
            setExportData('');
          }}
        />
      </section>
    </main>
  );
}

export default App;
