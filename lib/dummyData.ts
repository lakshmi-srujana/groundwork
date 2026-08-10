export interface StatItem {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  change: string;
  trend: "up" | "down" | "neutral";
  subtitle: string;
  iconName: string;
}

export interface ActivityItem {
  id: string;
  volunteerName: string;
  volunteerAvatar: string;
  action: string;
  location: string;
  district: string;
  timestamp: string;
  taskCategory: "photo_proof" | "dispatch" | "verification" | "flag";
  confidenceScore?: number;
  status: "verified" | "pending" | "flagged";
}

export interface VerificationSubmission {
  id: string;
  volunteerName: string;
  volunteerAvatar: string;
  volunteerPhone: string;
  district: string;
  wardOrZone: string;
  taskType: string;
  timestamp: string;
  status: "Pending" | "Verified" | "Rejected";
  aiConfidenceScore: number;
  proofType: "Geotagged Photo" | "Purchase Receipt" | "Video Telemetry" | "Biometric Sign-off";
  imageBgColor: string;
  proofThumbnailText: string;
  notes: string;
  coordinates: string;
  itemsDelivered: string;
}

export interface LiveTask {
  id: string;
  taskId: string;
  volunteer: string;
  volunteerAvatar: string;
  district: string;
  taskType: string;
  status: "Verified" | "Pending" | "In Progress" | "Rejected";
  priority: "Critical" | "High" | "Medium";
  lastUpdated: string;
  quantity: string;
  beneficiariesCount: number;
  gpsTag: string;
}

export const COORDINATOR_PROFILE = {
  name: "Dr. Aris Thorne",
  role: "Lead Field Operations Coordinator",
  region: "South Asia Relief Command",
  activeZone: "Wayanad & Assam Flood Response",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  verifiedBadge: "AI-Clearance L3",
};

export const OVERVIEW_STATS: StatItem[] = [
  {
    id: "volunteers",
    label: "Total Volunteers Active",
    value: 1284,
    change: "+14.2% today",
    trend: "up",
    subtitle: "On-ground in 14 relief hubs",
    iconName: "Users",
  },
  {
    id: "completed",
    label: "Tasks Completed Today",
    value: 462,
    change: "98.4% AI-Verified",
    trend: "up",
    subtitle: "+88 tasks vs yesterday",
    iconName: "CheckCircle2",
  },
  {
    id: "pending",
    label: "Pending Verifications",
    value: 38,
    change: "Avg response ~4m",
    trend: "neutral",
    subtitle: "8 require urgent review",
    iconName: "Clock",
  },
  {
    id: "districts",
    label: "Districts Covered",
    value: 14,
    change: "Kerala & Assam sector",
    trend: "up",
    subtitle: "102 active micro-camps",
    iconName: "MapPin",
  },
];

export const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    volunteerName: "Meera R.",
    volunteerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120",
    action: "submitted photo proof for 50 Clean Water Canisters",
    location: "Ward 7, Meppadi",
    district: "Wayanad",
    timestamp: "2 mins ago",
    taskCategory: "photo_proof",
    confidenceScore: 98,
    status: "pending",
  },
  {
    id: "act-2",
    volunteerName: "Rajesh Kumar",
    volunteerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    action: "completed emergency drinking water distribution",
    location: "Silchar Ward 3 Relief Camp",
    district: "Cachar",
    timestamp: "8 mins ago",
    taskCategory: "verification",
    confidenceScore: 99,
    status: "verified",
  },
  {
    id: "act-3",
    volunteerName: "Priya Nair",
    volunteerAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=120",
    action: "dispatched 120 ORS & First Aid Packets",
    location: "Chooralmala Sector B",
    district: "Wayanad",
    timestamp: "15 mins ago",
    taskCategory: "dispatch",
    confidenceScore: 94,
    status: "verified",
  },
  {
    id: "act-4",
    volunteerName: "System AI Guard",
    volunteerAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120",
    action: "flagged potential duplicate receipt upload",
    location: "Hailakandi Main Hub",
    district: "Hailakandi",
    timestamp: "22 mins ago",
    taskCategory: "flag",
    confidenceScore: 42,
    status: "flagged",
  },
  {
    id: "act-5",
    volunteerName: "Suresh P.",
    volunteerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    action: "uploaded geotagged video telemetry for Tarpaulin Shelters",
    location: "Majuli Island River Bank",
    district: "Jorhat",
    timestamp: "35 mins ago",
    taskCategory: "photo_proof",
    confidenceScore: 96,
    status: "pending",
  },
  {
    id: "act-6",
    volunteerName: "Dr. Ananya Sen",
    volunteerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
    action: "confirmed arrival of Anti-Snake Venom (20 vials)",
    location: "Nilambur Sub-District Hospital",
    district: "Malappuram",
    timestamp: "48 mins ago",
    taskCategory: "verification",
    confidenceScore: 100,
    status: "verified",
  },
];

