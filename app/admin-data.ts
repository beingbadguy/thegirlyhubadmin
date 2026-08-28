import { format, isValid, parseISO } from "date-fns";

export type Product = {
  id: string;
  title: string;
  category: string;
  originalPrice: number;
  price: number;
  stock: number;
  active: boolean;
  image: string;
};

export type Category = {
  id: string;
  name: string;
  image: string;
  productCount: number;
};

export type Order = {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: number;
  payment: string;
  delivery: string;
};

export type OrderStatus =
  | "processing"
  | "reviewing"
  | "preparing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled";

export type Coupon = {
  id: string;
  name: string;
  code: string;
  discount: number;
  active: boolean;
  created: string;
};

export type Subscriber = { id: string; email: string; date: string };

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  unread: boolean;
};

export type UserCartItem = {
  productId: string;
  title: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  category: string;
  inStock: boolean;
  selectedColor?: string;
  selectedSize?: string;
  addedAt: string;
};

export type UserWishlistItem = {
  productId: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  inStock: boolean;
  addedAt: string;
};

export type UserAddress = {
  id: string;
  type: "shipping" | "billing";
  isDefault: boolean;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark?: string;
};

export type UserActivityLog = {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  device?: string;
};

export type CustomerRecord = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarColor?: string;
  verified: boolean;
  isVerified?: boolean;
  role: "customer" | "admin" | "vip";
  status: "active" | "inactive" | "suspended" | "pending";
  totalSpent: number;
  orderCount: number;
  cartCount: number;
  wishlistCount: number;
  avgOrderValue: number;
  lastActive: string;
  createdAt: string;
  gender?: string;
  birthday?: string;
  tags?: string[];
  addresses: UserAddress[];
  cart: UserCartItem[];
  wishlist: UserWishlistItem[];
  orders: Order[];
  notes: string[];
  activityLogs: UserActivityLog[];
};

export const products: Product[] = [
  {
    id: "p1",
    title: "Cloud Knit Co-Ord",
    category: "Loungewear",
    originalPrice: 68,
    price: 49,
    stock: 32,
    active: true,
    image: "#f4c9c2",
  },
  {
    id: "p2",
    title: "Cherry Cola Mini Dress",
    category: "Dresses",
    originalPrice: 82,
    price: 62,
    stock: 8,
    active: true,
    image: "#d63c56",
  },
  {
    id: "p3",
    title: "Satin Bow Ballet Flats",
    category: "Shoes",
    originalPrice: 54,
    price: 38,
    stock: 24,
    active: true,
    image: "#d8bfd0",
  },
  {
    id: "p4",
    title: "Ribbed Baby Tee",
    category: "Tops",
    originalPrice: 34,
    price: 26,
    stock: 5,
    active: false,
    image: "#d6e2d1",
  },
  {
    id: "p5",
    title: "Sunday Market Tote",
    category: "Accessories",
    originalPrice: 42,
    price: 30,
    stock: 41,
    active: true,
    image: "#e3d3a6",
  },
  {
    id: "p6",
    title: "Lace Trim Cami",
    category: "Tops",
    originalPrice: 39,
    price: 29,
    stock: 17,
    active: true,
    image: "#e5b7b4",
  },
];

export const categories: Category[] = [
  { id: "c1", name: "New in", image: "#e9b7ad", productCount: 18 },
  { id: "c2", name: "Dresses", image: "#c8d8ca", productCount: 24 },
  { id: "c3", name: "Tops", image: "#ead4a7", productCount: 31 },
  { id: "c4", name: "Accessories", image: "#d7bfd3", productCount: 16 },
  { id: "c5", name: "Loungewear", image: "#d6c4bd", productCount: 12 },
];

export const orders: Order[] = [
  {
    id: "GH-10482",
    customer: "Maya Johnson",
    email: "maya.johnson@email.com",
    date: "Aug 26, 2026",
    total: 138,
    status: "preparing",
    items: 3,
    payment: "Visa · 4821",
    delivery: "Standard",
  },
  {
    id: "GH-10481",
    customer: "Amelia Stone",
    email: "amelia.stone@email.com",
    date: "Aug 26, 2026",
    total: 62,
    status: "shipped",
    items: 1,
    payment: "PayPal",
    delivery: "Express",
  },
  {
    id: "GH-10480",
    customer: "Sofia Williams",
    email: "sofia.w@email.com",
    date: "Aug 25, 2026",
    total: 217,
    status: "completed",
    items: 4,
    payment: "Visa · 1093",
    delivery: "Standard",
  },
  {
    id: "GH-10479",
    customer: "Chloe Martin",
    email: "chloe.martin@email.com",
    date: "Aug 25, 2026",
    total: 89,
    status: "processing",
    items: 2,
    payment: "Mastercard · 7612",
    delivery: "Standard",
  },
  {
    id: "GH-10478",
    customer: "Isla Brown",
    email: "isla.brown@email.com",
    date: "Aug 24, 2026",
    total: 154,
    status: "delivered",
    items: 3,
    payment: "Apple Pay",
    delivery: "Express",
  },
];

