# Dynamic Form Builder

React-based drag-and-drop form builder for creating reusable dynamic forms.

## Current MVP features

- Drag and click add of fields (`text`, `email`, `number`, `select`, `checkbox`)
- Builder canvas with selectable/removable fields
- Field settings editor (label, placeholder, required, select options)
- Conditional field visibility (`show when <field> equals <value>`)
- Live form preview and basic required-field validation
- Schema export/import using JSON

## Tech stack

- React + TypeScript
- Vite
- ESLint

## Run locally

```bash
npm install
npm run dev
```

## Next steps

- Reorder fields with drag-and-drop sort in canvas
- Add richer validation rules (regex, min/max, custom messages)
- Persist schemas in local storage or backend API
- Add tests for builder behavior and preview validation
