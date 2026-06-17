import { agencyConfig } from "@/lib/agency-config";

export const LOCAL_LISTINGS_KEY = "signature_agent_listings";
export const LOCAL_DELETED_LISTINGS_KEY = "signature_agent_deleted_listings";

export const PLACEHOLDER_PROPERTY_IMAGE = agencyConfig.properties[0].coverImage;

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

export const AGENT_SALE_STATUSES = [
  "En préparation",
  "Annonce publiée",
  "Visites en cours",
  "Offre reçue",
  "Compromis signé",
  "Vente finalisée",
] as const;

export const AGENT_PROPERTY_TYPES = [
  "Maison",
  "Appartement",
  "Villa",
  "Terrain",
  "Immeuble",
  "Local commercial",
] as const;

export type AgentListing = {
  id: string;
  title: string;
  propertyType?: string;
  city: string;
  address: string;
  price: string;
  surface: string;
  rooms: string;
  bedrooms?: string;
  bathrooms?: string;
  exterior?: string;
  parking?: string;
  description?: string;
  sellerFirstName: string;
  sellerLastName: string;
  sellerEmail: string;
  sellerPhone: string;
  coverImage?: string;
  photos?: string[];
  saleStatus?: string;
  sellerSpaceStatus?: "created" | "not_created";
  documents?: Array<{ name: string; status: string }>;
};

export type ManagedListing = AgentListing & {
  id: string;
  title: string;
  propertyType: string;
  city: string;
  address: string;
  price: string;
  surface: string;
  rooms: string;
  bedrooms: string;
  bathrooms: string;
  exterior: string;
  parking: string;
  description: string;
  sellerFirstName: string;
  sellerLastName: string;
  sellerEmail: string;
  sellerPhone: string;
  coverImage: string;
  photos: string[];
  saleStatus: string;
  sellerSpaceStatus: "created" | "not_created";
  documents: Array<{ name: string; status: string }>;
};

export function readLocalAgentListings() {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(LOCAL_LISTINGS_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as AgentListing[];
  } catch {
    return [];
  }
}

export function writeLocalAgentListings(listings: AgentListing[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify(listings));
}

export function readDeletedAgentListingIds() {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(LOCAL_DELETED_LISTINGS_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function writeDeletedAgentListingIds(ids: string[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(LOCAL_DELETED_LISTINGS_KEY, JSON.stringify(ids));
}

export function upsertLocalAgentListing(listing: AgentListing) {
  const listings = readLocalAgentListings();
  const index = listings.findIndex((item) => item.id === listing.id);
  const nextListing = normalizeAgentListing(listing);

  if (index >= 0) {
    listings[index] = nextListing;
  } else {
    listings.unshift(nextListing);
  }

  writeLocalAgentListings(listings);
  return listings;
}

export function deleteAgentListing(id: string) {
  const listings = readLocalAgentListings();
  writeLocalAgentListings(listings.filter((listing) => listing.id !== id));

  if (isBaseAgentListing(id)) {
    const deletedIds = new Set(readDeletedAgentListingIds());
    deletedIds.add(id);
    writeDeletedAgentListingIds(Array.from(deletedIds));
  }
}

export function getAgentListings(
  createdListings: AgentListing[],
  deletedIds: string[] = [],
) {
  const deleted = new Set(deletedIds);
  const localIds = new Set(createdListings.map((listing) => listing.id));

  return [
    ...createdListings
      .filter((listing) => !deleted.has(listing.id))
      .map(normalizeAgentListing),
    ...getBaseAgentListings().filter(
      (listing) => !localIds.has(listing.id) && !deleted.has(listing.id),
    ),
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
      propertyType: property.type,
      city: property.city,
      address: property.address,
      price: property.price,
      surface: `${property.surface}`,
      rooms: `${property.rooms}`,
      bedrooms: `${property.bedrooms}`,
      bathrooms: `${property.bathrooms}`,
      exterior: property.land,
      parking: property.features.find((feature) =>
        normalizeFeature(feature).includes("garage"),
      )
        ? "Garage"
        : "",
      description: property.description,
      sellerFirstName: seller?.firstName ?? "",
      sellerLastName: seller?.lastName ?? "",
      sellerEmail: seller?.email ?? "",
      sellerPhone: seller?.phone ?? "",
      coverImage: property.coverImage,
      photos: property.gallery.length
        ? property.gallery.slice()
        : [property.coverImage],
      saleStatus: normalizeSaleStatus(property.status),
      sellerSpaceStatus: index % 2 === 0 ? "created" : "not_created",
      documents: property.documents.slice(),
    };
  });
}

function normalizeAgentListing(listing: AgentListing): ManagedListing {
  const photos = getPhotoList(listing);

  return {
    ...listing,
    propertyType: listing.propertyType?.trim() || "Maison",
    city: listing.city.trim(),
    address: listing.address.trim(),
    price: listing.price.trim(),
    surface: listing.surface.trim(),
    rooms: listing.rooms.trim(),
    bedrooms: listing.bedrooms?.trim() ?? "",
    bathrooms: listing.bathrooms?.trim() ?? "",
    exterior: listing.exterior?.trim() ?? "",
    parking: listing.parking?.trim() ?? "",
    description: listing.description?.trim() ?? "",
    sellerFirstName: listing.sellerFirstName.trim(),
    sellerLastName: listing.sellerLastName.trim(),
    sellerEmail: listing.sellerEmail.trim(),
    sellerPhone: listing.sellerPhone.trim(),
    coverImage: photos[0],
    photos,
    saleStatus: listing.saleStatus ?? "En préparation",
    sellerSpaceStatus: listing.sellerSpaceStatus ?? "not_created",
    documents: listing.documents ?? [
      { name: "Mandat", status: "À préparer" },
      { name: "Diagnostics", status: "À préparer" },
      { name: "Offre", status: "À préparer" },
      { name: "Compromis", status: "À préparer" },
    ],
  };
}

function getPhotoList(listing: AgentListing) {
  if (listing.photos?.length) return listing.photos;
  if (listing.coverImage) return [listing.coverImage];
  return [PLACEHOLDER_PROPERTY_IMAGE];
}

function isBaseAgentListing(id: string) {
  return agencyConfig.properties.some((property) => property.id === id);
}

function normalizeFeature(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