export const subscribers: Subscriber[] = [
  { id: "s1", email: "jasmine.lee@email.com", date: "Aug 26, 2026" },
  { id: "s2", email: "olivia.parker@email.com", date: "Aug 24, 2026" },
  { id: "s3", email: "ella.thomas@email.com", date: "Aug 21, 2026" },
];

export const enquiries: Enquiry[] = [
  {
    id: "e1",
    name: "Nora Bell",
    email: "nora.bell@email.com",
    message:
      "Hi, I was wondering if the Cherry Cola Mini Dress will be restocked in a size 8? I love the fit of your last collection.",
    date: "Aug 26, 2026",
    unread: true,
  },
  {
    id: "e2",
    name: "Ruby Adams",
    email: "ruby.adams@email.com",
    message:
      "My order arrived today and one of the items is missing from the parcel. Could you help me with this?",
    date: "Aug 25, 2026",
    unread: true,
  },
  {
    id: "e3",
    name: "Grace King",
    email: "grace.king@email.com",
    message: "Do you ship internationally to Canada?",
    date: "Aug 22, 2026",
    unread: false,
  },
];

export const coupons: Coupon[] = [
  {
    id: "cp1",
    name: "Welcome gift",
    code: "WELCOME10",
    discount: 10,
    active: true,
    created: "Aug 01, 2026",
  },
  {
    id: "cp2",
    name: "Summer edit",
    code: "SUMMER15",
    discount: 15,
    active: false,
    created: "Jul 18, 2026",
  },
];