export const INITIAL_VERIFICATION_QUEUE: VerificationSubmission[] = [
  {
    id: "VER-8901",
    volunteerName: "Meera R.",
    volunteerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
    volunteerPhone: "+91 98471 20491",
    district: "Wayanad",
    wardOrZone: "Ward 7 - Meppadi Relief Base",
    taskType: "Drinking Water Supply",
    timestamp: "Today, 14:18 IST",
    status: "Pending",
    aiConfidenceScore: 97,
    proofType: "Geotagged Photo",
    imageBgColor: "#2D4A2D",
    proofThumbnailText: "50x 20L Water Cans Geotagged at Camp #7",
    notes: "Verified delivery of 50 water containers to Camp #7 coordinator. Geotag coordinates match within 4 meters of target drop zone.",
    coordinates: "11.5542° N, 76.1264° E",
    itemsDelivered: "50x 20L Potable Water Drums",
  },
  {
    id: "VER-8902",
    volunteerName: "Suresh Patel",
    volunteerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    volunteerPhone: "+91 94350 88310",
    district: "Jorhat",
    wardOrZone: "Kamalabari Ghat, Majuli",
    taskType: "High-Durability Tarpaulins",
    timestamp: "Today, 14:02 IST",
    status: "Pending",
    aiConfidenceScore: 94,
    proofType: "Geotagged Photo",
    imageBgColor: "#6B7C4A",
    proofThumbnailText: "30x Waterproof Tarps Handed Over",
    notes: "30 heavy-duty 200 GSM tarpaulin sheets handed over to village panchayat lead for riverbank flood victims.",
    coordinates: "26.9538° N, 94.1670° E",
    itemsDelivered: "30x Heavy Tarpaulins (18x24 ft)",
  },
  {
    id: "VER-8903",
    volunteerName: "Tenzin Dorjee",
    volunteerAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150",
    volunteerPhone: "+91 87621 44092",
    district: "Chamoli",
    wardOrZone: "Joshimath Sector 2",
    taskType: "Thermal Blankets & Apparel",
    timestamp: "Today, 13:45 IST",
    status: "Pending",
    aiConfidenceScore: 89,
    proofType: "Purchase Receipt",
    imageBgColor: "#8B5E3C",
    proofThumbnailText: "Receipt #CH-4410 (₹18,500)",
    notes: "Direct store purchase receipt from Army Canteen authorized supplier. AI flag: Slight lighting contrast on stamp signature.",
    coordinates: "30.5568° N, 79.5660° E",
    itemsDelivered: "100x Fleece Blankets + Jackets",
  },
  {
    id: "VER-8904",
    volunteerName: "Amina Begum",
    volunteerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    volunteerPhone: "+91 91012 39948",
    district: "Cachar",
    wardOrZone: "Silchar Medical Camp B",
    taskType: "Infant Care & Milk Powder",
    timestamp: "Today, 13:12 IST",
    status: "Pending",
    aiConfidenceScore: 99,
    proofType: "Biometric Sign-off",
    imageBgColor: "#C4973A",
    proofThumbnailText: "40 Baby Food Kits + Diaper Packs",
    notes: "Signed off by Dr. Sarma at Silchar District Hospital transit desk. High AI confidence match with batch serial numbers.",
    coordinates: "24.8333° N, 92.7789° E",
    itemsDelivered: "40x Infant Nutrition Kits",
  },
  {
    id: "VER-8905",
    volunteerName: "Karthik Verma",
    volunteerAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150",
    volunteerPhone: "+91 97441 55012",
    district: "Wayanad",
    wardOrZone: "Chooralmala Center",
    taskType: "Emergency First Aid Kits",
    timestamp: "Today, 12:50 IST",
    status: "Pending",
    aiConfidenceScore: 61,
    proofType: "Geotagged Photo",
    imageBgColor: "#2D4A2D",
    proofThumbnailText: "First Aid Kits Delivery Image",
    notes: "AI Warning: Image metadata shows timestamp discrepancy of 42 minutes. Recommend coordinator manual review.",
    coordinates: "11.5410° N, 76.1620° E",
    itemsDelivered: "25x Level-2 First Aid Boxes",
  },
  {
    id: "VER-8906",
    volunteerName: "Lakshmi Narayanan",
    volunteerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    volunteerPhone: "+91 99611 02931",
    district: "Malappuram",
    wardOrZone: "Nilambur Bypass Shelter",
    taskType: "Hot Meals Rations",
    timestamp: "Today, 12:20 IST",
    status: "Verified",
    aiConfidenceScore: 99,
    proofType: "Geotagged Photo",
    imageBgColor: "#87A878",
    proofThumbnailText: "350 Packed Meals Distributed",
    notes: "Verified by Regional Food Inspector token #891. All meal boxes distributed under clean hygienic standards.",
    coordinates: "11.2750° N, 76.2240° E",
    itemsDelivered: "350x Ready-to-Eat Food Packets",
  },
  {
    id: "VER-8907",
    volunteerName: "Gautam Das",
    volunteerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    volunteerPhone: "+91 98310 99401",
    district: "Darrang",
    wardOrZone: "Mangaldai Sub-division",
    taskType: "Solar Emergency Lanterns",
    timestamp: "Today, 11:40 IST",
    status: "Pending",
    aiConfidenceScore: 92,
    proofType: "Geotagged Photo",
    imageBgColor: "#6B7C4A",
    proofThumbnailText: "60 Rechargeable Solar Lamps",
    notes: "Distribution completed for power-grid blackout zones in flood inundated village panchayat.",
    coordinates: "26.4350° N, 92.0340° E",
    itemsDelivered: "60x Heavy-Duty Solar Lanterns",
  },
  {
    id: "VER-8908",
    volunteerName: "Deepak Rawat",
    volunteerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    volunteerPhone: "+91 94120 78654",
    district: "Uttarkashi",
    wardOrZone: "Bhatwari Sector 1",
    taskType: "Dry Grain Kits (Rice & Pulses)",
    timestamp: "Today, 11:05 IST",
    status: "Rejected",
    aiConfidenceScore: 35,
    proofType: "Purchase Receipt",
    imageBgColor: "#8B5E3C",
    proofThumbnailText: "Blurry Receipt Image",
    notes: "Rejected due to unreadable receipt image and missing GPS location tag. Requested resubmission from volunteer.",
    coordinates: "30.7268° N, 78.4430° E",
    itemsDelivered: "15x 10kg Ration Bags",
  },
];

