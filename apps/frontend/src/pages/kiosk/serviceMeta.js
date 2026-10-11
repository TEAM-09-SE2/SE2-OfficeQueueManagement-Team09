// Icon and description are not returned by the API, so they live here.
const META_BY_NAME = {
  "Parcel Shipping": { icon: "📦", description: "Send parcels and packages." },
  "Bill Payment": { icon: "🧾", description: "Pay bills and fees." },
  "Registered Mail Pickup": {
    icon: "✉️",
    description: "Collect registered mail.",
  },
  "Change of Address": { icon: "🏠", description: "Update your address." },
  "Account Opening": { icon: "💳", description: "Open a new account." },
  "Mortgage Consultation": {
    icon: "🏦",
    description: "Talk to a mortgage advisor.",
  },
  "Digital ID Issuance": {
    icon: "🔐",
    description: "Get your digital identity.",
  },
  "ID Card Request": {
    icon: "🪪",
    description: "Request or renew an ID card.",
  },
  "General Information": {
    icon: "ℹ️",
    description: "Information and assistance.",
  },
  "Historical Archives": {
    icon: "🗂️",
    description: "Consult archived documents.",
  },
};

const DEFAULT_META = { icon: "🎫", description: "" };

const COLORS = [
  "var(--color-accent-purple)",
  "var(--color-accent-green)",
  "var(--color-accent-orange)",
];

export function getServiceMeta(service, index) {
  const meta = META_BY_NAME[service.name] ?? DEFAULT_META;
  return { ...meta, color: COLORS[index % COLORS.length] };
}