export const customersRegistry: CustomerRecord[] = [
  {
    id: "usr_101",
    name: "Maya Johnson",
    email: "maya.johnson@email.com",
    phone: "+91 98201 45892",
    avatarColor: "#f3cfdb",
    verified: true,
    isVerified: true,
    role: "vip",
    status: "active",
    totalSpent: 482,
    orderCount: 3,
    cartCount: 2,
    wishlistCount: 3,
    avgOrderValue: 160.67,
    createdAt: "2026-03-14T10:20:00Z",
    lastActive: "2026-08-27T14:45:00Z",
    gender: "Female",
    birthday: "1997-04-18",
    tags: ["VIP Gold", "High LTV", "Frequent Shopper", "Mumbai Resident"],
    addresses: [
      {
        id: "addr_1",
        type: "shipping",
        isDefault: true,
        name: "Maya Johnson",
        phone: "+91 98201 45892",
        street: "Flat 402, Sea Breeze Apts, Perry Cross Road, Bandra West",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400050",
        country: "India",
        landmark: "Opposite St. Andrew's Church",
      },
      {
        id: "addr_2",
        type: "billing",
        isDefault: false,
        name: "Maya Johnson",
        phone: "+91 98201 45892",
        street: "Floor 2, Indiranagar 100ft Road",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560038",
        country: "India",
      },
    ],
    cart: [
      {
        productId: "p1",
        title: "Cloud Knit Co-Ord",
        price: 49,
        originalPrice: 68,
        quantity: 1,
        image: "#f4c9c2",
        category: "Loungewear",
        inStock: true,
        selectedSize: "S",
        selectedColor: "Blush Rose",
        addedAt: "2026-08-27T12:30:00Z",
      },
      {
        productId: "p3",
        title: "Satin Bow Ballet Flats",
        price: 38,
        originalPrice: 54,
        quantity: 1,
        image: "#d8bfd0",
        category: "Shoes",
        inStock: true,
        selectedSize: "38 EU",
        selectedColor: "Lavender Mist",
        addedAt: "2026-08-27T13:15:00Z",
      },
    ],
    wishlist: [
      {
        productId: "p2",
        title: "Cherry Cola Mini Dress",
        price: 62,
        originalPrice: 82,
        image: "#d63c56",
        category: "Dresses",
        inStock: true,
        addedAt: "2026-08-20T09:12:00Z",
      },
      {
        productId: "p5",
        title: "Sunday Market Tote",
        price: 30,
        originalPrice: 42,
        image: "#e3d3a6",
        category: "Accessories",
        inStock: true,
        addedAt: "2026-08-22T16:05:00Z",
      },
      {
        productId: "p6",
        title: "Lace Trim Cami",
        price: 29,
        originalPrice: 39,
        image: "#e5b7b4",
        category: "Tops",
        inStock: true,
        addedAt: "2026-08-25T11:40:00Z",
      },
    ],
    orders: [
      {
        id: "GH-10482",
        customer: "Maya Johnson",
        email: "maya.johnson@email.com",
        date: "Aug 26, 2026",
        total: 138,
        status: "preparing",
        items: 3,
        payment: "Visa · 4821",
        delivery: "Standard",
      },
      {
        id: "GH-10394",
        customer: "Maya Johnson",
        email: "maya.johnson@email.com",
        date: "Jul 15, 2026",
        total: 184,
        status: "delivered",
        items: 4,
        payment: "Visa · 4821",
        delivery: "Express",
      },
      {
        id: "GH-10210",
        customer: "Maya Johnson",
        email: "maya.johnson@email.com",
        date: "May 02, 2026",
        total: 160,
        status: "completed",
        items: 2,
        payment: "Apple Pay",
        delivery: "Standard",
      },
    ],
    notes: [
      "Prefers luxury eco-friendly packaging with custom pink ribbon.",
      "VIP customer - eligible for complimentary express delivery on orders over ₹100.",
      "Customer requested restocking alert for Cherry Cola Mini Dress in Size 8.",
    ],
    activityLogs: [
      {
        id: "act_101",
        action: "Cart Update",
        description: "Added Satin Bow Ballet Flats (Size 38) to shopping cart.",
        timestamp: "2026-08-27T13:15:00Z",
        device: "Safari on iPhone 15 Pro",
        ipAddress: "152.58.24.112",
      },
      {
        id: "act_102",
        action: "Cart Update",
        description: "Added Cloud Knit Co-Ord (Size S) to shopping cart.",
        timestamp: "2026-08-27T12:30:00Z",
        device: "Safari on iPhone 15 Pro",
        ipAddress: "152.58.24.112",
      },
      {
        id: "act_103",
        action: "Order Placed",
        description: "Placed order #GH-10482 for ₹138.00 with Visa · 4821.",
        timestamp: "2026-08-26T18:40:00Z",
        device: "Chrome on macOS Sonoma",
        ipAddress: "152.58.24.112",
      },
      {
        id: "act_104",
        action: "Wishlist Added",
        description: "Saved Lace Trim Cami to personal wishlist.",
        timestamp: "2026-08-25T11:40:00Z",
        device: "Safari on iPhone 15 Pro",
        ipAddress: "152.58.24.112",
      },
      {
        id: "act_105",
        action: "Login",
        description: "Successful biometric login into GirlyHub account.",
        timestamp: "2026-08-25T11:35:00Z",
        device: "Safari on iPhone 15 Pro",
        ipAddress: "152.58.24.112",
      },
    ],
  },
  {
    id: "usr_102",
    name: "Amelia Stone",
    email: "amelia.stone@email.com",
    phone: "+91 97114 83920",
    avatarColor: "#e4d3f5",
    verified: true,
    isVerified: true,
    role: "vip",
    status: "active",
    totalSpent: 624,
    orderCount: 5,
    cartCount: 1,
    wishlistCount: 2,
    avgOrderValue: 124.8,
    createdAt: "2026-01-10T14:10:00Z",
    lastActive: "2026-08-27T11:20:00Z",
    gender: "Female",
    birthday: "1995-11-29",
    tags: ["VIP Platinum", "Fashion Influencer", "Express Delivery Fan"],
    addresses: [
      {
        id: "addr_3",
        type: "shipping",
        isDefault: true,
        name: "Amelia Stone",
        phone: "+91 97114 83920",
        street: "Apartment 12B, Regency Tower, Colaba",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400005",
        country: "India",
        landmark: "Near Gateway of India",
      },
    ],
    cart: [
      {
        productId: "p2",
        title: "Cherry Cola Mini Dress",
        price: 62,
        originalPrice: 82,
        quantity: 1,
        image: "#d63c56",
        category: "Dresses",
        inStock: true,
        selectedSize: "M",
        selectedColor: "Cherry Red",
        addedAt: "2026-08-27T10:45:00Z",
      },
    ],
    wishlist: [
      {
        productId: "p1",
        title: "Cloud Knit Co-Ord",
        price: 49,
        originalPrice: 68,
        image: "#f4c9c2",
        category: "Loungewear",
        inStock: true,
        addedAt: "2026-08-18T14:20:00Z",
      },
      {
        productId: "p3",
        title: "Satin Bow Ballet Flats",
        price: 38,
        originalPrice: 54,
        image: "#d8bfd0",
        category: "Shoes",
        inStock: true,
        addedAt: "2026-08-19T17:10:00Z",
      },
    ],
    orders: [
      {
        id: "GH-10481",
        customer: "Amelia Stone",
        email: "amelia.stone@email.com",
        date: "Aug 26, 2026",
        total: 62,
        status: "shipped",
        items: 1,
        payment: "PayPal",
        delivery: "Express",
      },
      {
        id: "GH-10355",
        customer: "Amelia Stone",
        email: "amelia.stone@email.com",
        date: "Jun 30, 2026",
        total: 240,
        status: "delivered",
        items: 5,
        payment: "PayPal",
        delivery: "Express",
      },
    ],
    notes: ["Regular influencer collaborator. Sends UGC unboxing tags on IG."],
    activityLogs: [
      {
        id: "act_106",
        action: "Cart Update",
        description: "Added Cherry Cola Mini Dress to cart.",
        timestamp: "2026-08-27T10:45:00Z",
        device: "Chrome on macOS",
        ipAddress: "49.207.218.4",
      },
      {
        id: "act_107",
        action: "Order Shipped",
        description: "Order #GH-10481 dispatch scanned with BlueDart tracking #BD98214.",
        timestamp: "2026-08-26T20:10:00Z",
        device: "Admin Automated Hook",
        ipAddress: "127.0.0.1",
      },
    ],
  },
  {
    id: "usr_103",
    name: "Sofia Williams",
    email: "sofia.w@email.com",
    phone: "+91 94002 91048",
    avatarColor: "#d2eedc",
    verified: true,
    isVerified: true,
    role: "customer",
    status: "active",
    totalSpent: 355,
    orderCount: 2,
    cartCount: 3,
    wishlistCount: 1,
    avgOrderValue: 177.5,
    createdAt: "2026-04-20T08:30:00Z",
    lastActive: "2026-08-27T09:15:00Z",
    gender: "Female",
    birthday: "2000-08-12",
    tags: ["Gen Z Shopper", "Summer Drop Enthusiast"],
    addresses: [
      {
        id: "addr_4",
        type: "shipping",
        isDefault: true,
        name: "Sofia Williams",
        phone: "+91 94002 91048",
        street: "B-201, Green Valley Residency, Koregaon Park",
        city: "Pune",
        state: "Maharashtra",
        postalCode: "411001",
        country: "India",
      },
    ],
    cart: [
      {
        productId: "p4",
        title: "Ribbed Baby Tee",
        price: 26,
        originalPrice: 34,
        quantity: 2,
        image: "#d6e2d1",
        category: "Tops",
        inStock: true,
        selectedSize: "XS",
        selectedColor: "Sage Green",
        addedAt: "2026-08-27T09:10:00Z",
      },
      {
        productId: "p5",
        title: "Sunday Market Tote",
        price: 30,
        originalPrice: 42,
        quantity: 1,
        image: "#e3d3a6",
        category: "Accessories",
        inStock: true,
        selectedSize: "One Size",
        selectedColor: "Butter Oatmeal",
        addedAt: "2026-08-27T09:12:00Z",
      },
      {
        productId: "p1",
        title: "Cloud Knit Co-Ord",
        price: 49,
        originalPrice: 68,
        quantity: 1,
        image: "#f4c9c2",
        category: "Loungewear",
        inStock: true,
        selectedSize: "M",
        selectedColor: "Blush Rose",
        addedAt: "2026-08-27T09:14:00Z",
      },
    ],
    wishlist: [
      {
        productId: "p2",
        title: "Cherry Cola Mini Dress",
        price: 62,
        originalPrice: 82,
        image: "#d63c56",
        category: "Dresses",
        inStock: true,
        addedAt: "2026-08-25T14:10:00Z",
      },
    ],
    orders: [
      {
        id: "GH-10480",
        customer: "Sofia Williams",
        email: "sofia.w@email.com",
        date: "Aug 25, 2026",
        total: 217,
        status: "completed",
        items: 4,
        payment: "Visa · 1093",
        delivery: "Standard",
      },
      {
        id: "GH-10190",
        customer: "Sofia Williams",
        email: "sofia.w@email.com",
        date: "Apr 28, 2026",
        total: 138,
        status: "completed",
        items: 2,
        payment: "Visa · 1093",
        delivery: "Standard",
      },
    ],
    notes: ["High cart value sitting pending checkout - candidate for 10% abandoned cart discount."],
    activityLogs: [
      {
        id: "act_108",
        action: "Cart Update",
        description: "Added 3 items (₹131 total) to shopping cart.",
        timestamp: "2026-08-27T09:14:00Z",
        device: "Safari on iPad Pro",
        ipAddress: "103.21.144.18",
      },
    ],
  },
  {
    id: "usr_104",
    name: "Chloe Martin",
    email: "chloe.martin@email.com",
    phone: "+91 98450 12894",
    avatarColor: "#fee5cb",
    verified: true,
    isVerified: true,
    role: "customer",
    status: "active",
    totalSpent: 420,
    orderCount: 4,
    cartCount: 0,
    wishlistCount: 4,
    avgOrderValue: 105.0,
    createdAt: "2026-02-18T16:40:00Z",
    lastActive: "2026-08-26T18:10:00Z",
    gender: "Female",
    birthday: "1998-06-05",
    tags: ["Loyal Customer", "Delhi Shopper"],
    addresses: [
      {
        id: "addr_5",
        type: "shipping",
        isDefault: true,
        name: "Chloe Martin",
        phone: "+91 98450 12894",
        street: "C-14, Vasant Vihar",
        city: "New Delhi",
        state: "Delhi",
        postalCode: "110057",
        country: "India",
      },
    ],
    cart: [],
    wishlist: [
      {
        productId: "p1",
        title: "Cloud Knit Co-Ord",
        price: 49,
        originalPrice: 68,
        image: "#f4c9c2",
        category: "Loungewear",
        inStock: true,
        addedAt: "2026-08-25T18:00:00Z",
      },
      {
        productId: "p2",
        title: "Cherry Cola Mini Dress",
        price: 62,
        originalPrice: 82,
        image: "#d63c56",
        category: "Dresses",
        inStock: true,
        addedAt: "2026-08-25T18:02:00Z",
      },
      {
        productId: "p3",
        title: "Satin Bow Ballet Flats",
        price: 38,
        originalPrice: 54,
        image: "#d8bfd0",
        category: "Shoes",
        inStock: true,
        addedAt: "2026-08-25T18:05:00Z",
      },
      {
        productId: "p6",
        title: "Lace Trim Cami",
        price: 29,
        originalPrice: 39,
        image: "#e5b7b4",
        category: "Tops",
        inStock: true,
        addedAt: "2026-08-25T18:07:00Z",
      },
    ],
    orders: [
      {
        id: "GH-10479",
        customer: "Chloe Martin",
        email: "chloe.martin@email.com",
        date: "Aug 25, 2026",
        total: 89,
        status: "processing",
        items: 2,
        payment: "Mastercard · 7612",
        delivery: "Standard",
      },
    ],
    notes: [],
    activityLogs: [
      {
        id: "act_109",
        action: "Order Placed",
        description: "Placed order #GH-10479 for ₹89.00.",
        timestamp: "2026-08-25T17:30:00Z",
        device: "Chrome on Windows 11",
        ipAddress: "115.110.23.90",
      },
    ],
  },
  {
    id: "usr_105",
    name: "Isla Brown",
    email: "isla.brown@email.com",
    phone: "+91 99800 76543",
    avatarColor: "#e5e8fa",
    verified: true,
    isVerified: true,
    role: "vip",
    status: "active",
    totalSpent: 890,
    orderCount: 6,
    cartCount: 1,
    wishlistCount: 2,
    avgOrderValue: 148.33,
    createdAt: "2025-11-04T12:00:00Z",
    lastActive: "2026-08-27T08:00:00Z",
    gender: "Female",
    birthday: "1994-02-14",
    tags: ["VIP Platinum", "Early Adopter", "Top Reviewer"],
    addresses: [
      {
        id: "addr_6",
        type: "shipping",
        isDefault: true,
        name: "Isla Brown",
        phone: "+91 99800 76543",
        street: "Penthouse 18, Horizon Tower, Jubilee Hills",
        city: "Hyderabad",
        state: "Telangana",
        postalCode: "500033",
        country: "India",
      },
    ],
    cart: [
      {
        productId: "p6",
        title: "Lace Trim Cami",
        price: 29,
        originalPrice: 39,
        quantity: 1,
        image: "#e5b7b4",
        category: "Tops",
        inStock: true,
        selectedSize: "M",
        selectedColor: "Dusty Pink",
        addedAt: "2026-08-27T07:55:00Z",
      },
    ],
    wishlist: [
      {
        productId: "p5",
        title: "Sunday Market Tote",
        price: 30,
        originalPrice: 42,
        image: "#e3d3a6",
        category: "Accessories",
        inStock: true,
        addedAt: "2026-08-24T10:15:00Z",
      },
    ],
    orders: [
      {
        id: "GH-10478",
        customer: "Isla Brown",
        email: "isla.brown@email.com",
        date: "Aug 24, 2026",
        total: 154,
        status: "delivered",
        items: 3,
        payment: "Apple Pay",
        delivery: "Express",
      },
    ],
    notes: ["Has 12 five-star photo reviews on storefront.", "Requested gift wrapping on past order."],
    activityLogs: [
      {
        id: "act_110",
        action: "Order Delivered",
        description: "Order #GH-10478 delivered safely by Express courier.",
        timestamp: "2026-08-26T14:30:00Z",
        device: "Courier API Sync",
        ipAddress: "127.0.0.1",
      },
    ],
  },
  {
    id: "usr_106",
    name: "Aarav Mehta",
    email: "aarav.mehta@email.com",
    phone: "+91 98210 55432",
    avatarColor: "#d6f2f2",
    verified: true,
    isVerified: true,
    role: "customer",
    status: "active",
    totalSpent: 98,
    orderCount: 1,
    cartCount: 2,
    wishlistCount: 1,
    avgOrderValue: 98.0,
    createdAt: "2026-06-11T15:20:00Z",
    lastActive: "2026-08-27T13:40:00Z",
    gender: "Male",
    birthday: "1996-09-21",
    tags: ["Gift Buyer", "New Shopper"],
    addresses: [
      {
        id: "addr_7",
        type: "shipping",
        isDefault: true,
        name: "Aarav Mehta",
        phone: "+91 98210 55432",
        street: "B-404, Shanti Heights, Bodakdev",
        city: "Ahmedabad",
        state: "Gujarat",
        postalCode: "380054",
        country: "India",
      },
    ],
    cart: [
      {
        productId: "p3",
        title: "Satin Bow Ballet Flats",
        price: 38,
        originalPrice: 54,
        quantity: 1,
        image: "#d8bfd0",
        category: "Shoes",
        inStock: true,
        selectedSize: "37 EU",
        selectedColor: "Lavender Mist",
        addedAt: "2026-08-27T13:30:00Z",
      },
      {
        productId: "p5",
        title: "Sunday Market Tote",
        price: 30,
        originalPrice: 42,
        quantity: 1,
        image: "#e3d3a6",
        category: "Accessories",
        inStock: true,
        selectedSize: "One Size",
        selectedColor: "Butter Oatmeal",
        addedAt: "2026-08-27T13:35:00Z",
      },
    ],
    wishlist: [
      {
        productId: "p1",
        title: "Cloud Knit Co-Ord",
        price: 49,
        originalPrice: 68,
        image: "#f4c9c2",
        category: "Loungewear",
        inStock: true,
        addedAt: "2026-08-27T13:20:00Z",
      },
    ],
    orders: [
      {
        id: "GH-10440",
        customer: "Aarav Mehta",
        email: "aarav.mehta@email.com",
        date: "Aug 10, 2026",
        total: 98,
        status: "delivered",
        items: 2,
        payment: "UPI · GPay",
        delivery: "Standard",
      },
    ],
    notes: ["Ordered items as gift with custom gift message."],
    activityLogs: [
      {
        id: "act_111",
        action: "Cart Update",
        description: "Added 2 items to cart (Flats & Tote).",
        timestamp: "2026-08-27T13:35:00Z",
        device: "Chrome on Android Pixel 8",
        ipAddress: "223.187.112.54",
      },
    ],
  },
  {
    id: "usr_107",
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "+91 98112 33445",
    avatarColor: "#fedbd0",
    verified: true,
    isVerified: true,
    role: "vip",
    status: "active",
    totalSpent: 1240,
    orderCount: 8,
    cartCount: 1,
    wishlistCount: 5,
    avgOrderValue: 155.0,
    createdAt: "2025-09-15T09:00:00Z",
    lastActive: "2026-08-27T14:10:00Z",
    gender: "Female",
    birthday: "1992-07-30",
    tags: ["VIP Elite", "Brand Ambassador", "High Frequency"],
    addresses: [
      {
        id: "addr_8",
        type: "shipping",
        isDefault: true,
        name: "Priya Sharma",
        phone: "+91 98112 33445",
        street: "Villa 12, Palm Meadows, Whitefield",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560066",
        country: "India",
      },
    ],
    cart: [
      {
        productId: "p2",
        title: "Cherry Cola Mini Dress",
        price: 62,
        originalPrice: 82,
        quantity: 1,
        image: "#d63c56",
        category: "Dresses",
        inStock: true,
        selectedSize: "S",
        selectedColor: "Cherry Red",
        addedAt: "2026-08-27T14:05:00Z",
      },
    ],
    wishlist: [
      {
        productId: "p1",
        title: "Cloud Knit Co-Ord",
        price: 49,
        originalPrice: 68,
        image: "#f4c9c2",
        category: "Loungewear",
        inStock: true,
        addedAt: "2026-08-15T11:00:00Z",
      },
      {
        productId: "p3",
        title: "Satin Bow Ballet Flats",
        price: 38,
        originalPrice: 54,
        image: "#d8bfd0",
        category: "Shoes",
        inStock: true,
        addedAt: "2026-08-16T12:00:00Z",
      },
      {
        productId: "p4",
        title: "Ribbed Baby Tee",
        price: 26,
        originalPrice: 34,
        image: "#d6e2d1",
        category: "Tops",
        inStock: true,
        addedAt: "2026-08-18T14:00:00Z",
      },
      {
        productId: "p5",
        title: "Sunday Market Tote",
        price: 30,
        originalPrice: 42,
        image: "#e3d3a6",
        category: "Accessories",
        inStock: true,
        addedAt: "2026-08-20T16:00:00Z",
      },
      {
        productId: "p6",
        title: "Lace Trim Cami",
        price: 29,
        originalPrice: 39,
        image: "#e5b7b4",
        category: "Tops",
        inStock: true,
        addedAt: "2026-08-22T18:00:00Z",
      },
    ],
    orders: [
      {
        id: "GH-10450",
        customer: "Priya Sharma",
        email: "priya.sharma@email.com",
        date: "Aug 18, 2026",
        total: 195,
        status: "delivered",
        items: 3,
        payment: "Visa · 9912",
        delivery: "Express",
      },
    ],
    notes: ["Highest lifetime spend customer this quarter.", "Invited to exclusive autumn preview launch."],
    activityLogs: [
      {
        id: "act_112",
        action: "Cart Update",
        description: "Added Cherry Cola Mini Dress to cart.",
        timestamp: "2026-08-27T14:05:00Z",
        device: "Chrome on macOS",
        ipAddress: "122.172.82.14",
      },
    ],
  },
  {
    id: "usr_108",
    name: "Jasmine Lee",
    email: "jasmine.lee@email.com",
    phone: "+91 99100 88776",
    avatarColor: "#fbe2be",
    verified: false,
    isVerified: false,
    role: "customer",
    status: "pending" as const,
    totalSpent: 0,
    orderCount: 0,
    cartCount: 2,
    wishlistCount: 2,
    avgOrderValue: 0,
    createdAt: "2026-08-26T17:15:00Z",
    lastActive: "2026-08-27T10:00:00Z",
    gender: "Female",
    tags: ["New Sign Up", "Subscriber", "High Cart Intent"],
    addresses: [
      {
        id: "addr_9",
        type: "shipping",
        isDefault: true,
        name: "Jasmine Lee",
        phone: "+91 99100 88776",
        street: "Flat 102, Silver Oak, Sector 54",
        city: "Gurugram",
        state: "Haryana",
        postalCode: "122002",
        country: "India",
      },
    ],
    cart: [
      {
        productId: "p1",
        title: "Cloud Knit Co-Ord",
        price: 49,
        originalPrice: 68,
        quantity: 1,
        image: "#f4c9c2",
        category: "Loungewear",
        inStock: true,
        selectedSize: "S",
        selectedColor: "Blush Rose",
        addedAt: "2026-08-26T18:00:00Z",
      },
      {
        productId: "p6",
        title: "Lace Trim Cami",
        price: 29,
        originalPrice: 39,
        quantity: 1,
        image: "#e5b7b4",
        category: "Tops",
        inStock: true,
        selectedSize: "S",
        selectedColor: "Dusty Pink",
        addedAt: "2026-08-26T18:05:00Z",
      },
    ],
    wishlist: [
      {
        productId: "p2",
        title: "Cherry Cola Mini Dress",
        price: 62,
        originalPrice: 82,
        image: "#d63c56",
        category: "Dresses",
        inStock: true,
        addedAt: "2026-08-26T17:30:00Z",
      },
      {
        productId: "p3",
        title: "Satin Bow Ballet Flats",
        price: 38,
        originalPrice: 54,
        image: "#d8bfd0",
        category: "Shoes",
        inStock: true,
        addedAt: "2026-08-26T17:32:00Z",
      },
    ],
    orders: [],
    notes: ["Subscribed to email newsletter on Aug 26. Pending email verification link confirmation."],
    activityLogs: [
      {
        id: "act_113",
        action: "Newsletter Subscribed",
        description: "Subscribed to GirlyHub newsletter for WELCOME10 coupon.",
        timestamp: "2026-08-26T17:15:00Z",
        device: "Safari on iPhone",
        ipAddress: "182.74.52.19",
      },
    ],
  },
];

