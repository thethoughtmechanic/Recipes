export type Fraction = {
  numerator: number;
  denominator?: number;
};

export type ScaleOption = Fraction & {
  label: string;
};

export type ScaleConfig = {
  kind: "egg" | "egg-white" | "batch" | "weight" | "fixed";
  label: string;
  base: Fraction;
  options: ScaleOption[];
  suffix?: string;
};

export type Ingredient = {
  name: string;
  amount?: Fraction;
  unit?: string;
  note?: string;
  scalable?: boolean;
};

export type IngredientGroup = {
  title?: string;
  items: Ingredient[];
};

export type Recipe = {
  id: string;
  title: string;
  category: Category;
  tags: string[];
  tone: "moss" | "cobalt" | "periwinkle" | "gold" | "deep";
  mark: string;
  vessel?: string;
  yield?: string;
  heat?: string;
  time?: string;
  scale: ScaleConfig;
  ingredientGroups: IngredientGroup[];
  notes?: string[];
  sourceUrl?: string;
};

export type Category =
  | "Breakfast"
  | "Baking"
  | "Savoury"
  | "Sweets"
  | "Drink";

const wholeEggOptions: ScaleOption[] = [1, 2, 3, 4, 5, 6].map((value) => ({
  numerator: value,
  label: `${value}`,
}));

const batchOptions: ScaleOption[] = [
  { numerator: 1, denominator: 2, label: "½×" },
  { numerator: 1, label: "1×" },
  { numerator: 3, denominator: 2, label: "1½×" },
  { numerator: 2, label: "2×" },
];

const fixedScale: ScaleConfig = {
  kind: "fixed",
  label: "Source formula",
  base: { numerator: 1 },
  options: [{ numerator: 1, label: "As written" }],
};

export const categories: Array<"All" | Category> = [
  "All",
  "Breakfast",
  "Baking",
  "Savoury",
  "Sweets",
  "Drink",
];

