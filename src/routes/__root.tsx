import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="min-h-dvh w-dvw bg-zinc-950 text-white">
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  ),
});
