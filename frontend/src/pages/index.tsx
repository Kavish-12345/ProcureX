import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: () => (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <h1 className="text-4xl font-bold text-white">ProcureX</h1>
    </div>
  ),
});