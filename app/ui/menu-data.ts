export type Establishment = {
  id: string;
  name: string;
  type: "Comida" | "Bar";
  emoji: string;
  whatsapp: string;
  items: { id: string; category: string; name: string; description: string; price: number }[];
};

export type FoodParkTable = {
  /** Identificador usado na URL e no QR Code. Não use apenas o número visível. */
  token: string;
  number: number;
  active: boolean;
};

/**
 * Dados temporários. Na próxima etapa eles passarão a vir do banco de dados.
 * O token evita que alguém precise adivinhar a URL somente pelo número da mesa.
 */
export const foodParkTables: FoodParkTable[] = [
  { token: "mesa-01-a7k", number: 1, active: true },
  { token: "mesa-02-b3r", number: 2, active: true },
  { token: "mesa-12-demo", number: 12, active: true },
];

export const establishments: Establishment[] = [
  {
    id: "burger-da-praca", name: "Burger da Praça", type: "Comida", emoji: "🍔", whatsapp: "5511999991111",
    items: [
      { id: "burger-classico", category: "Lanches", name: "Burger Clássico", description: "Pão, hambúrguer, queijo e molho da casa.", price: 28 },
      { id: "batata", category: "Porções", name: "Batata Frita", description: "Porção individual crocante.", price: 14 },
    ],
  },
  {
    id: "pizza-park", name: "Pizza Park", type: "Comida", emoji: "🍕", whatsapp: "5511999992222",
    items: [
      { id: "pizza-margherita", category: "Pizzas", name: "Pizza Margherita", description: "Molho, muçarela, tomate e manjericão.", price: 42 },
      { id: "pizza-calabresa", category: "Pizzas", name: "Pizza Calabresa", description: "Muçarela, calabresa e cebola.", price: 45 },
    ],
  },
  {
    id: "bar-do-park", name: "Bar do Park", type: "Bar", emoji: "🍺", whatsapp: "5511999993333",
    items: [
      { id: "pilsen", category: "Cervejas", name: "Cerveja Pilsen", description: "Long neck gelada, 330 ml.", price: 12 },
      { id: "caipirinha", category: "Drinks", name: "Caipirinha", description: "Limão, cachaça, açúcar e gelo.", price: 22 },
    ],
  },
];
