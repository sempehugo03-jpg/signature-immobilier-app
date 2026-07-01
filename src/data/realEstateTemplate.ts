export type RealEstateTemplateProperty = {
  id: string;
  title: string;
  city: string;
  district: string;
  surface: number;
  rooms: number;
  bedrooms: number;
  price: number;
  image: string;
  status: "active" | "sold" | "draft";
  progress: number;
  visits: number;
  offers: number;
  pendingVisits: number;
  seller: { name: string; email: string; phone: string };
  description: string;
};

const assetBase =
  "https://raw.githubusercontent.com/sempehugo03-jpg/opus-domus/main/src/assets";

export const realEstateTemplate = {
  agencyId: "template-immobilier",
  agencyName: "Signature Immobilier",
  agency: {
    name: "Signature Immobilier",
    city: "Paris",
    tagline: "L'immobilier, signe.",
    phone: "+33 1 84 60 12 00",
    email: "bonjour@signature-paris.fr",
    address: "12 rue de l'Universite, 75007 Paris",
  },
  assets: {
    hero: `${assetBase}/hero-penthouse.jpg`,
  },
  properties: [
    {
      id: "rue-du-bac",
      title: "Appartement Haussmannien",
      city: "Paris",
      district: "Rue du Bac, 75007",
      surface: 124,
      rooms: 5,
      bedrooms: 3,
      price: 1_450_000,
      image: `${assetBase}/property-1.jpg`,
      status: "active",
      progress: 60,
      visits: 12,
      offers: 2,
      pendingVisits: 8,
      seller: {
        name: "M. & Mme Laurent",
        email: "laurent@signature.fr",
        phone: "+33 6 12 34 56 78",
      },
      description:
        "Appartement traversant au 4e etage avec ascenseur. Parquet d'origine, moulures, cheminees en marbre. Vue degagee sur cour pavee.",
    },
    {
      id: "av-montaigne",
      title: "Duplex contemporain",
      city: "Paris",
      district: "Avenue Montaigne, 75008",
      surface: 185,
      rooms: 6,
      bedrooms: 4,
      price: 3_200_000,
      image: `${assetBase}/property-2.jpg`,
      status: "active",
      progress: 30,
      visits: 6,
      offers: 0,
      pendingVisits: 3,
      seller: {
        name: "Famille Beranger",
        email: "beranger@signature.fr",
        phone: "+33 6 98 76 54 32",
      },
      description:
        "Duplex lumineux entierement renove. Cuisine ouverte en marbre, terrasse plein sud de 22 m2.",
    },
    {
      id: "quai-voltaire",
      title: "Loft sur Seine",
      city: "Paris",
      district: "Quai Voltaire, 75007",
      surface: 92,
      rooms: 3,
      bedrooms: 2,
      price: 1_890_000,
      image: `${assetBase}/property-3.jpg`,
      status: "active",
      progress: 85,
      visits: 18,
      offers: 3,
      pendingVisits: 2,
      seller: {
        name: "Marc-Antoine G.",
        email: "ma.g@signature.fr",
        phone: "+33 6 11 22 33 44",
      },
      description:
        "Loft d'angle avec vue Seine. Verrieres d'atelier, plafonds 3,2 m, finitions sur-mesure.",
    },
  ] satisfies RealEstateTemplateProperty[],
};

export const formatTemplatePrice = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