export function getCustomerById(id: string): CustomerRecord | undefined {
  const cleanId = decodeURIComponent(id).trim().toLowerCase();
  const matched = customersRegistry.find(
    (c) =>
      c.id.toLowerCase() === cleanId ||
      c.email.toLowerCase() === cleanId ||
      c.name.toLowerCase().replace(/\s+/g, "-") === cleanId,
  );
  if (matched) return matched;

  return {
    id,
    name: "Customer " + id.slice(0, 8),
    email: `${id.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com`,
    phone: "+91 98200 11223",
    avatarColor: "#e5c5b5",
    verified: true,
    isVerified: true,
    role: "customer",
    status: "active",
    totalSpent: 138,
    orderCount: 1,
    cartCount: 1,
    wishlistCount: 1,
    avgOrderValue: 138,
    createdAt: "2026-01-01T00:00:00Z",
    lastActive: "2026-08-27T00:00:00Z",
    gender: "Female",
    tags: ["Registered Customer"],
    addresses: [
      {
        id: "addr_generic",
        type: "shipping",
        isDefault: true,
        name: "Customer " + id.slice(0, 8),
        phone: "+91 98200 11223",
        street: "123 Fashion Boulevard, Bandra",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400050",
        country: "India",
      },
    ],
    cart: [
      {
        productId: "p1",
        title: "Cloud Knit Co-Ord",
        price: 49,
        originalPrice: 68,
        quantity: 1,
        image: "#f4c9c2",
        category: "Loungewear",
        inStock: true,
        selectedSize: "M",
        selectedColor: "Blush Rose",
        addedAt: new Date().toISOString(),
      },
    ],
    wishlist: [
      {
        productId: "p2",
        title: "Cherry Cola Mini Dress",
        price: 62,
        originalPrice: 82,
        image: "#d63c56",
        category: "Dresses",
        inStock: true,
        addedAt: new Date().toISOString(),
      },
    ],
    orders: [
      {
        id: "GH-10482",
        customer: "Customer " + id.slice(0, 8),
        email: `${id}@example.com`,
        date: "Aug 26, 2026",
        total: 138,
        status: "delivered",
        items: 1,
        payment: "Visa · 4821",
        delivery: "Standard",
      },
    ],
    notes: ["User profile record synced from store directory."],
    activityLogs: [
      {
        id: "act_gen_1",
        action: "Profile Accessed",
        description: "Admin viewed customer 360 intelligence dossier.",
        timestamp: new Date().toISOString(),
        device: "Admin Dashboard",
      },
    ],
  };
}

export const formatCurrency = (amount: number | string | null | undefined) => {
  const numericAmount = Number(amount);
  const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;
  return `₹${safeAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (value: string | Date | null | undefined) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : parseISO(value);
  return isValid(date) ? format(date, "dd MMM yyyy") : "-";
};

export const formatDateTime = (value: string | Date | null | undefined) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : parseISO(value);
  return isValid(date) ? format(date, "dd MMM yyyy, hh:mm a") : "-";
};
