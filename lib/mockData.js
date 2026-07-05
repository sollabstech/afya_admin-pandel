export const STATS = {
  totalRevenue: 284750,
  revenueGrowth: 12.5,
  totalOrders: 1847,
  ordersToday: 23,
  totalCustomers: 642,
  newCustomersToday: 8,
  lowStockItems: 7,
  pendingOrders: 14,
};

export const REVENUE_DATA = [
  { date: 'Jun 28', revenue: 8200, orders: 18 },
  { date: 'Jun 29', revenue: 9800, orders: 22 },
  { date: 'Jun 30', revenue: 7600, orders: 15 },
  { date: 'Jul 1',  revenue: 12400, orders: 28 },
  { date: 'Jul 2',  revenue: 11200, orders: 24 },
  { date: 'Jul 3',  revenue: 15800, orders: 35 },
  { date: 'Jul 4',  revenue: 13600, orders: 29 },
  { date: 'Jul 5',  revenue: 9400,  orders: 21 },
];

export const MONTHLY_REVENUE = [
  { month: 'Feb', revenue: 58000 },
  { month: 'Mar', revenue: 72000 },
  { month: 'Apr', revenue: 65000 },
  { month: 'May', revenue: 89000 },
  { month: 'Jun', revenue: 96000 },
  { month: 'Jul', revenue: 45000 },
];

export const CATEGORY_SALES = [
  { name: 'Toys',        sales: 45200, orders: 124 },
  { name: 'Foods',       sales: 38600, orders: 289 },
  { name: 'Appliances',  sales: 98400, orders: 76  },
  { name: 'Supermarket', sales: 52300, orders: 342 },
];

export const ORDER_STATUS_DIST = [
  { name: 'Delivered',  value: 820, color: '#22C55E' },
  { name: 'Shipped',    value: 340, color: '#3B82F6' },
  { name: 'Confirmed',  value: 180, color: '#F59E0B' },
  { name: 'Pending',    value: 210, color: '#EF4444' },
  { name: 'Cancelled',  value: 97,  color: '#6B7280' },
];

export const ORDERS = [
  { id: 'ORD1001', customer: 'Ravi Kumar',    phone: '+91 98765 43210', items: 3, total: 1299,  status: 'delivered', date: '2026-07-05', payment: 'Online', city: 'Bangalore',  products: 'LEGO Bricks, UNO Cards, Dettol' },
  { id: 'ORD1002', customer: 'Priya Sharma',  phone: '+91 98765 43211', items: 1, total: 6999,  status: 'shipped',   date: '2026-07-05', payment: 'Online', city: 'Mumbai',     products: 'Philips Air Fryer 4.1L' },
  { id: 'ORD1003', customer: 'Mohammed Ali',  phone: '+91 98765 43212', items: 4, total: 876,   status: 'confirmed', date: '2026-07-05', payment: 'COD',    city: 'Chennai',    products: 'Amul Butter x2, Tata Salt x2' },
  { id: 'ORD1004', customer: 'Sunita Patel',  phone: '+91 98765 43213', items: 2, total: 4298,  status: 'pending',   date: '2026-07-04', payment: 'Online', city: 'Ahmedabad',  products: 'Bosch Mixer, Coconut Oil' },
  { id: 'ORD1005', customer: 'Arjun Singh',   phone: '+91 98765 43214', items: 1, total: 3499,  status: 'cancelled', date: '2026-07-04', payment: 'Online', city: 'Delhi',      products: 'Barbie Dreamhouse Playset' },
  { id: 'ORD1006', customer: 'Kavitha Nair',  phone: '+91 98765 43215', items: 5, total: 2340,  status: 'delivered', date: '2026-07-04', payment: 'COD',    city: 'Kochi',      products: 'Maggi x3, Britannia x2' },
  { id: 'ORD1007', customer: 'Rohan Gupta',   phone: '+91 98765 43216', items: 2, total: 8298,  status: 'shipped',   date: '2026-07-03', payment: 'Online', city: 'Pune',       products: 'Air Purifier, RC Truck' },
  { id: 'ORD1008', customer: 'Ananya Reddy',  phone: '+91 98765 43217', items: 3, total: 1547,  status: 'delivered', date: '2026-07-03', payment: 'Online', city: 'Hyderabad',  products: 'Nerf Blaster, Hot Wheels, UNO' },
  { id: 'ORD1009', customer: 'Vikram Mehta',  phone: '+91 98765 43218', items: 1, total: 1799,  status: 'confirmed', date: '2026-07-02', payment: 'COD',    city: 'Jaipur',     products: 'Prestige Pressure Cooker' },
  { id: 'ORD1010', customer: 'Deepika Iyer',  phone: '+91 98765 43219', items: 4, total: 3248,  status: 'pending',   date: '2026-07-02', payment: 'Online', city: 'Bangalore',  products: 'Electric Kettle, Honey, Quinoa, Butter' },
  { id: 'ORD1011', customer: 'Suresh Babu',   phone: '+91 98765 43220', items: 2, total: 588,   status: 'delivered', date: '2026-07-01', payment: 'COD',    city: 'Coimbatore', products: 'Tata Salt x2, Dettol x2' },
  { id: 'ORD1012', customer: 'Meena Pillai',  phone: '+91 98765 43221', items: 1, total: 1299,  status: 'shipped',   date: '2026-07-01', payment: 'Online', city: 'Trivandrum', products: 'LEGO Classic Bricks' },
];

