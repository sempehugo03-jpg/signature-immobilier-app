import type { Diagnostic } from "@/lib/demo-store";

type IndicativeEstimateInput = Pick<Diagnostic, "bien" | "etat">;

export type IndicativeEstimate = {
  min: number;
  max: number;
  formattedRange: string;
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const defaultSurfaceByType: Record<string, number> = {
  appartement: 65,
  immeuble: 180,
  "local commercial": 95,
  maison: 105,
  terrain: 650,
};

const basePriceByType: Record<string, number> = {
  appartement: 2300,
  immeuble: 1600,
  "local commercial": 1500,
  maison: 2150,
  terrain: 120,
};

const cityAdjustments: Array<{ match: string; multiplier: number }> = [
  { match: "tarbes", multiplier: 1.05 },
  { match: "bagneres", multiplier: 1.02 },
  { match: "lourdes", multiplier: 0.98 },
  { match: "lannemezan", multiplier: 0.9 },
];

export function getIndicativeEstimate(
  input: IndicativeEstimateInput,
): IndicativeEstimate {
  const normalizedType = normalize(input.bien.type) || "maison";
  const isLand = normalizedType === "terrain";
  const referenceSurface =
    parsePositiveNumber(
      isLand ? input.bien.terrain || input.bien.surface : input.bien.surface,
    ) ??
    defaultSurfaceByType[normalizedType] ??
    defaultSurfaceByType.maison;

  const basePrice = basePriceByType[normalizedType] ?? basePriceByType.maison;
  const locationMultiplier = getLocationMultiplier(
    input.bien.ville,
    input.bien.codePostal,
  );
  const conditionMultiplier = getConditionMultiplier(input.etat.general);
  const typeMultiplier = getTypeMultiplier(normalizedType);

  let center =
    referenceSurface * basePrice * locationMultiplier * typeMultiplier;

  if (!isLand) {
    center *= conditionMultiplier;
    center += getAmenityBonus(input);
  }

  center = Math.max(center, isLand ? 25000 : 70000);

  const min = roundToNearest(center * 0.9, 5000);
  const max = Math.max(min + 10000, roundToNearest(center * 1.1, 5000));

  return {
    min,
    max,
    formattedRange: `${formatPrice(min)} - ${formatPrice(max)}`,
  };
}

function getLocationMultiplier(ville: string, codePostal: string) {
  const location = normalize(`${ville} ${codePostal}`);
  const cityMatch = cityAdjustments.find(({ match }) =>
    location.includes(match),
  );

  if (cityMatch) return cityMatch.multiplier;
  if (location.includes("65")) return 1;

  return 0.96;
}

function getConditionMultiplier(generalState: string) {
  const state = normalize(generalState);

  if (state === "excellent") return 1.08;
  if (state === "bon") return 1.02;
  if (state.includes("rafraichir")) return 0.94;
  if (state.includes("travaux")) return 0.86;

  return 1;
}

function getTypeMultiplier(type: string) {
  if (type === "immeuble") return 0.95;
  if (type === "local commercial") return 0.9;

  return 1;
}

function getAmenityBonus(input: IndicativeEstimateInput) {
  let bonus = 0;
  const landSurface = parsePositiveNumber(input.bien.terrain);

  if (normalize(input.bien.exterieur) === "oui") bonus += 8000;
  if (normalize(input.bien.stationnement) === "oui") bonus += 7000;
  if (landSurface) bonus += Math.min(landSurface, 1500) * 30;

  return bonus;
}

function parsePositiveNumber(value: string) {
  const numeric = Number.parseFloat(
    value
      .replace(/\s/g, "")
      .replace(",", ".")
      .match(/\d+(\.\d+)?/)?.[0] ?? "",
  );

  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function roundToNearest(value: number, nearest: number) {
  return Math.round(value / nearest) * nearest;
}

function formatPrice(value: number) {
  return currencyFormatter.format(value);
}

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
