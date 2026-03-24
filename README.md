# Dynamic Form Builder

React-based drag-and-drop form builder for creating reusable dynamic forms.

## Why this helps in bigger applications

- Faster delivery: product and engineering teams can create form flows without rebuilding each form from scratch.
- Better consistency: one schema-driven system keeps field behavior, validation, and UI patterns aligned across modules.
- Easier maintenance: updates to form logic happen in a central builder instead of many duplicated forms.
- Reusability: the same schema can be used across create/edit flows, admin tools, onboarding, and internal dashboards.
- Lower regression risk: reusable field components and shared validation reduce one-off implementation mistakes.
- Scale-ready: conditional logic and export/import support complex workflows and portable form definitions.

## Where this is useful

- SaaS admin panels (user management, settings, role forms)
- Workflow apps (HR, finance, procurement, ticketing)
- Multi-tenant apps where each client needs custom forms
- No-code/low-code style internal tools
- Survey, onboarding, and data collection modules

## Practical architecture value

- Store form schema in DB and render dynamically in frontend.
- Version schemas to support safe updates without breaking existing submissions.
- Add analytics on drop-off fields and validation errors to improve conversion.
- Keep validation rules on both frontend and backend for data integrity.

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