export const PRODUCTS = [
  { id: 'p1',  name: 'LEGO Classic Creative Bricks',  category: 'Toys',        brand: 'LEGO',       price: 1299, mrp: 1799, stock: 45,  sku: 'LEG-001', gst: 12, status: 'active',        image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=80&q=80' },
  { id: 'p2',  name: 'Barbie Dreamhouse Playset',      category: 'Toys',        brand: 'Mattel',     price: 3499, mrp: 4999, stock: 8,   sku: 'MAT-001', gst: 12, status: 'active',        image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=80&q=80' },
  { id: 'p3',  name: 'Hot Wheels 20-Car Pack',         category: 'Toys',        brand: 'Hot Wheels', price: 699,  mrp: 999,  stock: 62,  sku: 'HW-001',  gst: 12, status: 'active',        image: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=80&q=80' },
  { id: 'p4',  name: 'Organic Basmati Rice 5kg',       category: 'Foods',       brand: 'Nature Fresh',price: 449, mrp: 549,  stock: 120, sku: 'NF-001',  gst: 5,  status: 'active',        image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=80&q=80' },
  { id: 'p5',  name: 'Cold Pressed Coconut Oil 500ml', category: 'Foods',       brand: 'KLF Nirmal', price: 299,  mrp: 399,  stock: 3,   sku: 'KLF-001', gst: 5,  status: 'active',        image: 'https://images.unsplash.com/photo-1612392062631-94dc86dc1d83?w=80&q=80' },
  { id: 'p6',  name: 'Bosch 1000W Mixer Grinder',      category: 'Appliances',  brand: 'Bosch',      price: 3999, mrp: 5499, stock: 15,  sku: 'BSH-001', gst: 18, status: 'active',        image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=80&q=80' },
  { id: 'p7',  name: 'Philips Air Fryer 4.1L',         category: 'Appliances',  brand: 'Philips',    price: 6999, mrp: 9999, stock: 0,   sku: 'PHI-001', gst: 18, status: 'out_of_stock',  image: 'https://images.unsplash.com/photo-1648370241843-3bf8b6e72c8d?w=80&q=80' },
  { id: 'p8',  name: 'Maggi 2-Min Noodles (Pack of 12)', category: 'Supermarket', brand: 'Nestle',   price: 188,  mrp: 216,  stock: 250, sku: 'NES-001', gst: 5,  status: 'active',        image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=80&q=80' },
  { id: 'p9',  name: 'Amul Butter 500g',               category: 'Supermarket', brand: 'Amul',       price: 249,  mrp: 270,  stock: 78,  sku: 'AML-001', gst: 12, status: 'active',        image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=80&q=80' },
  { id: 'p10', name: 'Surf Excel Matic 4kg',           category: 'Supermarket', brand: 'HUL',        price: 399,  mrp: 480,  stock: 5,   sku: 'HUL-001', gst: 18, status: 'active',        image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=80&q=80' },
  { id: 'p11', name: 'Nerf Elite 2.0 Blaster',         category: 'Toys',        brand: 'Nerf',       price: 1599, mrp: 2199, stock: 22,  sku: 'NRF-001', gst: 12, status: 'active',        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca9d13?w=80&q=80' },
  { id: 'p12', name: 'Tata Salt 1kg',                  category: 'Supermarket', brand: 'Tata',       price: 25,   mrp: 28,   stock: 400, sku: 'TAT-001', gst: 0,  status: 'active',        image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=80&q=80' },
  { id: 'p13', name: 'Prestige Pressure Cooker 5L',    category: 'Appliances',  brand: 'Prestige',   price: 1799, mrp: 2499, stock: 2,   sku: 'PRE-001', gst: 18, status: 'active',        image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=80&q=80' },
  { id: 'p14', name: 'UNO Card Game',                  category: 'Toys',        brand: 'Mattel',     price: 299,  mrp: 399,  stock: 88,  sku: 'MAT-002', gst: 12, status: 'active',        image: 'https://images.unsplash.com/photo-1611329695518-1763fc1e4d5b?w=80&q=80' },
  { id: 'p15', name: 'Britannia Bourbon Biscuits',     category: 'Foods',       brand: 'Britannia',  price: 84,   mrp: 96,   stock: 180, sku: 'BRT-001', gst: 5,  status: 'active',        image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=80&q=80' },
  { id: 'p16', name: 'Dettol Hand Wash 250ml',         category: 'Supermarket', brand: 'Dettol',     price: 89,   mrp: 110,  stock: 95,  sku: 'DTL-001', gst: 18, status: 'active',        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=80&q=80' },
  { id: 'p17', name: 'Smart Air Purifier 360°',        category: 'Appliances',  brand: 'Philips',    price: 8999, mrp:12999, stock: 6,   sku: 'PHI-002', gst: 18, status: 'active',        image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=80&q=80' },
  { id: 'p18', name: 'Organic Wild Honey 500g',        category: 'Foods',       brand: 'Dabur',      price: 349,  mrp: 449,  stock: 42,  sku: 'DAB-001', gst: 5,  status: 'active',        image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=80&q=80' },
];

export const CUSTOMERS = [
  { id: 'C001', name: 'Ravi Kumar',    phone: '+91 98765 43210', email: 'ravi@example.com',    city: 'Bangalore',  orders: 12, totalSpent: 15420, lastOrder: '2026-07-05', status: 'active',   loyaltyPoints: 240 },
  { id: 'C002', name: 'Priya Sharma', phone: '+91 98765 43211', email: 'priya@example.com',   city: 'Mumbai',     orders: 7,  totalSpent: 8930,  lastOrder: '2026-07-05', status: 'active',   loyaltyPoints: 180 },
  { id: 'C003', name: 'Mohammed Ali', phone: '+91 98765 43212', email: 'ali@example.com',     city: 'Chennai',    orders: 3,  totalSpent: 2340,  lastOrder: '2026-07-05', status: 'active',   loyaltyPoints: 47  },
  { id: 'C004', name: 'Sunita Patel', phone: '+91 98765 43213', email: 'sunita@example.com',  city: 'Ahmedabad',  orders: 18, totalSpent: 22100, lastOrder: '2026-07-04', status: 'active',   loyaltyPoints: 441 },
  { id: 'C005', name: 'Arjun Singh',  phone: '+91 98765 43214', email: 'arjun@example.com',   city: 'Delhi',      orders: 1,  totalSpent: 3499,  lastOrder: '2026-07-04', status: 'active',   loyaltyPoints: 0   },
  { id: 'C006', name: 'Kavitha Nair', phone: '+91 98765 43215', email: 'kavitha@example.com', city: 'Kochi',      orders: 9,  totalSpent: 11280, lastOrder: '2026-07-04', status: 'inactive', loyaltyPoints: 225 },
  { id: 'C007', name: 'Rohan Gupta',  phone: '+91 98765 43216', email: 'rohan@example.com',   city: 'Pune',       orders: 5,  totalSpent: 6750,  lastOrder: '2026-07-03', status: 'active',   loyaltyPoints: 135 },
  { id: 'C008', name: 'Ananya Reddy', phone: '+91 98765 43217', email: 'ananya@example.com',  city: 'Hyderabad',  orders: 14, totalSpent: 18900, lastOrder: '2026-07-03', status: 'active',   loyaltyPoints: 378 },
  { id: 'C009', name: 'Vikram Mehta', phone: '+91 98765 43218', email: 'vikram@example.com',  city: 'Jaipur',     orders: 2,  totalSpent: 3598,  lastOrder: '2026-07-02', status: 'active',   loyaltyPoints: 72  },
  { id: 'C010', name: 'Deepika Iyer', phone: '+91 98765 43219', email: 'deepika@example.com', city: 'Bangalore',  orders: 6,  totalSpent: 9240,  lastOrder: '2026-07-02', status: 'active',   loyaltyPoints: 185 },
];

export const COUPONS = [
  { code: 'AYFA10',   type: 'percent', discount: 10,  minOrder: 299,  used: 145, maxUses: 500, expiry: '2026-08-31', status: 'active'   },
  { code: 'FIRST50',  type: 'flat',    discount: 50,  minOrder: 499,  used: 89,  maxUses: 200, expiry: '2026-07-31', status: 'active'   },
  { code: 'SAVE100',  type: 'flat',    discount: 100, minOrder: 999,  used: 34,  maxUses: 100, expiry: '2026-07-31', status: 'active'   },
  { code: 'SUMMER25', type: 'percent', discount: 25,  minOrder: 599,  used: 0,   maxUses: 300, expiry: '2026-07-31', status: 'inactive' },
  { code: 'TOYS20',   type: 'percent', discount: 20,  minOrder: 999,  used: 12,  maxUses: 150, expiry: '2026-08-15', status: 'active'   },
];

export const BANNERS = [
  { id: 1, title: 'Summer Sale',      subtitle: 'Up to 40% off on groceries',  position: 'hero',  image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80', link: '/categories?cat=foods',       status: 'active',   startDate: '2026-07-01', endDate: '2026-07-31' },
  { id: 2, title: 'Toy Fest',         subtitle: 'Best toys for your kids',      position: 'hero',  image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&q=80', link: '/categories?cat=toys',        status: 'active',   startDate: '2026-07-01', endDate: '2026-07-31' },
  { id: 3, title: 'Appliance Deals',  subtitle: 'Save big on home appliances',  position: 'promo', image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&q=80', link: '/categories?cat=appliances',  status: 'inactive', startDate: '2026-07-10', endDate: '2026-07-20' },
  { id: 4, title: 'Grocery Fresh',    subtitle: 'Fresh & organic every day',    position: 'promo', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&q=80', link: '/categories?cat=supermarket', status: 'active',   startDate: '2026-07-01', endDate: '2026-08-31' },
];

export const RETURNS = [
  { id: 'RET001', orderId: 'ORD998', customer: 'Ramesh Babu',   product: 'Philips Air Fryer',    reason: 'Defective product',  amount: 6999, status: 'pending',  date: '2026-07-04', images: 1 },
  { id: 'RET002', orderId: 'ORD987', customer: 'Lakshmi Devi',  product: 'Bosch Mixer Grinder',  reason: 'Wrong product sent', amount: 3999, status: 'approved', date: '2026-07-03', images: 2 },
  { id: 'RET003', orderId: 'ORD976', customer: 'Suresh Kumar',  product: 'LEGO Classic Bricks',  reason: 'Not as described',   amount: 1299, status: 'refunded', date: '2026-07-01', images: 0 },
  { id: 'RET004', orderId: 'ORD965', customer: 'Meera Thomas',  product: 'Amul Butter 500g',     reason: 'Expired product',    amount: 249,  status: 'pending',  date: '2026-06-30', images: 1 },
];

export const STAFF = [
  { id: 1, name: 'Sridhar Rao',   email: 'owner@afya.in',    role: 'Owner',        phone: '+91 98765 00001', status: 'active',   lastLogin: '2026-07-05 18:00', permissions: 'all' },
  { id: 2, name: 'Admin User',    email: 'admin@afya.in',    role: 'App Admin',    phone: '+91 98765 00002', status: 'active',   lastLogin: '2026-07-05 17:45', permissions: 'all' },
  { id: 3, name: 'Kavya M',       email: 'products@afya.in', role: 'Product Staff',phone: '+91 98765 00003', status: 'active',   lastLogin: '2026-07-05 14:30', permissions: 'catalog' },
  { id: 4, name: 'Sunil P',       email: 'orders@afya.in',   role: 'Order Staff',  phone: '+91 98765 00004', status: 'active',   lastLogin: '2026-07-05 16:00', permissions: 'orders' },
  { id: 5, name: 'Anjali K',      email: 'marketing@afya.in',role: 'Marketing',    phone: '+91 98765 00005', status: 'active',   lastLogin: '2026-07-04 10:00', permissions: 'marketing' },
  { id: 6, name: 'Accounts Team', email: 'accounts@afya.in', role: 'Accounts',     phone: '+91 98765 00006', status: 'inactive', lastLogin: '2026-07-01 09:00', permissions: 'reports' },
];

export const AUDIT_LOGS = [
  { id: 1, user: 'Admin',     action: 'Updated product price',     module: 'Products',  details: 'LEGO Classic: ₹1199 → ₹1299',                 timestamp: '2026-07-05 18:42', ip: '192.168.1.1' },
  { id: 2, user: 'Sunil P',   action: 'Changed order status',      module: 'Orders',    details: 'ORD1002: confirmed → shipped',                  timestamp: '2026-07-05 17:30', ip: '192.168.1.2' },
  { id: 3, user: 'Admin',     action: 'Added new coupon',          module: 'Offers',    details: 'Created coupon: SUMMER25 (25% off)',            timestamp: '2026-07-05 16:00', ip: '192.168.1.1' },
  { id: 4, user: 'Kavya M',   action: 'Updated stock',             module: 'Inventory', details: 'Philips Air Fryer: 5 → 0 (out of stock)',       timestamp: '2026-07-05 14:20', ip: '192.168.1.3' },
  { id: 5, user: 'Admin',     action: 'Approved refund',           module: 'Returns',   details: 'RET002: ₹3,999 refund approved',                timestamp: '2026-07-05 12:00', ip: '192.168.1.1' },
  { id: 6, user: 'Anjali K',  action: 'Sent push notification',    module: 'Marketing', details: 'Flash Sale campaign sent to 642 users',         timestamp: '2026-07-04 10:00', ip: '192.168.1.4' },
  { id: 7, user: 'Admin',     action: 'Added new banner',          module: 'Banners',   details: 'Grocery Fresh banner created',                  timestamp: '2026-07-03 15:00', ip: '192.168.1.1' },
  { id: 8, user: 'Sunil P',   action: 'Generated packing slip',    module: 'Orders',    details: 'Packing slip for ORD1001 generated',            timestamp: '2026-07-03 11:00', ip: '192.168.1.2' },
  { id: 9, user: 'Admin',     action: 'Updated loyalty rules',     module: 'Loyalty',   details: 'Points ratio updated: ₹10 = 1 point',           timestamp: '2026-07-02 09:30', ip: '192.168.1.1' },
  { id: 10, user: 'Kavya M',  action: 'Added new product',         module: 'Products',  details: 'Product "Smart Air Purifier 360°" added',       timestamp: '2026-07-01 14:00', ip: '192.168.1.3' },
];

export const CATEGORIES = [
  { id: 'cat1', name: 'Toys',         slug: 'toys',        parent: null,   products: 42, status: 'active',   subcategories: ['Action Figures', 'Board Games', 'Building Blocks', 'RC Toys'] },
  { id: 'cat2', name: 'Foods',        slug: 'foods',       parent: null,   products: 38, status: 'active',   subcategories: ['Breakfast', 'Snacks', 'Oils & Spices', 'Dairy'] },
  { id: 'cat3', name: 'Appliances',   slug: 'appliances',  parent: null,   products: 25, status: 'active',   subcategories: ['Kitchen', 'Air Treatment', 'Cooking', 'Grooming'] },
  { id: 'cat4', name: 'Supermarket',  slug: 'supermarket', parent: null,   products: 67, status: 'active',   subcategories: ['Cleaning', 'Personal Care', 'Packaged Foods', 'Beverages'] },
  { id: 'cat5', name: 'Beverages',    slug: 'beverages',   parent: 'cat4', products: 12, status: 'active',   subcategories: [] },
  { id: 'cat6', name: 'Baby Products',slug: 'baby',        parent: null,   products: 8,  status: 'inactive', subcategories: [] },
];

export const BRANDS = [
  { id: 'b1',  name: 'LEGO',       category: 'Toys',        products: 8,  status: 'active', website: 'https://lego.com' },
  { id: 'b2',  name: 'Mattel',     category: 'Toys',        products: 12, status: 'active', website: 'https://mattel.com' },
  { id: 'b3',  name: 'Philips',    category: 'Appliances',  products: 7,  status: 'active', website: 'https://philips.com' },
  { id: 'b4',  name: 'Bosch',      category: 'Appliances',  products: 5,  status: 'active', website: 'https://bosch.com' },
  { id: 'b5',  name: 'Nestle',     category: 'Foods',       products: 9,  status: 'active', website: 'https://nestle.com' },
  { id: 'b6',  name: 'Amul',       category: 'Supermarket', products: 6,  status: 'active', website: 'https://amul.com' },
  { id: 'b7',  name: 'Dettol',     category: 'Supermarket', products: 4,  status: 'active', website: 'https://dettol.com' },
  { id: 'b8',  name: 'Britannia',  category: 'Foods',       products: 8,  status: 'active', website: 'https://britannia.com' },
];

export const CAMPAIGNS = [
  { id: 1, name: 'Flash Sale Alert',      type: 'push',      audience: 'All Users',    sent: 642, opened: 289, status: 'sent',     date: '2026-07-04' },
  { id: 2, name: 'Welcome New User',      type: 'whatsapp',  audience: 'New Users',    sent: 23,  opened: 21,  status: 'sent',     date: '2026-07-05' },
  { id: 3, name: 'July Weekend Deals',    type: 'email',     audience: 'All Users',    sent: 0,   opened: 0,   status: 'draft',    date: '2026-07-06' },
  { id: 4, name: 'Abandoned Cart Nudge', type: 'whatsapp',  audience: 'Cart Dropoffs', sent: 0,   opened: 0,   status: 'scheduled',date: '2026-07-06' },
];
