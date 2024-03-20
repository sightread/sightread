/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

// Define possible events and actions as type aliases
type GtagEvent = "page_view" | "login" | "sign_up" | "search";
type GtagAction = "click" | "submit" | "load" | "engage";

interface GtagEventObject {
  // Add specific properties according to your actual needs
  event_category?: string;
  event_label?: string;
  value?: number;
  non_interaction?: boolean;
}

interface Window {
  gtag: (event: GtagEvent, action: GtagAction, object: GtagEventObject) => void;
}
