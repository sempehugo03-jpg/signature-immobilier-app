import { agencyConfig } from "@/lib/agency-config";

export const LOCAL_LISTINGS_KEY = "signature_agent_listings";

export const AGENT_PROGRESS_STEPS = [
  "Mandat",
  "Annonce",
  "Visites",
  "Offre",
  "Compromis",
  "Vente",
] as const;

export const AGENT_DOCUMENTS = [
  "Mandat",
  "Diagnostics",
  "Offre",
  "Compromis",
] as const;

export type AgentListing = {
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
  coverImage?: string;
  saleStatus?: string;
  sellerSpaceStatus?: "created" | "not_created";
  documents?: Array<{ name: string; status: string }>;
};

export type ManagedListing = Required<
  Pick<
    AgentListing,
    | "id"
    | "title"
    | "city"
    | "address"
    | "price"
    | "surface"
    | "rooms"
    | "sellerFirstName"
    | "sellerLastName"
    | "sellerEmail"
    | "sellerPhone"
    | "coverImage"
    | "saleStatus"
    | "sellerSpaceStatus"
    | "documents"
  >
>;

export function readLocalAgentListings() {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(LOCAL_LISTINGS_KEY);
  return raw ? (JSON.parse(raw) as AgentListing[]) : [];
}

export function writeLocalAgentListings(listings: AgentListing[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify(listings));
}

export function getAgentListings(createdListings: AgentListing[]) {
  return [
    ...createdListings.map(
      (listing): ManagedListing => ({
        ...listing,
        coverImage: listing.coverImage ?? agencyConfig.properties[0].coverImage,
        saleStatus: listing.saleStatus ?? "En préparation",
        sellerSpaceStatus: listing.sellerSpaceStatus ?? "not_created",
        documents: listing.documents ?? [
          { name: "Mandat", status: "À préparer" },
          { name: "Diagnostics", status: "À préparer" },
          { name: "Offre", status: "À préparer" },
          { name: "Compromis", status: "À préparer" },
        ],
      }),
    ),
    ...getBaseAgentListings(),
  ];
}

export function normalizeSaleStatus(status: string) {
  if (status.includes("Offre")) return "Offre en cours";
  if (status.includes("Compromis")) return "Compromis signé";
  if (status.includes("Vendu") || status.includes("finalisée")) return "Vendu";
  if (status.includes("Annonce") || status.includes("Visites")) {
    return "En commercialisation";
  }
  return "En préparation";
}

export function getProgressStepIndex(status: string) {
  if (status.includes("Vendu")) return 5;
  if (status.includes("Compromis")) return 4;
  if (status.includes("Offre")) return 3;
  if (status.includes("Visites") || status.includes("commercialisation")) {
    return 2;
  }
  if (status.includes("Annonce")) return 1;
  return 0;
}

function getBaseAgentListings() {
  return agencyConfig.properties.map((property, index): ManagedListing => {
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
      coverImage: property.coverImage,
      saleStatus: normalizeSaleStatus(property.status),
      sellerSpaceStatus: index % 2 === 0 ? "created" : "not_created",
      documents: property.documents.slice(),
    };
  });
}
