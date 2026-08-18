/**
 * categoryConfig.js — Admin edition
 *
 * Drives the "Apply Category Template" feature in the product form.
 * When an admin picks a category, they can one-click pre-fill:
 *   - attributes (for variable products)
 *   - custom fields
 *   - unit hints
 *
 * Add a new entry here to support any future category.
 */

export const CATEGORY_CONFIG = {

  // ── NUTS & DRY FRUITS ────────────────────────────────────────
  nuts: {
    label: 'Nuts & Dry Fruits',
    emoji: '🥜',
    description: 'Almonds, Cashews, Pistachios, Walnuts, Raisins, Dates, Seeds and more.',

    /** Suggested attributes for variable products */
    attributeTemplates: [
      { name: 'Weight',      values: ['50g', '100g', '250g', '500g', '1kg', '2kg', '5kg'], useForVariations: true },
      { name: 'Processing',  values: ['Raw', 'Roasted', 'Dry Roasted'],                    useForVariations: true },
      { name: 'Salted',      values: ['Salted', 'Unsalted'],                               useForVariations: false },
      { name: 'Flavour',     values: ['Plain', 'Masala', 'Pudina', 'Peri Peri'],           useForVariations: false },
      { name: 'Nut Type',    values: ['Almonds', 'Cashews', 'Pistachios', 'Walnuts', 'Peanuts', 'Raisins', 'Dates', 'Figs', 'Apricots'], useForVariations: false },
      { name: 'Grade',       values: ['Premium', 'Standard', 'Economy'],                   useForVariations: false },
      { name: 'Form',        values: ['Whole', 'Split', 'Halves', 'Pieces', 'Sliced'],     useForVariations: false },
      { name: 'Origin',      values: ['California', 'Iran', 'India', 'Chile', 'Turkey', 'Afghanistan'], useForVariations: false },
      { name: 'Organic',     values: ['Organic', 'Non-Organic'],                            useForVariations: false },
    ],

    /** Custom fields pre-filled on the Additional tab */
    customFieldTemplates: [
      { key: 'Calories',            value: '' },
      { key: 'Protein',             value: '' },
      { key: 'Fat',                 value: '' },
      { key: 'Carbohydrates',       value: '' },
      { key: 'Fiber',               value: '' },
      { key: 'Sugar',               value: '' },
      { key: 'Serving Size',        value: '30g' },
      { key: 'Ingredients',         value: '' },
      { key: 'Allergens',           value: '' },
      { key: 'Storage Instructions', value: 'Store in a cool, dry place away from direct sunlight.' },
      { key: 'Shelf Life',          value: '' },
      { key: 'Expiry Date',         value: '' },
      { key: 'Packaging Type',      value: '' },
      { key: 'Country of Origin',   value: '' },
    ],

    /** Unit hint shown in the form */
    units: ['g', 'kg', 'packet', 'box', 'piece'],

    /** Validation hints */
    validation: {
      requireWeight: true,
    },
  },

  // ── GROCERY ──────────────────────────────────────────────────
  grocery: {
    label: 'Grocery',
    emoji: '🛒',
    description: 'Rice, Wheat, Flour, Pulses, Oil, Spices, Snacks, Beverages and more.',

    attributeTemplates: [
      { name: 'Pack Size',  values: ['250g', '500g', '1kg', '2kg', '5kg', '10kg', '25kg', '500ml', '1L', '2L', '5L'], useForVariations: true },
      { name: 'Flavour',    values: ['Original', 'Spicy', 'Sweet', 'Sour', 'Masala'],                                useForVariations: true },
      { name: 'Variant',    values: ['Classic', 'Premium', 'Light', 'Zero Sugar'],                                   useForVariations: false },
      { name: 'Organic',    values: ['Organic', 'Non-Organic'],                                                       useForVariations: false },
      { name: 'Vegetarian', values: ['Vegetarian', 'Non-Vegetarian', 'Vegan'],                                       useForVariations: false },
    ],

    customFieldTemplates: [
      { key: 'Calories',            value: '' },
      { key: 'Protein',             value: '' },
      { key: 'Fat',                 value: '' },
      { key: 'Carbohydrates',       value: '' },
      { key: 'Fiber',               value: '' },
      { key: 'Sodium',              value: '' },
      { key: 'Serving Size',        value: '' },
      { key: 'Ingredients',         value: '' },
      { key: 'Allergens',           value: '' },
      { key: 'Vegetarian',          value: '' },
      { key: 'Organic',             value: '' },
      { key: 'Gluten Free',         value: '' },
      { key: 'Sugar Free',          value: '' },
      { key: 'Preservative Free',   value: '' },
      { key: 'Manufacturing Date',  value: '' },
      { key: 'Expiry Date',         value: '' },
      { key: 'Best Before',         value: '' },
      { key: 'Shelf Life',          value: '' },
      { key: 'Batch Number',        value: '' },
      { key: 'Storage Instructions', value: '' },
      { key: 'Preparation Instructions', value: '' },
    ],

    units: ['g', 'kg', 'ml', 'L', 'piece', 'packet', 'box', 'bottle', 'can', 'pouch', 'jar'],

    validation: {
      requireExpiry: false, // warn if not set, not hard error
    },
  },

  // ── PERFUMES ─────────────────────────────────────────────────
  perfumes: {
    label: 'Perfumes',
    emoji: '🌸',
    description: "Eau de Parfum, Eau de Toilette, Attar, Body Mist, Fragrance Sets.",

    attributeTemplates: [
      { name: 'Volume',          values: ['30ml', '50ml', '75ml', '100ml', '125ml', '150ml', '200ml'], useForVariations: true },
      { name: 'Gender',          values: ['Men', 'Women', 'Unisex'],                                   useForVariations: false },
      { name: 'Fragrance Type',  values: ['Eau de Parfum', 'Eau de Toilette', 'Eau de Cologne', 'Perfume Oil', 'Attar', 'Body Mist'], useForVariations: false },
      { name: 'Scent Family',    values: ['Floral', 'Woody', 'Citrus', 'Fresh', 'Oriental', 'Fruity', 'Aquatic', 'Spicy', 'Musky', 'Gourmand'], useForVariations: false },
      { name: 'Occasion',        values: ['Casual', 'Formal', 'Evening', 'Outdoor', 'Office'],         useForVariations: false },
      { name: 'Season',          values: ['Summer', 'Winter', 'Spring', 'Autumn', 'All Seasons'],       useForVariations: false },
    ],

    customFieldTemplates: [
      { key: 'Fragrance Name',      value: '' },
      { key: 'Top Notes',           value: '' },
      { key: 'Middle Notes',        value: '' },
      { key: 'Base Notes',          value: '' },
      { key: 'Longevity',           value: '' },
      { key: 'Sillage',             value: '' },
      { key: 'Concentration',       value: '' },
      { key: 'Alcohol Content',     value: '' },
      { key: 'Usage Instructions',  value: 'Apply on pulse points — wrists, neck and behind the ears.' },
      { key: 'Storage Instructions', value: 'Store in a cool, dry place away from direct sunlight and heat.' },
      { key: 'Country of Origin',   value: '' },
      { key: 'Manufacturer',        value: '' },
      { key: 'Importer',            value: '' },
      { key: 'Safety Information',  value: 'For external use only. Keep out of reach of children. Avoid contact with eyes.' },
    ],

    units: ['ml', 'oz'],

    validation: {
      requireVolume: true,
    },
  },

  // ── TOYS ─────────────────────────────────────────────────────
  toys: {
    label: 'Toys',
    emoji: '🧸',
    description: 'Educational Toys, RC Cars, Building Blocks, Dolls, Board Games, Puzzles and more.',

    attributeTemplates: [
      { name: 'Age Group',    values: ['0–3 Months', '3–6 Months', '6–12 Months', '1–2 Years', '2–3 Years', '3–5 Years', '5–8 Years', '8–12 Years', '12+ Years'], useForVariations: false },
      { name: 'Color',        values: ['Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Multi-Color', 'White', 'Black'], useForVariations: true },
      { name: 'Material',     values: ['Plastic', 'Wood', 'Fabric', 'Metal', 'Rubber', 'Foam'],                                       useForVariations: false },
      { name: 'Toy Type',     values: ['Educational', 'Remote Control', 'Building Blocks', 'Puzzles', 'Board Games', 'Dolls', 'Action Figures', 'Soft Toys', 'Outdoor', 'Electronic'], useForVariations: false },
      { name: 'Pack Size',    values: ['20 Pieces', '50 Pieces', '100 Pieces', '200 Pieces', 'Single'],                               useForVariations: true },
      { name: 'Battery Required', values: ['Yes', 'No'],                                                                              useForVariations: false },
    ],

    customFieldTemplates: [
      { key: 'Recommended Age',     value: '' },
      { key: 'Number of Pieces',    value: '' },
      { key: 'Number of Players',   value: '' },
      { key: 'Playing Time',        value: '' },
      { key: 'Battery Type',        value: '' },
      { key: 'Battery Included',    value: 'No' },
      { key: 'Assembly Required',   value: 'No' },
      { key: 'Assembly Time',       value: '' },
      { key: 'Educational Skills',  value: '' },
      { key: 'Indoor/Outdoor',      value: 'Indoor' },
      { key: 'Choking Hazard',      value: '' },
      { key: 'Safety Instructions', value: '' },
      { key: 'Non-Toxic',           value: 'Yes' },
      { key: 'Certifications',      value: '' },
      { key: 'Adult Supervision',   value: 'Not Required' },
      { key: 'Country of Origin',   value: '' },
      { key: 'Manufacturer',        value: '' },
    ],

    units: ['piece', 'set', 'pack'],

    validation: {
      requireAge: true,
    },
  },
};

/** Category slugs supported with specialized templates */
export const SPECIALIZED_CATEGORIES = Object.keys(CATEGORY_CONFIG);

/** All categories including generic ones (for dropdowns) */
export const ALL_CATEGORIES = [
  { value: 'nuts',         label: '🥜 Nuts & Dry Fruits' },
  { value: 'grocery',      label: '🛒 Grocery' },
  { value: 'perfumes',     label: '🌸 Perfumes' },
  { value: 'toys',         label: '🧸 Toys' },
  { value: 'foods',        label: '🍎 Foods' },
  { value: 'appliances',   label: '🏠 Home Appliances' },
  { value: 'supermarket',  label: '🛒 Supermarket' },
  { value: 'beauty',       label: '💄 Beauty' },
  { value: 'health',       label: '💊 Health' },
  { value: 'clothing',     label: '👗 Clothing' },
  { value: 'electronics',  label: '📱 Electronics' },
  { value: 'other',        label: '📦 Other' },
];

export function getCategoryConfig(slug) {
  return CATEGORY_CONFIG[slug?.toLowerCase()] || null;
}
