import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, Home, LogOut, Plus, UserRoundCheck } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";

import { ProtectedRoute } from "@/components/protected-route";
import { SellerSpaceCreator } from "@/components/seller-space-creator";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { agencyConfig } from "@/lib/agency-config";
import { getAgencyForUser, type AgencySummary } from "@/lib/access-invitations";

const LOCAL_LISTINGS_KEY = "signature_agent_listings";

type AgentListing = {
  id: string;
  title: string;
  city: string;
  address: string;
  price: string;
  surface: string;
  rooms: string;
  sellerFirstName: string;
  sellerLastName: string;
  sellerEmail: string;
  sellerPhone: string;
};

export const Route = createFileRoute("/agent")({
  head: () => ({
    meta: [
      { title: "Espace agent - Signature Immobilier" },
      {
        name: "description",
        content: "Espace agent Signature Immobilier.",
      },
    ],
  }),
  component: AgentRoute,
});

function AgentRoute() {
  return (
    <ProtectedRoute role={["agent", "agency_admin"]}>
      <AgentSpace />
    </ProtectedRoute>
  );
}

function AgentSpace() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [agency, setAgency] = useState<AgencySummary | null>(null);
  const [createdListings, setCreatedListings] = useState<AgentListing[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [form, setForm] = useState<AgentListing>({
    id: "",
    title: "",
    city: "",
    address: "",
    price: "",
    surface: "",
    rooms: "",
    sellerFirstName: "",
    sellerLastName: "",
    sellerEmail: "",
    sellerPhone: "",
  });

  useEffect(() => {
    async function loadAgency() {
      if (!profile?.email) return;
      setAgency(await getAgencyForUser(profile.email));
    }

    loadAgency();
  }, [profile?.email]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(LOCAL_LISTINGS_KEY);
    const listings = raw ? (JSON.parse(raw) as AgentListing[]) : [];
    setCreatedListings(listings);
    setSelectedId(listings[0]?.id ?? agencyConfig.properties[0]?.id ?? "");
  }, []);

  const baseListings = useMemo(
    () =>
      agencyConfig.properties.map((property) => {
        const seller = agencyConfig.sellers.find(
          (item) => item.id === property.sellerId,
        );
        return {
          id: property.id,
          title: property.title,
          city: property.city,
          address: property.address,
          price: property.price,
          surface: `${property.surface}`,
          rooms: `${property.rooms}`,
          sellerFirstName: seller?.firstName ?? "",
          sellerLastName: seller?.lastName ?? "",
          sellerEmail: seller?.email ?? "",
          sellerPhone: seller?.phone ?? "",
        };
      }),
    [],
  );

  const listings = useMemo(
    () => [...createdListings, ...baseListings],
    [baseListings, createdListings],
  );
  const selectedListing = listings.find((listing) => listing.id === selectedId);

  async function onSignOut() {
    await signOut();
    navigate({ to: "/mon-suivi", replace: true });
  }

  function onCreateListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextListing: AgentListing = {
      ...form,
      id: `listing-${Date.now()}`,
      title: form.title.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      price: form.price.trim(),
      surface: form.surface.trim(),
      rooms: form.rooms.trim(),
      sellerFirstName: form.sellerFirstName.trim(),
      sellerLastName: form.sellerLastName.trim(),
      sellerEmail: form.sellerEmail.trim(),
      sellerPhone: form.sellerPhone.trim(),
    };
    const nextListings = [nextListing, ...createdListings];
    setCreatedListings(nextListings);
    setSelectedId(nextListing.id);
    localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify(nextListings));
    setForm({
      id: "",
      title: "",
      city: "",
      address: "",
      price: "",
      surface: "",
      rooms: "",
      sellerFirstName: "",
      sellerLastName: "",
      sellerEmail: "",
      sellerPhone: "",
    });
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-5 py-10 md:px-8 md:py-12">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] opacity-70">
              Espace agent
            </div>
            <h1 className="mt-2 font-display text-3xl md:text-5xl">
              Annonces et espaces vendeurs
            </h1>
            <p className="mt-3 opacity-80">
              {agency?.name ?? "Signature Immobilier"} · {profile?.email}
            </p>
          </div>
          <Button
            variant="secondary"
            className="rounded-full"
            onClick={onSignOut}
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          <Metric
            icon={<Building2 className="h-5 w-5 text-gold" />}
            value={agency?.city ?? "Agence"}
            label={agency?.name ?? "Agence active"}
          />
          <Metric
            icon={<Home className="h-5 w-5 text-gold" />}
            value={`${listings.length}`}
            label="Biens disponibles"
          />
          <Metric
            icon={<UserRoundCheck className="h-5 w-5 text-gold" />}
            value="Mailto"
            label="Activation vendeur"
          />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Plus className="h-5 w-5" />
                </div>
                <CardTitle className="font-display text-3xl">
                  Créer une annonce
                </CardTitle>
                <CardDescription>
                  Renseignez le bien et le vendeur, puis créez l’espace vendeur
                  depuis le bien sélectionné.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="grid gap-4 md:grid-cols-2"
                  onSubmit={onCreateListing}
                >
                  <Field label="Titre du bien">
                    <Input
                      value={form.title}
                      onChange={(event) =>
                        setForm({ ...form, title: event.target.value })
                      }
                      required
                    />
                  </Field>
                  <Field label="Ville">
                    <Input
                      value={form.city}
                      onChange={(event) =>
                        setForm({ ...form, city: event.target.value })
                      }
                      required
                    />
                  </Field>
                  <Field label="Quartier / adresse">
                    <Input
                      value={form.address}
                      onChange={(event) =>
                        setForm({ ...form, address: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Prix">
                    <Input
                      value={form.price}
                      onChange={(event) =>
                        setForm({ ...form, price: event.target.value })
                      }
                      placeholder="325 000 €"
                      required
                    />
                  </Field>
                  <Field label="Surface">
                    <Input
                      value={form.surface}
                      onChange={(event) =>
                        setForm({ ...form, surface: event.target.value })
                      }
                      placeholder="115"
                    />
                  </Field>
                  <Field label="Pièces">
                    <Input
                      value={form.rooms}
                      onChange={(event) =>
                        setForm({ ...form, rooms: event.target.value })
                      }
                      placeholder="5"
                    />
                  </Field>
                  <Field label="Prénom vendeur">
                    <Input
                      value={form.sellerFirstName}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          sellerFirstName: event.target.value,
                        })
                      }
                      required
                    />
                  </Field>
                  <Field label="Nom vendeur">
                    <Input
                      value={form.sellerLastName}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          sellerLastName: event.target.value,
                        })
                      }
                      required
                    />
                  </Field>
                  <Field label="Email vendeur">
                    <Input
                      type="email"
                      value={form.sellerEmail}
                      onChange={(event) =>
                        setForm({ ...form, sellerEmail: event.target.value })
                      }
                      required
                    />
                  </Field>
                  <Field label="Téléphone vendeur">
                    <Input
                      type="tel"
                      value={form.sellerPhone}
                      onChange={(event) =>
                        setForm({ ...form, sellerPhone: event.target.value })
                      }
                    />
                  </Field>
                  <div className="md:col-span-2">
                    <Button className="w-full rounded-full md:w-auto" size="lg">
                      Créer l’annonce
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="font-display text-2xl">
                  Biens de l’agence
                </CardTitle>
                <CardDescription>
                  Sélectionnez un bien pour créer ou relancer son espace
                  vendeur.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {listings.map((listing) => (
                  <button
                    key={listing.id}
                    type="button"
                    onClick={() => setSelectedId(listing.id)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selectedId === listing.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary/40 hover:bg-secondary"
                    }`}
                  >
                    <div className="font-medium">{listing.title}</div>
                    <div
                      className={`mt-1 text-sm ${
                        selectedId === listing.id
                          ? "text-primary-foreground/75"
                          : "text-muted-foreground"
                      }`}
                    >
                      {listing.city} · {listing.price}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

          </div>

          <div className="space-y-6">
            {selectedListing ? (
              <>
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle className="font-display text-3xl">
                      {selectedListing.title}
                    </CardTitle>
                    <CardDescription>
                      {selectedListing.city} · {selectedListing.price}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 text-sm md:grid-cols-3">
                    <Info
                      label="Surface"
                      value={`${selectedListing.surface} m²`}
                    />
                    <Info label="Pièces" value={selectedListing.rooms || "—"} />
                    <Info
                      label="Vendeur"
                      value={`${selectedListing.sellerFirstName} ${selectedListing.sellerLastName}`.trim()}
                    />
                  </CardContent>
                </Card>

                <SellerSpaceCreator
                  propertyId={selectedListing.id}
                  propertyTitle={selectedListing.title}
                  initialSeller={{
                    firstName: selectedListing.sellerFirstName,
                    lastName: selectedListing.sellerLastName,
                    email: selectedListing.sellerEmail,
                    phone: selectedListing.sellerPhone,
                  }}
                />
              </>
            ) : (
              <Card className="rounded-2xl">
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Aucun bien sélectionné.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      {icon}
      <div className="mt-4 font-display text-3xl">{value}</div>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-medium">{value}</div>
    </div>
  );
}
