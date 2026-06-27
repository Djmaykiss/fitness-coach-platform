import type { BodyMetrics, BodyMetricsInput } from "@/types";

/**
 * Metricas corporales con formulas reales y estandar (sin IA):
 * - IMC = peso / altura^2
 * - Peso ideal: IMC objetivo 22
 * - Calorias: Mifflin-St Jeor x factor de actividad ligero
 * - Agua: 35 ml por kg
 * - Macros: proteina 2 g/kg, grasa 25% de calorias, resto carbohidratos
 */
function imcLabel(imc: number): string {
  if (imc < 18.5) return "Bajo peso";
  if (imc < 25) return "Normal";
  if (imc < 30) return "Sobrepeso";
  return "Obesidad";
}

export const metricsService = {
  compute(input: BodyMetricsInput): BodyMetrics {
    const { weightKg, heightCm, age, sex, targetKg } = input;
    const h = heightCm / 100;
    const imc = h > 0 ? weightKg / (h * h) : 0;
    const idealWeight = 22 * h * h;

    const isMale = sex.trim().toLowerCase().startsWith("h");
    const bmr =
      10 * weightKg + 6.25 * heightCm - 5 * age + (isMale ? 5 : -161);
    const calories = Math.round((bmr * 1.4) / 10) * 10;

    const protein = Math.round(weightKg * 2);
    const fatCalories = calories * 0.25;
    const fat = Math.round(fatCalories / 9);
    const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

    return {
      imc: Math.round(imc * 10) / 10,
      imcLabel: imcLabel(imc),
      idealWeight: Math.round(idealWeight * 10) / 10,
      remainingKg: Math.round((weightKg - targetKg) * 10) / 10,
      calories,
      water: Math.round((weightKg * 35) / 100) / 10,
      protein,
      carbs: Math.max(0, carbs),
      fat,
    };
  },
};
