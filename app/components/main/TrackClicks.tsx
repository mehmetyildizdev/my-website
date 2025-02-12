export const trackClick = (category: string, label: string) => {
  window.gtag("event", "click", {
    event_category: category,
    event_label: label,
  });
};
