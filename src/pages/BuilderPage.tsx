import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FIELD_TEMPLATES } from '../constants';
import { FormRenderer } from '../components/FormRenderer';
import { getAllForms, saveForm } from '../utils/storage';
import type { FieldType, FormField, SavedForm } from '../types';

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

const makeFormId = () => `form_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

export const BuilderPage = () => {
  const [forms, setForms] = useState<SavedForm[]>(() => getAllForms());
  const [activeFormId, setActiveFormId] = useState<string>(forms[0]?.id ?? makeFormId());
  const [formName, setFormName] = useState<string>(forms[0]?.name ?? 'Untitled form');
  const [fields, setFields] = useState<FormField[]>(forms[0]?.schema ?? []);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [exportData, setExportData] = useState<string>('');
  const [importValue, setImportValue] = useState<string>('');

  const selectedField = useMemo(
    () => fields.find((field) => field.id === selectedFieldId),
    [fields, selectedFieldId],
  );

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
  };

  const persistCurrent = () => {
    const saved = saveForm(activeFormId, formName, fields);
    const next = getAllForms();
    setForms(next);
    setActiveFormId(saved.id);
    window.alert('Form saved to localStorage.');
  };

  const loadForm = (id: string) => {
    const target = forms.find((item) => item.id === id);
    if (!target) return;
    setActiveFormId(target.id);
    setFormName(target.name);
    setFields(target.schema);
    setSelectedFieldId('');
    setImportValue('');
    setExportData('');
  };

  const createNewForm = () => {
    setActiveFormId(makeFormId());
    setFormName('Untitled form');
    setFields([]);
    setSelectedFieldId('');
    setImportValue('');
    setExportData('');
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
        <p>Design forms in `/builder`, then render user-facing forms via `/form/:id`.</p>
      </header>

      <section className="panel">
        <div className="top-row">
          <label>
            Form name
            <input value={formName} onChange={(event) => setFormName(event.target.value)} />
          </label>

          <label>
            Saved forms
            <select
              value={forms.some((item) => item.id === activeFormId) ? activeFormId : ''}
              onChange={(event) => loadForm(event.target.value)}
            >
              <option value="">Current unsaved form</option>
              {forms.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <div className="top-row__actions">
            <button type="button" onClick={createNewForm}>
              New
            </button>
            <button type="button" onClick={persistCurrent}>
              Save
            </button>
            <Link to={`/form/${activeFormId}`}>Open Rendered Form</Link>
          </div>
        </div>
      </section>

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
        <FormRenderer
          fields={fields}
          submitLabel="Validate Form"
          onValidSubmit={() => window.alert('Form is valid and ready to submit.')}
        />
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
};
