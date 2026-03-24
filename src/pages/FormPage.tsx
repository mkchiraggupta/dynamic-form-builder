import { Link, useParams } from 'react-router-dom';
import { FormRenderer } from '../components/FormRenderer';
import { getFormById } from '../utils/storage';

export const FormPage = () => {
  const { id } = useParams();
  const form = id ? getFormById(id) : undefined;

  if (!id || !form) {
    return (
      <main className="app">
        <section className="panel">
          <h1>Form not found</h1>
          <p className="muted">
            Save a form from the builder first, then open it using `/form/:id`.
          </p>
          <Link to="/builder">Go to Builder</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="app__header">
        <h1>{form.name}</h1>
        <p>This page renders a saved schema as a user-facing form.</p>
        <Link to="/builder">Back to Builder</Link>
      </header>

      <section className="panel panel--preview">
        <h2>Rendered Form</h2>
        <FormRenderer
          fields={form.schema}
          submitLabel="Submit Response"
          onValidSubmit={(values) =>
            window.alert(`Submission payload:\n${JSON.stringify(values, null, 2)}`)
          }
        />
      </section>
    </main>
  );
};
