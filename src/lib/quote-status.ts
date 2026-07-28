// Single source for how each QuoteStatus enum value reads in the UI — the
// list filter, the row/detail status control, and the status badge all used
// to define their own copy of this map and had drifted ("Pending" in two of
// them, "New Request" in the third for the same value).
// The enum value itself stays "cancelled" (DB/API/zod) — only the label
// changes. "Declined" reads as what actually happened here: the customer
// said no to a quote we sent, not that staff cancelled it internally.
export const QUOTE_STATUS_LABELS: Record<string, string> = {
  pending: "New Request",
  quoted: "Quoted",
  accepted: "Accepted",
  cancelled: "Declined",
};

export const QUOTE_STATUS_VALUES = Object.keys(QUOTE_STATUS_LABELS) as Array<
  keyof typeof QUOTE_STATUS_LABELS
>;
