interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  tags?: string[];
}

const servicesData: Service[] = [
  {
    _id: "1",
    name: "Rééducation",
    description:
      "Recover safely at home with personalized physiotherapy sessions designed to restore your strength and mobility.",
    category: "reeducation",
    price: 60,
    duration: 60,
    tags: ["physiotherapy", "recovery", "mobility", "rehabilitation"],
  },
  {
    _id: "2",
    name: "Perfusion",
    description:
      "Professional IV therapy services delivered in the comfort of your home with trained nursing staff.",
    category: "perfusion",
    price: 80,
    duration: 60,
    tags: ["IV therapy", "infusion", "hydration", "medical"],
  },
  {
    _id: "3",
    name: "Vaccination",
    description:
      "Get vaccinated at home with our certified nurses ensuring safe and convenient immunization.",
    category: "vaccination",
    price: 40,
    duration: 30,
    tags: ["vaccine", "immunization", "prevention", "shot"],
  },
  {
    _id: "4",
    name: "Analyses",
    description:
      "Home blood sample collection and laboratory test services with quick and accurate results.",
    category: "analyses",
    price: 50,
    duration: 30,
    tags: ["blood test", "lab", "diagnostic", "sample collection"],
  },
  {
    _id: "5",
    name: "Consultation",
    description:
      "Expert medical consultation at your doorstep with experienced healthcare professionals.",
    category: "consultation",
    price: 70,
    duration: 45,
    tags: ["doctor", "medical advice", "checkup", "examination"],
  },
  {
    _id: "6",
    name: "Maternity",
    description:
      "Comprehensive maternity care and support for new mothers in the comfort of home.",
    category: "maternity",
    price: 90,
    duration: 60,
    tags: ["pregnancy", "prenatal", "postnatal", "newborn"],
  },
  {
    _id: "7",
    name: "Pediatric",
    description:
      "Specialized pediatric care for children with gentle and experienced nursing staff.",
    category: "pediatric",
    price: 55,
    duration: 45,
    tags: ["children", "kids", "infant", "baby care"],
  },
  {
    _id: "8",
    name: "Medication",
    description:
      "Professional medication administration and management services at home.",
    category: "medication",
    price: 35,
    duration: 30,
    tags: ["medicine", "pills", "drug administration", "prescription"],
  },
  {
    _id: "9",
    name: "Wound Care",
    description:
      "Professional wound dressing and care services to promote healing and prevent infection.",
    category: "wound-care",
    price: 65,
    duration: 45,
    tags: ["dressing", "bandage", "injury", "healing"],
  },
  {
    _id: "10",
    name: "Elderly Care",
    description:
      "Compassionate elderly care services with assistance for daily activities and health monitoring.",
    category: "elderly-care",
    price: 55,
    duration: 60,
    tags: ["senior", "geriatric", "aged care", "assistance"],
  },
  {
    _id: "11",
    name: "Dialysis",
    description:
      "Home dialysis services with trained professionals ensuring safe and comfortable treatment.",
    category: "dialysis",
    price: 120,
    duration: 240,
    tags: ["kidney", "renal", "filtration", "chronic care"],
  },
  {
    _id: "12",
    name: "Respiratory",
    description:
      "Respiratory therapy and oxygen administration services for breathing support at home.",
    category: "respiratory",
    price: 75,
    duration: 60,
    tags: ["breathing", "oxygen", "lung", "respiratory therapy"],
  },
  {
    _id: "13",
    name: "Post-Op Care",
    description:
      "Post-operative care and recovery support to ensure smooth healing after surgery.",
    category: "post-op-care",
    price: 70,
    duration: 60,
    tags: ["surgery", "recovery", "post-surgical", "healing"],
  },
  {
    _id: "14",
    name: "Injection",
    description:
      "Professional injection administration services including insulin and other medications.",
    category: "injection",
    price: 45,
    duration: 15,
    tags: ["insulin", "shot", "intramuscular", "subcutaneous"],
  },
  {
    _id: "15",
    name: "Palliative",
    description:
      "Palliative care services focused on comfort and quality of life for serious illness.",
    category: "palliative",
    price: 100,
    duration: 60,
    tags: ["comfort care", "end of life", "pain management", "hospice"],
  },
  {
    _id: "16",
    name: "Nutrition",
    description:
      "Nutritional support and tube feeding management with certified healthcare professionals.",
    category: "nutrition",
    price: 60,
    duration: 45,
    tags: ["diet", "feeding", "tube feeding", "nutritional support"],
  },
];

export function getServiceNameById(id: string): string {
  const service = servicesData.find((s) => s._id === id);
  return service ? service.name : "Unknown Service";
}

export function getServiceById(id: string): Service | undefined {
  return servicesData.find((s) => s._id === id);
}

export function getServiceCategoryById(id: string): string {
  const service = servicesData.find((s) => s._id === id);
  return service ? service.category : "";
}

export { servicesData, type Service };
