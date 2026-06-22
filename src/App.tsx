// Public storefront is intentionally hidden behind a blank white screen.
// The route tree and pages remain in the repo for a future re-enable; restore
// the prior App.tsx from git history when the site should be visible again.
export default function App() {
  return (
    <div
      className="fixed inset-0 z-[99999] min-h-screen w-full bg-white"
      aria-hidden="true"
    />
  )
}
