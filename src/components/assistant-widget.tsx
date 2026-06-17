import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

const SUGGESTED = [
  "Comment savoir si mon bien est au bon prix ?",
  "Quels documents dois-je préparer ?",
  "Est-ce que je dois faire des travaux avant de vendre ?",
  "Combien de temps peut prendre une vente ?",
  "Pourquoi passer par votre agence ?",
  "Comment se passe le suivi après le mandat ?",
  "Que faites-vous concrètement pour vendre mon bien ?",
];

function reply(q: string): string {
  const x = q.toLowerCase();
  if (x.includes("prix"))
    return "Le bon prix se construit à partir de trois éléments : les ventes récentes comparables dans votre rue, l'état réel du bien, et la demande actuelle des acheteurs. Notre conseiller vous remet une fourchette argumentée, pas un chiffre lancé au hasard. C'est ce qui évite une baisse de prix forcée 2 mois plus tard.";
  if (x.includes("document"))
    return "Pour démarrer sereinement : titre de propriété, taxe foncière, diagnostics immobiliers, factures de travaux récents, plans du bien et, en copropriété, les charges et le règlement. Votre espace vendeur vous guide pas à pas, document par document.";
  if (x.includes("travaux") || x.includes("rafraîchir"))
    return "Pas toujours. Avant d'engager des travaux, nous regardons ensemble le retour sur investissement. Souvent, un home-staging léger et un reportage photo professionnel suffisent à valoriser bien plus que des travaux lourds.";
  if (x.includes("temps") || x.includes("durée") || x.includes("combien de temps"))
    return "Sur notre secteur, un bien correctement positionné se vend en 6 à 12 semaines. Mal positionné, il peut traîner 6 mois et subir des négociations importantes. Le délai dépend avant tout du prix de départ et de la qualité de présentation.";
  if (x.includes("pourquoi") || x.includes("agence"))
    return "Notre rôle n'est pas seulement de publier votre annonce. Nous vous accompagnons sur l'estimation, la présentation du bien, la sélection des acheteurs, les visites, les retours, la négociation, le compromis et le suivi notaire. Vous gardez une vision claire de chaque étape depuis votre espace vendeur.";
  if (x.includes("suivi") || x.includes("mandat"))
    return "Dès la signature du mandat, vous avez accès à un espace vendeur en ligne avec la timeline complète de votre vente, les comptes-rendus après chaque visite, les documents à préparer et un interlocuteur unique. Vous n'avez plus à courir après l'information.";
  if (x.includes("faites") || x.includes("concrètement"))
    return "Concrètement : estimation argumentée, reportage photo professionnel, rédaction d'annonce, diffusion ciblée, qualification financière des acheteurs, organisation et tenue des visites, compte-rendu après chaque visite, négociation des offres, et suivi notaire jusqu'à la signature.";
  return "Très bonne question. Un conseiller Signature Immobilier peut vous apporter une réponse précise lors d'un échange de 15 minutes. Souhaitez-vous être rappelé ?";
}

type Msg = { role: "user" | "bot"; text: string };

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "bot",
      text: "Bonjour, je suis votre assistant vendeur. Je peux vous éclairer sur le prix, les documents, les délais ou notre accompagnement. Que souhaitez-vous savoir ?",
    },
  ]);
  const [input, setInput] = useState("");

  function send(text: string) {
    if (!text.trim()) return;
    const next: Msg[] = [...msgs, { role: "user", text }];
    next.push({ role: "bot", text: reply(text) });
    setMsgs(next);
    setInput("");
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground pl-4 pr-5 py-3 shadow-lg hover:bg-primary/90"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Assistant vendeur</span>
        </button>
      )}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[min(380px,calc(100vw-2rem))] h-[min(560px,calc(100vh-3rem))] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary text-primary-foreground">
            <div>
              <div className="text-sm font-medium">Assistant vendeur</div>
              <div className="text-[11px] opacity-70">Signature Immobilier</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Fermer">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-3.5 py-2"
                    : "mr-auto max-w-[90%] text-foreground"
                }`}
              >
                {m.text}
              </div>
            ))}
            {msgs.length <= 1 && (
              <div className="pt-2 space-y-1.5">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Suggestions
                </div>
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block text-left text-xs w-full rounded-md border border-border px-2.5 py-1.5 hover:bg-secondary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-border p-2 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question…"
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              className="rounded-md bg-primary text-primary-foreground px-3 grid place-items-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
