// Verbatim port of App\Services\ChargeableWeightCalculator.
// Dimensional-weight divisors: 139 for lb/inches, 5000 for kg/cm; unknown
// units fall back to the lb divisor. Any dimension ≤ 0 ⇒ dimensional weight 0.
const DIVISOR_LB = 139;
const DIVISOR_KG = 5000;

export type Dimensions = {
  length?: number | null;
  width?: number | null;
  height?: number | null;
};

export function calculateDimensionalWeight(dims: Dimensions, unit: string): number {
  const length = dims.length ?? 0;
  const width = dims.width ?? 0;
  const height = dims.height ?? 0;

  // If any dimension is zero (or negative), dimensional weight is zero.
  if (length <= 0 || width <= 0 || height <= 0) {
    return 0;
  }

  const volume = length * width * height;
  const divisor = unit === "kg" ? DIVISOR_KG : DIVISOR_LB; // 'lb' and any default → 139
  return volume / divisor;
}

/** max(actualWeight, dimensionalWeight) — the FedEx chargeable weight. */
export function calculateChargeableWeight(
  actualWeight: number,
  dims: Dimensions,
  unit: string,
): number {
  return Math.max(actualWeight, calculateDimensionalWeight(dims, unit));
}
