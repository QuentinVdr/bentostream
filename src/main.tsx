import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { routeTree } from './routeTree.gen';
import { customSearchParamSerializer } from './utils/RouterUtils';

const router = createRouter({
  routeTree,
  parseSearch: customSearchParamSerializer.parse,
  stringifySearch: customSearchParamSerializer.stringify,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}
