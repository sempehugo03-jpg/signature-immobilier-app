"use client";

import { useEffect, useRef, useState } from "react";
import { Smartphone, X } from "lucide-react";

const storageKey = "signature_install_toast_dismissed";
const showDelayMs = 2200;

type InstallOutcome = "accepted" | "dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: InstallOutcome; platform: string }>;
};

function getInstallHelp() {
  if (typeof navigator === "undefined") return "";

  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);

  if (isIOS) {
    return "Sur iPhone, ouvrez le menu Partager, puis choisissez Ajouter à l’écran d’accueil.";
  }

  if (isAndroid) {
    return "Sur Android, ouvrez le menu du navigateur, puis choisissez Ajouter à l’écran d’accueil.";
  }

  return "Si votre navigateur le permet, utilisez son menu pour ajouter le site à votre écran d’accueil.";
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(display-mode: standalone)").matches;
}

export function AppInstallToast() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [helpText, setHelpText] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandaloneMode()) return;
    if (window.localStorage.getItem(storageKey) === "true") return;

    const showTimer = window.setTimeout(() => setVisible(true), showDelayMs);
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferredPrompt.current = event as BeforeInstallPromptEvent;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.clearTimeout(showTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  function dismiss() {
    window.localStorage.setItem(storageKey, "true");
    setVisible(false);
  }

  async function installApp() {
    setHelpText("");

    if (!deferredPrompt.current) {
      setHelpText(getInstallHelp());
      return;
    }

    const promptEvent = deferredPrompt.current;
    deferredPrompt.current = null;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;

    if (choice.outcome === "accepted") {
      dismiss();
      return;
    }

    setHelpText(getInstallHelp());
  }

  if (!visible) return null;

  return (
    <aside
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-[420px] animate-in slide-in-from-bottom-3 fade-in duration-500 sm:bottom-6 sm:left-auto sm:right-6 sm:mx-0 sm:w-[390px]"
    >
      <div className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-white/85 p-4 text-foreground shadow-2xl shadow-foreground/15 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Smartphone className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="pr-8 text-sm font-semibold leading-snug">
              Signature Immobilier est aussi disponible en application
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Ajoutez l’application à votre écran d’accueil pour suivre votre projet immobilier plus simplement.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Fermer la suggestion d’installation"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {helpText && (
          <p className="mt-3 rounded-2xl bg-secondary px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            {helpText}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => void installApp()}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Ajouter l’application
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex items-center justify-center rounded-full border border-border bg-white/60 px-4 py-2.5 text-sm font-medium transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Plus tard
          </button>
        </div>
      </div>
    </aside>
  );
}
