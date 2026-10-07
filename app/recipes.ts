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

// Counts refer to the source batch; vessel descriptions stay independent of scaling.
export type YieldCount = {
  amount: number;
  maximum?: number;
  unit: string;
  plural: string;
  approximate?: boolean;
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
  yieldCount?: YieldCount;
  heat?: string;
  time?: string;
  scale: ScaleConfig;
  ingredientGroups: IngredientGroup[];
  method?: string[];
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
    id: "staub-banana-bread",
    title: "Moist Banana Bread",
    category: "Baking",
    tags: ["Banana", "Not too sweet", "Staub"],
    tone: "gold",
    mark: "1E",
    vessel: "7.5 × 6-inch Staub ceramic baking dish",
    yield: "1 small loaf · 6–8 pieces",
    yieldCount: { amount: 6, maximum: 8, unit: "piece", plural: "pieces" },
    heat: "325°F · 163°C",
    time: "28–35 min + banana roast",
    scale: {
      kind: "batch",
      label: "Batch size",
      base: { numerator: 1 },
      options: batchOptions,
    },
    ingredientGroups: [
      {
        title: "Roasted banana",
        items: [
          { name: "Banana, peeled", amount: { numerator: 205 }, unit: "g", note: "200–210g; slightly underripe is fine" },
          { name: "Granulated sugar", amount: { numerator: 15 }, unit: "g", note: "from the 55g total" },
        ],
      },
      {
        title: "Batter",
        items: [
          { name: "Granulated sugar", amount: { numerator: 40 }, unit: "g" },
          { name: "Large egg", amount: { numerator: 1 }, unit: "egg" },
          { name: "Unsalted butter, melted", amount: { numerator: 45 }, unit: "g" },
          { name: "Plain Greek yogurt", amount: { numerator: 55 }, unit: "g" },
          { name: "Vanilla extract", amount: { numerator: 1 }, unit: "tsp" },
          { name: "All-purpose flour", amount: { numerator: 110 }, unit: "g" },
          { name: "Whole-wheat flour", amount: { numerator: 15 }, unit: "g", note: "optional; replace with AP flour if preferred" },
          { name: "Baking powder", amount: { numerator: 3, denominator: 2 }, unit: "tsp" },
          { name: "Fine salt", amount: { numerator: 1, denominator: 4 }, unit: "tsp" },
          { name: "Cinnamon", amount: { numerator: 1, denominator: 4 }, unit: "tsp", note: "optional" },
        ],
      },
    ],
    method: [
      "Heat the oven to 325°F (163°C). Butter the Staub. Add the banana and 15g sugar; roast 15–20 minutes, stirring and mashing once or twice, until soft, fragrant and lightly caramelized. Transfer to a bowl and cool 5–10 minutes.",
      "Whisk the remaining 40g sugar into the warm banana. Whisk in the egg, melted butter, Greek yogurt and vanilla.",
      "In a separate bowl, whisk the flours, baking powder, salt and optional cinnamon.",
      "Fold the dry ingredients into the wet just until no dry streaks remain. Do not overmix.",
      "Butter the Staub again, spread in the batter and smooth the top. Bake 28–35 minutes, checking at 27 minutes. Pull when a tester has a few moist crumbs but no wet batter; about 202–205°F (94–96°C) in the center.",
      "Cool at least 15 minutes before slicing.",
    ],
    notes: [
      "Designed specifically for the 7.5 × 6-inch (20 × 16cm), ~1.1L / 1.25qt Staub ceramic baker.",
      "55g total sugar keeps this deliberately less sweet while banana and Greek yogurt preserve moisture.",
      "Roasting is especially useful when the banana is not deeply ripe; do not reduce it into a dry paste.",
      "No baking soda needed: this formula is designed around baking powder.",
      "For the moistest result, avoid baking until the tester is completely dry.",
    ],
  },
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
          { name: "Neutral oil", note: "a splash for the pan", scalable: false },
        ],
      },
    ],
    method: [
      "Heat the oven to 425°F with the pan inside. If you made the batter the night before, take it from the fridge while the oven warms.",
      "Whisk the eggs, flour, milk and sugar until smooth.",
      "Add the butter and a splash of neutral oil to the warm pan so the butter does not burn. Return it to the oven briefly to melt the butter. It need not be as hot as for Yorkshire puddings.",
      "Pour in the batter and bake 12–15 minutes, until puffed. Check the bake when changing the batch size; the pan and time are for the original three-egg formula.",
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
    yieldCount: { amount: 8, unit: "crêpe", plural: "crêpes", approximate: true },
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
    yieldCount: { amount: 28, unit: "piece", plural: "pieces" },
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
    yieldCount: { amount: 1, unit: "pancake", plural: "pancakes" },
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
    yieldCount: { amount: 2, maximum: 3, unit: "pan pancake", plural: "pan pancakes" },
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
    yieldCount: { amount: 12, unit: "pudding", plural: "puddings" },
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
    category: "Sweets",
    tags: ["Hong Kong", "Chinese dessert", "Ginger"],
    tone: "periwinkle",
    mark: "1B",
    vessel: "Staub bowl",
    yield: "1 bowl",
    yieldCount: { amount: 1, unit: "bowl", plural: "bowls" },
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
    yieldCount: { amount: 6, maximum: 8, unit: "small tuile", plural: "small tuiles", approximate: true },
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
  {
    id: "original-plum-torte",
    title: "Original Plum Torte",
    category: "Sweets",
    tags: ["Plum", "Cake", "One bowl"],
    tone: "periwinkle",
    mark: "2E",
    vessel: "8–10-inch springform pan",
    yield: "8 servings",
    yieldCount: { amount: 8, unit: "serving", plural: "servings" },
    heat: "350°F",
    time: "1 hr + cool",
    scale: {
      kind: "egg",
      label: "Whole eggs",
      base: { numerator: 2 },
      options: wholeEggOptions,
    },
    ingredientGroups: [
      {
        title: "Batter",
        items: [
          {
            name: "Granulated sugar",
            amount: { numerator: 150 },
            unit: "g",
            note: "use up to 200g for a sweeter cake",
          },
          {
            name: "Unsalted butter, softened",
            amount: { numerator: 115 },
            unit: "g",
          },
          { name: "Unbleached flour, sifted", amount: { numerator: 125 }, unit: "g" },
          {
            name: "Baking powder",
            amount: { numerator: 4 },
            unit: "g",
            note: "about 1 tsp",
          },
          { name: "Salt", note: "pinch, optional", scalable: false },
          {
            name: "Large eggs",
            amount: { numerator: 2 },
            unit: "eggs",
            note: "about 50g each, without shells",
          },
        ],
      },
      {
        title: "Plums + finish",
        items: [
          {
            name: "Purple plums, pitted and halved",
            amount: { numerator: 450 },
            unit: "g",
            note: "about 12 small plums or 24 halves; use enough to cover the batter",
          },
          {
            name: "Sugar, lemon juice, and cinnamon",
            note: "for topping, to taste; about 1 tsp cinnamon for the two-egg formula",
            scalable: false,
          },
        ],
      },
    ],
    notes: [
      "Cream sugar and butter. Beat in flour, baking powder, optional salt, and eggs.",
      "Spoon into the springform pan, arrange plums skin-side up, then top with sugar, lemon juice, and cinnamon.",
      "Bake about 1 hour. Cool before serving; refrigerate or freeze if desired. The pan and bake time are for the original two-egg formula.",
    ],
    sourceUrl: "https://cooking.nytimes.com/recipes/3783-original-plum-torte",
  },
  {
    id: "berry-buttermilk-cake",
    title: "Berry Buttermilk Cake",
    category: "Sweets",
    tags: ["Cake", "Berry", "One bowl"],
    tone: "cobalt",
    mark: "2E",
    vessel: "9-inch square or round pan",
    yield: "1 cake · 8–10 servings",
    yieldCount: { amount: 8, maximum: 10, unit: "serving", plural: "servings" },
    heat: "350°F",
    time: "53–58 min",
    scale: {
      kind: "egg",
      label: "Whole eggs",
      base: { numerator: 2 },
      options: wholeEggOptions,
    },
    ingredientGroups: [
      {
        title: "Batter",
        items: [
          {
            name: "Neutral oil",
            amount: { numerator: 120 },
            unit: "ml",
            note: "plus more for the pan",
          },
          { name: "Buttermilk or milk", amount: { numerator: 120 }, unit: "ml" },
          { name: "Large eggs", amount: { numerator: 2 }, unit: "eggs" },
          { name: "Vanilla extract", amount: { numerator: 1 }, unit: "tbsp" },
          { name: "Granulated sugar", amount: { numerator: 200 }, unit: "g" },
          { name: "All-purpose flour", amount: { numerator: 190 }, unit: "g" },
          {
            name: "Baking powder",
            amount: { numerator: 3, denominator: 2 },
            unit: "tsp",
          },
          {
            name: "Baking soda",
            amount: { numerator: 1, denominator: 2 },
            unit: "tsp",
          },
          {
            name: "Kosher salt",
            amount: { numerator: 1, denominator: 2 },
            unit: "tsp",
          },
        ],
      },
      {
        title: "Berries + finish",
        items: [
          {
            name: "Frozen berries",
            amount: { numerator: 285 },
            unit: "g",
            note: "about 2 cups; any mix, with large pieces quartered",
          },
          { name: "All-purpose flour", amount: { numerator: 1 }, unit: "tbsp" },
          { name: "Granulated sugar", amount: { numerator: 2 }, unit: "tbsp" },
        ],
      },
    ],
    notes: [
      "Oil and line the pan with parchment. Whisk the oil, buttermilk, eggs, vanilla, and 200g sugar together.",
      "Whisk the dry ingredients separately, then stir in the wet mixture just until combined; a few small lumps are fine.",
      "Toss the berries with 1 tbsp flour, fold them into the batter, and spread in the pan. Sprinkle with the remaining 2 tbsp sugar.",
      "Bake until deeply golden and a tester comes out clean, 53–58 minutes. Cool slightly before serving.",
      "Fresh fruit also works. Cherries, mango, or peaches can replace the berries when cut into bite-size pieces.",
      "Keeps loosely wrapped at room temperature for about 4 days.",
    ],
    sourceUrl: "https://cooking.nytimes.com/recipes/1021092-berry-buttermilk-cake",
  },
  {
    id: "chewy-brownie-cookies",
    title: "Chewy Brownie Cookies",
    category: "Sweets",
    tags: ["Cookie", "Chocolate", "Brownie"],
    tone: "deep",
    mark: "18",
    vessel: "2 large sheet pans",
    yield: "18 cookies",
    yieldCount: { amount: 18, unit: "cookie", plural: "cookies" },
    heat: "350°F",
    time: "45 min",
    scale: {
      kind: "batch",
      label: "Batch size",
      base: { numerator: 1 },
      options: batchOptions,
    },
    ingredientGroups: [
      {
        title: "Chocolate base",
        items: [
          {
            name: "Semisweet or bittersweet chocolate, finely chopped",
            amount: { numerator: 113 },
            unit: "g",
          },
          {
            name: "Unsweetened cocoa powder",
            amount: { numerator: 42 },
            unit: "g",
          },
          { name: "Espresso powder", amount: { numerator: 1 }, unit: "tsp" },
          {
            name: "Unsalted butter",
            amount: { numerator: 113 },
            unit: "g",
          },
        ],
      },
      {
        title: "Batter + finish",
        items: [
          {
            name: "Large eggs, room temperature",
            amount: { numerator: 2 },
            unit: "eggs",
          },
          {
            name: "Granulated sugar",
            amount: { numerator: 150 },
            unit: "g",
          },
          {
            name: "Dark brown sugar, packed",
            amount: { numerator: 107 },
            unit: "g",
          },
          { name: "Kosher salt", amount: { numerator: 1 }, unit: "tsp" },
          { name: "Vanilla extract", amount: { numerator: 2 }, unit: "tsp" },
          {
            name: "All-purpose flour",
            amount: { numerator: 90 },
            unit: "g",
          },
          { name: "Flaky sea salt", note: "for finishing", scalable: false },
        ],
      },
    ],
    method: [
      "Heat the oven to 350°F. Line two large baking sheets with parchment.",
      "Combine the chopped chocolate, cocoa and espresso powder in a heatproof bowl. Melt the butter over medium-low heat until bubbly but not browned, about 3 minutes. Pour it over the chocolate without stirring and let it stand while you whip the eggs and sugars.",
      "Whisk the eggs, granulated sugar, brown sugar and kosher salt on medium-high until pillowy and the sugars have begun to dissolve, 3–5 minutes.",
      "Stir the chocolate mixture until glossy and smooth. If pieces remain, microwave in 10-second bursts until melted.",
      "With the mixer on low, add the vanilla and chocolate mixture. Scrape the bowl, add the flour and mix until only a few streaks remain. Finish folding by hand; the batter should be glossy and very thick.",
      "Working quickly, scoop heaping 2-tablespoon (1-ounce) mounds at least 2 inches apart on the prepared pans.",
      "Bake 8 minutes, until spreading and shiny. Remove the pans and firmly tap them on the counter a couple of times for cragged, fudgy cookies. Sprinkle with flaky salt and bake 2 minutes more, until shiny and slightly puffed. Cool briefly on the pans, then transfer to a rack.",
    ],
    notes: [
      "Do not shorten the 3–5 minute egg-and-sugar whip; it supplies the structure and shine without chemical leavening.",
      "Scoop promptly after mixing so the baked cookies retain their glossy tops.",
    ],
    sourceUrl: "https://cooking.nytimes.com/recipes/1025868-chewy-brownie-cookies",
  },
  {
    id: "butter-rice-cakes",
    title: "Butter Rice Cakes",
    category: "Sweets",
    tags: ["Shanghai butter mochi", "Butter tteok", "Gluten-free"],
    tone: "gold",
    mark: "12",
    vessel: "Standard 12-cup uncoated muffin tin",
    yield: "12 cakes",
    yieldCount: { amount: 12, unit: "cake", plural: "cakes" },
    heat: "400°F → 375°F · 205°C → 190°C",
    time: "1 hr 15 min",
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
            name: "Unsalted butter",
            amount: { numerator: 84 },
            unit: "g",
            note: "melted and cooled slightly",
          },
          {
            name: "Granulated sugar",
            amount: { numerator: 105 },
            unit: "g",
          },
          { name: "Vanilla extract", amount: { numerator: 2 }, unit: "tsp" },
          { name: "Honey", amount: { numerator: 1 }, unit: "tsp" },
          {
            name: "Fine sea salt",
            amount: { numerator: 1, denominator: 4 },
            unit: "tsp",
          },
          {
            name: "Large egg, room temperature",
            amount: { numerator: 1 },
            unit: "egg",
            note: "about 50g without shell",
          },
          { name: "Whole milk", amount: { numerator: 224 }, unit: "g" },
          {
            name: "Mochiko (sweet rice flour)",
            amount: { numerator: 270 },
            unit: "g",
          },
        ],
      },
      {
        title: "For the muffin tin",
        items: [
          {
            name: "Unsalted butter",
            amount: { numerator: 56 },
            unit: "g",
            note: "melted; coat every cup generously and evenly",
          },
        ],
      },
    ],
    method: [
      "Heat the oven to 400°F (205°C) with a rack in the middle.",
      "Melt all of the butter in a small saucepan over medium heat, stirring occasionally, 3–4 minutes. Pour the batter portion into a large bowl; whisk in the sugar, vanilla, honey and salt, then set aside to cool.",
      "Generously and evenly brush the remaining melted butter into all 12 cups of the muffin tin.",
      "Whisk the egg into the cooled sugar mixture just until blended, then whisk in the milk. Gradually add the mochiko while whisking and continue until smooth.",
      "Divide the batter evenly among the buttered cups—about 60g per cup—and smooth the tops if needed. Set the muffin tin on a sheet pan.",
      "Bake on the middle rack for 10 minutes. Lower the oven to 375°F (190°C) and bake until dark golden brown, 35–40 minutes more.",
      "Cool in the pan for a few minutes. Loosen each cake with a small offset spatula or very thin paring knife, transfer to a rack and serve warm.",
    ],
    notes: [
      "An uncoated muffin tin gives more even browning than a nonstick tin.",
      "The generous butter coating creates the crisp, deeply caramelized crust.",
      "Best eaten the day they are made; the crust softens overnight.",
      "Also known as Shanghai butter mochi, Shanghai butter rice cakes and butter tteok.",
    ],
    sourceUrl: "https://cooking.nytimes.com/recipes/780673425-butter-rice-cakes",
  },
  {
    id: "overnight-yeasted-waffles",
    title: "Overnight Yeasted Waffles",
    category: "Breakfast",
    tags: ["Egg", "Yeasted", "Overnight", "Waffle"],
    tone: "gold",
    mark: "2E",
    vessel: "F.S. Carbon Rugged I cast-iron waffle baker",
    yield: "About 6 round waffles",
    yieldCount: { amount: 6, unit: "round waffle", plural: "round waffles", approximate: true },
    heat: "Waffle iron · fully preheated",
    time: "15 min + 1–2 hr room-temp rise + 8–16 hr cold ferment",
    scale: {
      kind: "egg",
      label: "Whole eggs",
      base: { numerator: 2 },
      options: wholeEggOptions,
    },
    ingredientGroups: [
      {
        title: "Friday batter",
        items: [
          { name: "Large eggs", amount: { numerator: 2 }, unit: "eggs", note: "about 100g without shells" },
          { name: "All-purpose flour", amount: { numerator: 220 }, unit: "g" },
          { name: "Cornstarch", amount: { numerator: 20 }, unit: "g", note: "for a crisper shell" },
          { name: "Milk", amount: { numerator: 340 }, unit: "g", note: "whole or 2%" },
          { name: "Unsalted butter, melted", amount: { numerator: 85 }, unit: "g" },
          { name: "Granulated sugar", amount: { numerator: 15 }, unit: "g", note: "deliberately low-sugar" },
          { name: "Instant yeast", amount: { numerator: 2 }, unit: "g" },
          { name: "Fine salt", amount: { numerator: 4 }, unit: "g" },
          { name: "Vanilla extract", amount: { numerator: 5 }, unit: "g", note: "optional" },
        ],
      },
      {
        title: "Optional cornmeal variation",
        items: [
          { name: "Fine or medium cornmeal", amount: { numerator: 25 }, unit: "g", note: "replace 25g of the flour; not part of the base recipe" },
        ],
      },
    ],
    method: [
      "Friday afternoon, whisk the flour, cornstarch, sugar, yeast and salt in a large bowl. In another bowl whisk the milk, eggs, melted butter and optional vanilla, then whisk into the dry ingredients until smooth. A few tiny lumps are fine.",
      "Cover loosely and leave at room temperature for 1–2 hours, until the batter is visibly bubbly and has begun to expand. Do not wait for it to double.",
      "Stir gently to knock back the largest bubbles, cover well and refrigerate 8–16 hours. Use a bowl with plenty of headroom.",
      "Saturday morning, preheat the waffle iron thoroughly. Take the batter from the fridge while the iron heats; give it one gentle stir. Nothing needs to be added in the morning.",
      "Lightly grease the iron for the first waffle if needed. Add enough batter to cover the grid without flooding it, close and cook until deeply golden, crisp and steam has slowed. Start checking around 3–4 minutes, but learn the Rugged I rather than relying on the clock.",
      "Transfer each waffle directly to a wire rack. Serve immediately, or keep in a 200–250°F (95–120°C) oven on the rack while finishing the batch.",
    ],
    notes: [
      "Yield baseline: the 2-egg batch (about 100g egg) should make roughly 6 waffles in a round 7–8-inch iron like the F.S. Carbon Rugged I; expect about 5–7 depending on how full the grid is. The app's egg scale adjusts the full formula and estimated yield proportionally; the Yield above reflects your selected eggs.",
      "Low sugar is intentional: 15g is enough to support browning and fermentation without making the waffle itself sweet. Add sweetness at the table.",
      "Cornstarch replaces part of the flour to reduce gluten and encourage a thin, crisp shell while the yeasted interior stays tender.",
      "For a cornmeal version, replace 25g of the flour with 25g fine or medium cornmeal. Expect a slightly heartier crunch and corn flavour.",
      "The first batch is a calibration run for the vintage iron. Note the batter weight per waffle and cook time; those are more useful than a generic waffle-maker setting.",
    ],
  },
];

export const defaultBatchOptions = batchOptions;
