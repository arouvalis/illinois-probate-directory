/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/blog/inherited-house-illinois",
        destination: "/resources/selling-inherited-property-illinois",
        permanent: true,
      },
      {
        source: "/blog/executor-selling-house-illinois",
        destination: "/resources/selling-inherited-property-illinois",
        permanent: true,
      },
      {
        source: "/blog/sell-house-in-probate-illinois",
        destination: "/resources/selling-inherited-property-illinois",
        permanent: true,
      },
      {
        source: "/blog/can-executor-sell-house-illinois",
        destination: "/resources/selling-inherited-property-illinois",
        permanent: true,
      },
      {
        source: "/blog/selling-inherited-house-illinois",
        destination: "/resources/selling-inherited-property-illinois",
        permanent: true,
      },
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
      {
        source: "/blog/naperville-il-probate",
        destination: "/blog/probate-attorney-naperville-illinois",
        permanent: true,
      },
      {
        source: "/blog/gilbert-wills-attorney",
        destination: "/blog/gilberts-wills-attorney",
        permanent: true,
      },
      {
        source: "/blog/gilbert-wills-litigation-attorney",
        destination: "/blog/gilberts-wills-attorney",
        permanent: true,
      },
      {
        source: "/blog/lake-county-probate-illinois",
        destination: "/blog/lake-county-il-probate",
        permanent: true,
      },
      {
        source: "/blog/mchenry-county-estate-planning-attorneys",
        destination: "/blog/mchenry-county-lawyers-probate-estate",
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