export const recipes: Recipe[] = [
  {
    id: "dutch-baby",
    title: "Dutch Baby",
    category: "Breakfast",
    tags: ["Egg", "Skillet", "Oven"],
    tone: "cobalt",
    mark: "3E",
    vessel: "10-inch stainless-steel pan",
    yield: "1 skillet",
    heat: "425°F",
    time: "12–15 min",
    scale: {
      kind: "egg",
      label: "Whole eggs",
      base: { numerator: 3 },
      options: wholeEggOptions,
    },
    ingredientGroups: [
      {
        items: [
          {
            name: "Large eggs",
            amount: { numerator: 3 },
            unit: "eggs",
            note: "about 50g each, without shells",
          },
          { name: "All-purpose flour", amount: { numerator: 85 }, unit: "g" },
          { name: "Milk", amount: { numerator: 120 }, unit: "g" },
          { name: "Sugar", amount: { numerator: 12 }, unit: "g" },
          { name: "Unsalted butter", amount: { numerator: 57 }, unit: "g" },
        ],
      },
    ],
  },
  {
    id: "one-egg-skillet-cake",
    title: "1-Egg Skillet Cake",
    category: "Sweets",
    tags: ["Egg", "Cake", "Skillet"],
    tone: "periwinkle",
    mark: "1E",
    vessel: "6-inch cast-iron pan",
    yield: "1 small cake",
    heat: "350°F",
    time: "20–25 min",
    scale: {
      kind: "egg",
      label: "Whole eggs",
      base: { numerator: 1 },
      options: wholeEggOptions,
    },
    ingredientGroups: [
      {
        items: [
          {
            name: "Large egg",
            amount: { numerator: 1 },
            unit: "egg",
            note: "about 50g without shell",
          },
          { name: "All-purpose flour", amount: { numerator: 90 }, unit: "g" },
          { name: "Milk", amount: { numerator: 100 }, unit: "g" },
          { name: "Sugar", amount: { numerator: 35 }, unit: "g" },
          { name: "Neutral oil", amount: { numerator: 35 }, unit: "g" },
          { name: "Baking powder", amount: { numerator: 6 }, unit: "g" },
          { name: "Vanilla extract", amount: { numerator: 3 }, unit: "g" },
        ],
      },
    ],
  },
  {
    id: "weekend-crepes",
    title: "Weekend Crêpes",
    category: "Breakfast",
    tags: ["Egg", "Stovetop", "Weekend"],
    tone: "gold",
    mark: "3E",
    vessel: "10-inch pan",
    yield: "About 8 crêpes",
    heat: "Stovetop",
    scale: {
      kind: "egg",
      label: "Whole eggs",
      base: { numerator: 3 },
      options: wholeEggOptions,
    },
    ingredientGroups: [
      {
        items: [
          { name: "Large eggs", amount: { numerator: 3 }, unit: "eggs" },
          { name: "Milk", amount: { numerator: 250 }, unit: "g" },
          { name: "Sugar", amount: { numerator: 1 }, unit: "tbsp" },
          { name: "Vanilla extract", note: "a bit", scalable: false },
          { name: "Salt", note: "a bit", scalable: false },
          {
            name: "All-purpose flour",
            amount: { numerator: 120 },
            unit: "g",
            note: "1 cup in the source",
          },
          { name: "Butter", note: "2–3 tbsp" },
        ],
      },
    ],
  },
  {
    id: "osaka-takoyaki",
    title: "Osaka Takoyaki",
    category: "Savoury",
    tags: ["Egg", "Japanese", "Batter"],
    tone: "moss",
    mark: "28",
    vessel: "14-well takoyaki pan",
    yield: "2 rounds · 28 pieces",
    heat: "Stovetop",
    scale: {
      kind: "egg",
      label: "Whole eggs",
      base: { numerator: 1 },
      options: wholeEggOptions,
    },
    ingredientGroups: [
      {
        items: [
          { name: "Large egg", amount: { numerator: 1 }, unit: "egg" },
          { name: "Water", amount: { numerator: 330 }, unit: "g" },
          {
            name: "Dashi powder",
            amount: { numerator: 2, denominator: 3 },
            unit: "tsp",
          },
          {
            name: "Soy sauce",
            amount: { numerator: 2, denominator: 3 },
            unit: "tsp",
          },
          { name: "Salt", note: "to taste", scalable: false },
          { name: "All-purpose flour", amount: { numerator: 105 }, unit: "g" },
        ],
      },
    ],
  },
  {
    id: "tahini-rice-krispies",
    title: "Tahini Rice Krispies",
    category: "Sweets",
    tags: ["No-bake", "Ratio", "Chocolate"],
    tone: "gold",
    mark: "1:R",
    vessel: "11 × 18 Le Creuset pan",
    yield: "1 pan",
    heat: "Stovetop",
    scale: {
      kind: "weight",
      label: "Rice Krispies",
      base: { numerator: 100 },
      suffix: "g",
      options: [50, 75, 100, 150, 200].map((value) => ({
        numerator: value,
        label: `${value}g`,
      })),
    },
    ingredientGroups: [
      {
        items: [
          { name: "Rice Krispies", amount: { numerator: 100 }, unit: "g" },
          {
            name: "Marshmallows",
            amount: { numerator: 75 },
            unit: "g",
            note: "less is best",
          },
          { name: "Butter", amount: { numerator: 35 }, unit: "g" },
          { name: "Tahini", note: "1–2 tsp" },
          { name: "Vanilla extract", amount: { numerator: 1 }, unit: "tsp" },
          { name: "Salt", note: "5–10 dashes" },
          { name: "Chocolate chips", note: "1 handful" },
        ],
      },
    ],
    notes: ["Rice Krispies : marshmallow : butter = 1 : 0.75 : 0.35."],
  },
  {
    id: "pasta-tasting-menu",
    title: "Pasta Tasting Menu",
    category: "Savoury",
    tags: ["Pasta", "Menu", "By feel"],
    tone: "deep",
    mark: "4×",
    yield: "4 small courses",
    heat: "Stovetop",
    scale: fixedScale,
    ingredientGroups: [
      {
        title: "Farfalle",
        items: [
          { name: "Milk" },
          { name: "Butter" },
          { name: "Pasta water" },
          { name: "Parmesan" },
        ],
      },
      {
        title: "Linguine",
        items: [
          { name: "Trader Joe’s aglio e olio" },
          { name: "Garlic" },
          { name: "Olive oil + butter" },
          { name: "Steak" },
        ],
      },
      {
        title: "Fusilli",
        items: [
          { name: "Trader Joe’s lemon pesto" },
          { name: "Milk" },
          { name: "Pasta water" },
          { name: "Parmesan" },
          { name: "Asparagus" },
        ],
      },
      {
        title: "Tripoline",
        items: [
          { name: "Garlic + Sichuan peppercorn" },
          { name: "Tomato paste + tomato" },
          { name: "Pasta water" },
          { name: "Parmesan" },
        ],
      },
    ],
  },
  {
    id: "beef-tartare",
    title: "Beef Tartare",
    category: "Savoury",
    tags: ["Beef", "By feel", "No-cook"],
    tone: "deep",
    mark: "GF",
    yield: "By feel",
    heat: "No-cook",
    scale: fixedScale,
    ingredientGroups: [
      {
        items: [
          { name: "Top sirloin or tenderloin" },
          { name: "Shallots or onion" },
          { name: "Gherkins or capers" },
          { name: "Dijon mustard" },
          { name: "Worcestershire sauce" },
          { name: "Egg yolk" },
          { name: "Baguette" },
        ],
      },
    ],
    notes: ["Go by feel… good luck."],
  },
  {
    id: "seafood-pancake",
    title: "Seafood Pancake",
    category: "Savoury",
    tags: ["Egg", "Seafood", "Stovetop"],
    tone: "cobalt",
    mark: "1E",
    yield: "1 pancake",
    heat: "Stovetop",
    scale: {
      kind: "egg",
      label: "Whole eggs",
      base: { numerator: 1 },
      options: wholeEggOptions,
    },
    ingredientGroups: [
      {
        items: [
          { name: "Large egg", amount: { numerator: 1 }, unit: "egg" },
          { name: "Water", amount: { numerator: 50 }, unit: "g" },
          { name: "Starch", amount: { numerator: 30 }, unit: "g" },
          { name: "Flour", amount: { numerator: 30 }, unit: "g" },
          { name: "Dai O fish powder", note: "a sprinkle", scalable: false },
          { name: "Salt", note: "a dash", scalable: false },
          {
            name: "Frozen seafood, thawed",
            amount: { numerator: 1, denominator: 2 },
            unit: "bag",
            note: "½ of a 340g bag in the source",
          },
          { name: "Green onions", amount: { numerator: 3 }, unit: "" },
          {
            name: "Onion",
            amount: { numerator: 1, denominator: 2 },
            unit: "",
          },
        ],
      },
    ],
  },
  {
    id: "golden-diner-pancakes",
    title: "Golden Diner Pancakes",
    category: "Breakfast",
    tags: ["Egg", "Yeasted", "Pancake"],
    tone: "periwinkle",
    mark: "1E",
    yield: "2–3 pan pancakes",
    heat: "350°F finish",
    scale: {
      kind: "egg",
      label: "Whole eggs",
      base: { numerator: 1 },
      options: wholeEggOptions,
    },
    ingredientGroups: [
      {
        title: "Pancake",
        items: [
          { name: "Active dry yeast", amount: { numerator: 1 }, unit: "tsp" },
          { name: "All-purpose flour", amount: { numerator: 160 }, unit: "g" },
          {
            name: "Buttermilk",
            amount: { numerator: 150 },
            unit: "g",
            note: "warm with water, then ferment 1 hour",
          },
          { name: "Water", amount: { numerator: 30 }, unit: "g" },
          { name: "Sugar", amount: { numerator: 1 }, unit: "tbsp" },
          {
            name: "Baking soda",
            amount: { numerator: 3, denominator: 8 },
            unit: "tsp",
          },
          {
            name: "Salt",
            amount: { numerator: 1, denominator: 4 },
            unit: "tsp",
            note: "add to fermented mix",
          },
          { name: "Large egg", amount: { numerator: 1 }, unit: "egg" },
          {
            name: "Canola oil",
            amount: { numerator: 30 },
            unit: "g",
            note: "whisk with egg before combining",
          },
        ],
      },
      {
        title: "Sauce",
        items: [
          { name: "Maple syrup + honey + butter" },
          { name: "Soy sauce + salt" },
        ],
      },
    ],
    notes: [
      "Pan 2–4 minutes, flip 1–3 minutes, then finish in a 350°F oven.",
      "Finish with lemon zest and berry jam.",
    ],
    sourceUrl: "https://cooking.nytimes.com/recipes/1027064-golden-diner-pancakes",
  },
  {
    id: "cornbread",
    title: "Cornbread",
    category: "Baking",
    tags: ["Egg", "Skillet", "Optional mix-ins"],
    tone: "gold",
    mark: "1E",
    vessel: "6.5-inch Lodge skillet",
    yield: "1 small skillet",
    heat: "375°F · 190°C",
    time: "20–24 min",
    scale: {
      kind: "egg",
      label: "Whole eggs",
      base: { numerator: 1 },
      options: wholeEggOptions,
    },
    ingredientGroups: [
      {
        title: "Batter",
        items: [
          {
            name: "Yellow cornmeal, medium or coarse",
            amount: { numerator: 80 },
            unit: "g",
          },
          { name: "All-purpose flour", amount: { numerator: 32 }, unit: "g" },
          {
            name: "Sugar",
            amount: { numerator: 25 },
            unit: "g",
            note: "adjust up or down to taste",
          },
          {
            name: "Kosher salt",
            amount: { numerator: 1, denominator: 2 },
            unit: "tsp",
          },
          { name: "Baking powder", amount: { numerator: 1 }, unit: "tsp" },
          {
            name: "Baking soda",
            amount: { numerator: 1, denominator: 4 },
            unit: "tsp",
          },
          { name: "Large egg", amount: { numerator: 1 }, unit: "egg" },
          { name: "Milk", amount: { numerator: 60 }, unit: "ml" },
          { name: "Water", amount: { numerator: 60 }, unit: "ml" },
          {
            name: "Buttermilk powder",
            amount: { numerator: 1 },
            unit: "tbsp",
          },
          {
            name: "Unsalted butter, melted",
            amount: { numerator: 40 },
            unit: "g",
            note: "reserve ½ tbsp for skillet",
          },
        ],
      },
      {
        title: "Optional",
        items: [
          { name: "Honey", amount: { numerator: 2 }, unit: "tsp" },
          { name: "Corn kernels", amount: { numerator: 2 }, unit: "tbsp" },
          { name: "Chopped jalapeño", amount: { numerator: 1 }, unit: "tbsp" },
          { name: "Shredded cheddar", amount: { numerator: 2 }, unit: "tbsp" },
        ],
      },
    ],
    notes: [
      "No buttermilk powder: use 2 tbsp more milk and ½ tsp lemon juice.",
      "Pan size and baking time are only tested for the one-egg batch.",
    ],
  },
  {
    id: "yorkshire-pudding-v2",
    title: "Yorkshire Pudding v2",
    category: "Baking",
    tags: ["Egg", "Muffin tin", "Oven"],
    tone: "moss",
    mark: "3E",
    vessel: "12-cup muffin tin",
    yield: "12",
    heat: "425°F",
    time: "12–15 min",
    scale: {
      kind: "egg",
      label: "Whole eggs",
      base: { numerator: 3 },
      options: wholeEggOptions,
    },
    ingredientGroups: [
      {
        items: [
          { name: "Large eggs", amount: { numerator: 3 }, unit: "eggs" },
          { name: "All-purpose flour", amount: { numerator: 60 }, unit: "g" },
          { name: "Corn starch", amount: { numerator: 20 }, unit: "g" },
          { name: "Milk", amount: { numerator: 75 }, unit: "g" },
          { name: "Water", amount: { numerator: 75 }, unit: "g" },
          { name: "Salt", note: "some", scalable: false },
          { name: "Oil for the muffin tin", scalable: false },
        ],
      },
    ],
  },
  {
    id: "ginger-slam-milk",
    title: "Ginger Slam Milk",
    category: "Drink",
    tags: ["Milk", "Ginger", "Bowl"],
    tone: "periwinkle",
    mark: "1B",
    vessel: "Staub bowl",
    yield: "1 bowl",
    heat: "Milk at 70–75°C",
    scale: {
      kind: "batch",
      label: "Bowls",
      base: { numerator: 1 },
      options: [1, 2, 3, 4].map((value) => ({
        numerator: value,
        label: `${value}`,
      })),
    },
    ingredientGroups: [
      {
        items: [
          {
            name: "Ginger juice",
            amount: { numerator: 10 },
            unit: "ml",
            note: "from about 40g ginger",
          },
          { name: "Sugar", amount: { numerator: 5 }, unit: "g" },
          {
            name: "Milk",
            amount: { numerator: 150 },
            unit: "ml",
            note: "warm to 70–75°C",
          },
        ],
      },
    ],
    notes: ["Put warm milk into the ginger, then wait."],
  },
  {
    id: "tuile-cookies",
    title: "Tuile Cookies",
    category: "Sweets",
    tags: ["Egg white", "Cookie", "Oven"],
    tone: "cobalt",
    mark: "1W",
    yield: "About 6–8 small tuiles",
    heat: "350°F",
    time: "6–9 min",
    scale: {
      kind: "egg-white",
      label: "Egg whites",
      base: { numerator: 1 },
      options: wholeEggOptions,
    },
    ingredientGroups: [
      {
        items: [
          { name: "Large egg white", amount: { numerator: 1 }, unit: "white" },
          { name: "Sugar", amount: { numerator: 25 }, unit: "g" },
          { name: "Flour", amount: { numerator: 25 }, unit: "g" },
          { name: "Oil", amount: { numerator: 30 }, unit: "ml" },
          {
            name: "Vanilla",
            amount: { numerator: 1, denominator: 4 },
            unit: "tsp",
          },
          { name: "Salt", note: "to taste", scalable: false },
        ],
      },
    ],
  },
  {
    id: "banana-pancakes",
    title: "Banana Pancakes",
    category: "Breakfast",
    tags: ["Egg", "Banana", "Pancake"],
    tone: "moss",
    mark: "1E",
    vessel: "Stainless-steel pan",
    yield: "1 batch",
    heat: "Low stovetop",
    scale: {
      kind: "egg",
      label: "Whole eggs",
      base: { numerator: 1 },
      options: wholeEggOptions,
    },
    ingredientGroups: [
      {
        items: [
          { name: "Large egg", amount: { numerator: 1 }, unit: "egg" },
          {
            name: "Banana",
            amount: { numerator: 200 },
            unit: "g",
            note: "about 1½–2 bananas",
          },
          { name: "Milk", amount: { numerator: 200 }, unit: "g" },
          { name: "Vanilla", amount: { numerator: 15 }, unit: "g" },
          { name: "All-purpose flour", amount: { numerator: 150 }, unit: "g" },
          { name: "Baking powder", amount: { numerator: 15, denominator: 2 }, unit: "g" },
          { name: "Sugar", amount: { numerator: 15 }, unit: "g" },
          { name: "Cinnamon", amount: { numerator: 2 }, unit: "g" },
          { name: "Salt", note: "to taste", scalable: false },
          { name: "Chocolate chips", note: "to taste", scalable: false },
        ],
      },
    ],
    notes: ["Preheat stainless steel. Low and slow for rise without burning."],
  },
  {
    id: "pancakes",
    title: "Pancakes",
    category: "Breakfast",
    tags: ["Egg", "Pancake", "Stovetop"],
    tone: "periwinkle",
    mark: "1E",
    vessel: "Stainless-steel pan",
    yield: "1 batch",
    heat: "Low stovetop",
    scale: {
      kind: "egg",
      label: "Whole eggs",
      base: { numerator: 1 },
      options: wholeEggOptions,
    },
    ingredientGroups: [
      {
        items: [
          { name: "Large egg", amount: { numerator: 1 }, unit: "egg" },
          { name: "Milk", amount: { numerator: 180 }, unit: "g" },
          { name: "Vanilla", amount: { numerator: 15 }, unit: "g" },
          { name: "All-purpose flour", amount: { numerator: 135 }, unit: "g" },
          { name: "Baking powder", amount: { numerator: 15, denominator: 2 }, unit: "g" },
          { name: "Sugar", amount: { numerator: 25 }, unit: "g" },
          { name: "Cinnamon", amount: { numerator: 2 }, unit: "g" },
          { name: "Salt", note: "to taste", scalable: false },
          { name: "Chocolate chips", note: "to taste", scalable: false },
        ],
      },
    ],
    notes: ["Preheat stainless steel. Low and slow for rise without burning."],
  },
];

export const defaultBatchOptions = batchOptions;
