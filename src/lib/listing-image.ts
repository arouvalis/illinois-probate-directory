const BAD_IMAGE_HOSTS = [
  "lovable.dev",
  "lovable.app",
  "wixstatic.com/media/11062b",
  "squarespace-cdn.com/content/v1/default",
  "wsimg.com/ceo/default",
  "placehold.co",
  "via.placeholder.com",
];

export function isUsableListingImage(url?: string | null) {
  if (!url) return false;
  const u = url.toLowerCase();
  return !BAD_IMAGE_HOSTS.some((h) => u.includes(h));
}
