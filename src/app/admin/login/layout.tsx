// This layout overrides the parent admin layout for the login page
// so unauthenticated users don't get redirect-looped
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
