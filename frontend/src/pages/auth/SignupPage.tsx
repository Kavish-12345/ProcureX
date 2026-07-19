import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/SignupPage')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/SignupPage"!</div>
}
