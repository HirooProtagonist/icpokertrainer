import { useEnsureProfile } from "@/hooks/useQueries";
import { Trainer } from "@/pages/Trainer";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useEffect } from "react";

function AppHeader() {
  const { isAuthenticated, isInitializing, login, clear, identity } =
    useInternetIdentity();
  const ensureProfile = useEnsureProfile();

  // Initialise profile on every fresh login
  useEffect(() => {
    if (isAuthenticated && identity) {
      ensureProfile.mutate();
    }
  }, [isAuthenticated, identity, ensureProfile]);

  const principalText = identity ? identity.getPrincipal().toText() : null;
  const shortPrincipal = principalText
    ? `${principalText.slice(0, 5)}…${principalText.slice(-3)}`
    : null;

  return (
    <header
      className="flex items-center justify-between px-4 py-2.5 sticky top-0 z-50"
      style={{
        background: "oklch(0.12 0.03 145)",
        borderBottom: "1px solid oklch(0.20 0.04 145)",
      }}
      data-ocid="app.header"
    >
      {/* Brand */}
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">
          ♠
        </span>
        <span className="font-display font-bold text-sm text-foreground tracking-tight">
          ICPokerTrainer
        </span>
      </div>

      {/* Auth controls */}
      <div className="flex items-center gap-2">
        {isInitializing ? (
          <span
            className="text-xs text-muted-foreground"
            data-ocid="app.auth.loading_state"
          >
            …
          </span>
        ) : isAuthenticated ? (
          <>
            <span
              className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground"
              data-ocid="app.auth.principal"
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"
                aria-hidden="true"
              />
              {shortPrincipal}
            </span>
            <button
              type="button"
              onClick={clear}
              data-ocid="app.auth.logout_button"
              className="
                px-3 py-1 rounded-lg text-xs font-semibold
                text-muted-foreground hover:text-foreground transition-colors duration-150
              "
              style={{ background: "oklch(0.18 0.02 145)" }}
            >
              Выйти
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={login}
            data-ocid="app.auth.login_button"
            className="
              px-3 py-1.5 rounded-lg text-xs font-semibold
              text-accent-foreground transition-all duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
            "
            style={{ background: "oklch(0.55 0.18 55)" }}
          >
            Войти
          </button>
        )}
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="dark flex flex-col min-h-screen">
      <AppHeader />
      <Trainer />
    </div>
  );
}
