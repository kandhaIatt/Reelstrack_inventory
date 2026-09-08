export const users = [
  {
    id: 1,
    name: "Admin User",

    // Login details
    email: "admin@reeltrack.com",
    mobile: "9876543210",
    password: "Admin@123",

    // Access
    role: "ADMIN",
    unitId: "HO",

    // Account status
    active: true,

    // Login security simulation
    failedAttempts: 0,
    lockedUntil: null,

    // Session / password flags
    forcePasswordChange: false,
  },

  {
    id: 2,
    name: "Chennai User",

    // Login details
    email: "user@reeltrack.com",
    mobile: "9876543211",
    password: "User@123",

    // Access
    role: "USER",
    unitId: "U1",

    // Account status
    active: true,

    // Login security simulation
    failedAttempts: 0,
    lockedUntil: null,

    // Session / password flags
    forcePasswordChange: true,
  },
];


export const mills = [
  {
    id: 1,
    name: "Tamil Nadu Paper Mills",
    place: "Chennai",
    grades: "Kraft, Test Liner",
    active: true,
  },
];


export const suppliers = [
  {
    id: 1,
    name: "ABC Paper Suppliers",
    contact: "Ravi Kumar",
    phone: "9876543210",
    terms: "30 Days",
    mill: "Tamil Nadu Paper Mills",
    active: true,
  },
];


export const reelTypes = [
  {
    id: 1,
    name: "Kraft",
    defaultGsm: 120,
    defaultBf: 18,
    active: true,
  },
  {
    id: 2,
    name: "Semi-Kraft",
    defaultGsm: 100,
    defaultBf: 16,
    active: true,
  },
  {
    id: 3,
    name: "Duplex Board",
    defaultGsm: 180,
    defaultBf: 0,
    active: true,
  },
  {
    id: 4,
    name: "Test Liner",
    defaultGsm: 150,
    defaultBf: 20,
    active: true,
  },
  {
    id: 5,
    name: "Golden Kraft",
    defaultGsm: 140,
    defaultBf: 22,
    active: true,
  },
];

export const units = [
  {
    id: "U1",
    code: "CHN",
    name: "Chennai Unit",
    city: "Chennai",
    stateCode: "TN",
    incharge: "Chennai Manager",
    active: true,
  },
  {
    id: "U2",
    code: "CBE",
    name: "Coimbatore Unit",
    city: "Coimbatore",
    stateCode: "TN",
    incharge: "Coimbatore Manager",
    active: true,
  },
  {
    id: "U3",
    code: "BLR",
    name: "Bengaluru Unit",
    city: "Bengaluru",
    stateCode: "KA",
    incharge: "Bengaluru Manager",
    active: true,
  },
];