export const LIVE_TASKS_DATA: LiveTask[] = [
  {
    id: "task-101",
    taskId: "GW-WYD-401",
    volunteer: "Meera R.",
    volunteerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120",
    district: "Wayanad (Kerala)",
    taskType: "Potable Water Delivery",
    status: "Pending",
    priority: "Critical",
    lastUpdated: "5 mins ago",
    quantity: "1,000 Liters",
    beneficiariesCount: 240,
    gpsTag: "11.5542° N, 76.1264° E",
  },
  {
    id: "task-102",
    taskId: "GW-CAC-812",
    volunteer: "Rajesh Kumar",
    volunteerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    district: "Cachar (Assam)",
    taskType: "Flood Water Pumping Kits",
    status: "Verified",
    priority: "Critical",
    lastUpdated: "12 mins ago",
    quantity: "4 Diesel Pumps",
    beneficiariesCount: 520,
    gpsTag: "24.8333° N, 92.7789° E",
  },
  {
    id: "task-103",
    taskId: "GW-WYD-409",
    volunteer: "Priya Nair",
    volunteerAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=120",
    district: "Wayanad (Kerala)",
    taskType: "Pediatric First Aid Kits",
    status: "Verified",
    priority: "High",
    lastUpdated: "18 mins ago",
    quantity: "120 Units",
    beneficiariesCount: 180,
    gpsTag: "11.5410° N, 76.1620° E",
  },
  {
    id: "task-104",
    taskId: "GW-JOR-104",
    volunteer: "Suresh Patel",
    volunteerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    district: "Jorhat (Assam)",
    taskType: "Shelter Tarpaulins",
    status: "Pending",
    priority: "High",
    lastUpdated: "25 mins ago",
    quantity: "30 Heavy Tarps",
    beneficiariesCount: 150,
    gpsTag: "26.9538° N, 94.1670° E",
  },
  {
    id: "task-105",
    taskId: "GW-CHM-902",
    volunteer: "Tenzin Dorjee",
    volunteerAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120",
    district: "Chamoli (Uttarakhand)",
    taskType: "Thermal Winter Jackets",
    status: "Pending",
    priority: "Medium",
    lastUpdated: "32 mins ago",
    quantity: "100 Jackets",
    beneficiariesCount: 100,
    gpsTag: "30.5568° N, 79.5660° E",
  },
  {
    id: "task-106",
    taskId: "GW-CAC-819",
    volunteer: "Amina Begum",
    volunteerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
    district: "Cachar (Assam)",
    taskType: "Infant Powder & Diapers",
    status: "Verified",
    priority: "Critical",
    lastUpdated: "40 mins ago",
    quantity: "40 Care Packs",
    beneficiariesCount: 40,
    gpsTag: "24.8333° N, 92.7789° E",
  },
  {
    id: "task-107",
    taskId: "GW-MLP-331",
    volunteer: "Dr. Ananya Sen",
    volunteerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
    district: "Malappuram (Kerala)",
    taskType: "Anti-Snake Venom Clearance",
    status: "Verified",
    priority: "Critical",
    lastUpdated: "1 hour ago",
    quantity: "20 Vials",
    beneficiariesCount: 20,
    gpsTag: "11.2750° N, 76.2240° E",
  },
  {
    id: "task-108",
    taskId: "GW-UTK-504",
    volunteer: "Deepak Rawat",
    volunteerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    district: "Uttarkashi (Uttarakhand)",
    taskType: "Emergency Rice Rations",
    status: "Rejected",
    priority: "Medium",
    lastUpdated: "1 hour ago",
    quantity: "15 Bags (150kg)",
    beneficiariesCount: 60,
    gpsTag: "30.7268° N, 78.4430° E",
  },
  {
    id: "task-109",
    taskId: "GW-DAR-220",
    volunteer: "Gautam Das",
    volunteerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    district: "Darrang (Assam)",
    taskType: "Solar Emergency Lamps",
    status: "In Progress",
    priority: "Medium",
    lastUpdated: "2 hours ago",
    quantity: "60 Lamps",
    beneficiariesCount: 300,
    gpsTag: "26.4350° N, 92.0340° E",
  },
  {
    id: "task-110",
    taskId: "GW-WYD-415",
    volunteer: "Karthik Verma",
    volunteerAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=120",
    district: "Wayanad (Kerala)",
    taskType: "Hygiene & Sanitation Kits",
    status: "In Progress",
    priority: "High",
    lastUpdated: "2 hours ago",
    quantity: "150 Kits",
    beneficiariesCount: 450,
    gpsTag: "11.5410° N, 76.1620° E",
  },
];
