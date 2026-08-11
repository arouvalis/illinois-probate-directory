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
      {
        source: "/blog/joliet-estate-planning-attorneys",
        destination: "/blog/joliet-wills-estates-attorney",
        permanent: true,
      },
      {
        source: "/blog/joliet-will-lawyer",
        destination: "/blog/joliet-wills-estates-attorney",
        permanent: true,
      },
      {
        source: "/blog/joliet-illinois-probate-lawyers",
        destination: "/blog/joliet-wills-estates-attorney",
        permanent: true,
      },
      {
        source: "/blog/probate-attorney-cicero-illinois",
        destination: "/blog/cicero-probate-attorney",
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
