/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/county/mchenry-county",
        destination: "/county/mchenry",
        permanent: true,
      },
      {
        source: "/attorney/theresa-clancy-law-oak-park",
        destination: "/county/cook",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "streetviewpixels-pa.googleapis.com" },
    ],
  },
};

export default nextConfig;
