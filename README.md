# Frontend

The `frontend/` folder contains the React and Vite browser application. Pages orchestrate routes, reusable components render the interface, hooks and contexts manage browser state, and `lib/` contains typed client utilities and learning helpers.

```text
frontend/
├── public/                         # Browser-visible static configuration files
├── index.html                      # Vite HTML entry document
└── src/
    ├── components/                 # Reusable application components
    │   ├── ui/                     # Reusable UI primitives
    │   ├── CodeResultThreeScene.tsx
    │   ├── ErrorBoundary.tsx
    │   └── LivingSvgBackground.tsx
    ├── contexts/                   # Shared React providers, including theme state
    ├── hooks/                      # Reusable browser hooks, including authentication
    ├── lib/                        # tRPC binding, auth helper, utilities, learning helpers
    │   └── learning/               # Story, graph, onboarding, score, and theme helpers
    ├── pages/                      # Route-level screens
    │   ├── CodeStoryStudioPage.tsx
    │   └── NotFound.tsx
    ├── types/                      # Third-party declarations
    ├── App.tsx                     # Route and provider composition
    ├── main.tsx                    # Browser bootstrap
    └── index.css                   # Global tokens, themes, and responsive CSS
```

`pages/CodeStoryStudioPage.tsx` owns the learner journey. It calls `lib/trpc.ts` for typed API access and keeps Code, Visual, and Explanation interactions synchronized. Browser components never import backend implementation files; shared models come from `shared/types/`.

Run `pnpm dev` from the repository root. Express supplies the API and Vite development integration, so the frontend is not started separately.
