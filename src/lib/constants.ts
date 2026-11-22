export const CATEGORIES = ["Restaurantes", "Cafés e doces", "Pousadas e hotéis", "Vinícolas", "Passeios", "Bem-estar", "Entretenimento"] as const;

export const CATEGORY_COLORS: Record<string, [string, string]> = {
  "Restaurantes": ["#E0262E", "#8E0A10"],
  "Cafés e doces": ["#FF9A1F", "#C25A00"],
  "Pousadas e hotéis": ["#19B1F0", "#0A6A9E"],
  "Vinícolas": ["#9B2A4E", "#4A0F22"],
  "Passeios": ["#3DAA22", "#1C6A0C"],
  "Bem-estar": ["#6E9446", "#2E4420"],
  "Entretenimento": ["#7A5AF8", "#3B2A8C"],
};

export const POSITIONS = {
  home: "Home · faixa abaixo do banner principal",
  categoria: "Página de parceiros · topo",
  blog: "Blog · lateral dos posts",
} as const;

export const BRAND_COLORS = [
  ["Vermelho", "#C8101A"], ["Laranja", "#FF8A00"], ["Verde", "#2E9F18"], ["Azul", "#00A6ED"],
] as const;
