# KCWork Bolt Instructions

This repository must be treated as an existing implementation, not as a starter template.

## Non-Negotiables

- Preserve the current React 19 + TypeScript + Next App Router + Vinext architecture.
- Do not migrate to plain Vite, React Router, TanStack Start, or another framework unless the user explicitly asks.
- Do not rewrite the app from screenshots or regenerate a second UI system.
- Keep the left/middle/right client layout intact: left navigation, middle primary conversation, right contextual panel.
- Keep the bottom composer as the primary interaction point.
- Keep management features visually secondary; the product is an Agent productivity client, not a project management tool.
- Do not remove existing demo flows, data, docs, or deployment configuration.

## Design Direction

- Use compact, precise enterprise SaaS controls.
- Avoid oversized cards, tall empty sections, decorative gradients, and marketing-style layouts.
- Right-panel tools should change by Agent and task type.
- Right-panel local inputs should create precise references into the main conversation, not separate conversations.
- Use lucide-react icons for controls where possible.
- Keep UI density consistent with the existing `app/globals.css` rules.

## Product Model

- A project represents a long-running system, not a single requirement.
- A project can contain multiple requirements.
- Product, development, and testing share requirement context.
- Product deliverables are prototype and PRD.
- Spec and acceptance criteria belong to the requirement baseline and are shared by product, development, and testing.
- Product managers mark a requirement complete; development and testing then see it inside the same project context.
- Knowledge stores verifiable content; memory stores confirmed stable decisions.

## Development Rules

- Prefer small, scoped changes over broad refactors.
- Search existing components and patterns before adding new ones.
- Avoid changing package scripts, build tooling, deployment settings, or framework dependencies.
- Run `npm run build` after meaningful code changes.
- Documentation-only changes do not require a production redeploy.

