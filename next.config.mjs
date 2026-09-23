/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/attorney/will-county-law-library-joliet",
        destination: "/county/will",
        permanent: true,
      },
      {
        source: "/attorney/will-county-circuit-clerk-joliet",
        destination: "/county/will",
        permanent: true,
      },
      {
        source: "/attorney/collins-mary-l-woodridge",
        destination: "/county/dupage",
        permanent: true,
      },
      {
        source: "/attorney/collins-disability-law-woodridge",
        destination: "/county/dupage",
        permanent: true,
      },
      {
        source: "/attorney/terrence-j-mckenna-crystal-lake",
        destination: "/attorney/mckenna-law-pc-crystal-lake",
        permanent: true,
      },
      {
        source: "/attorney/johnson-jennifer-l-crystal-lake",
        destination: "/attorney/zanck-coen-wright-saladin-p-c-crystal-lake",
        permanent: true,
      },
      {
        source: "/attorney/patricia-c-kraft-attorney-at-law-crystal-lake",
        destination: "/attorney/the-law-offices-of-stacy-stusowski-pc-crystal-lake",
        permanent: true,
      },
      {
        source: "/attorney/peter-f-carroll-woodstock",
        destination: "/attorney/carroll-carroll-attorneys-at-law-woodstock",
        permanent: true,
      },
      {
        source: "/attorney/the-law-firm-of-zohaib-ali-woodridge",
        destination: "/attorney/zara-law-group-woodridge",
        permanent: true,
      },
      {
        source: "/attorney/merle-c-bassett-wood-river",
        destination: "/attorney/bassett-gabriel-law-office-p-c-wood-river",
        permanent: true,
      },
      {
        source: "/attorney/mcandrews-law-mchenry",
        destination: "/attorney/law-office-of-patrick-j-mcandrews-mchenry",
        permanent: true,
      },
      {
        source: "/attorney/matuszewich-kelly-llp-lake-in-the-hills",
        destination: "/attorney/franks-kelly-matuszewich-and-andrle-attorneys-at-law-lake-in-the-hills",
        permanent: true,
      },
      {
        source: "/attorney/peck-ritchey-llc-northbrook",
        destination: "/attorney/peck-ritchey-llc-chicago",
        permanent: true,
      },
      {
        source: "/attorney/mohammed-shamaileh-tabahi-llc-elmwood-park",
        destination: "/attorney/the-shamaileh-law-firm-llc-glenview",
        permanent: true,
      },
      {
        source: "/attorney/kazdalaw-oak-lawn",
        destination: "/attorney/kazdalaw-p-c-tinley-park",
        permanent: true,
      },
      {
        source: "/attorney/o-flaherty-law-evanston",
        destination: "/attorney/o-flaherty-law-chicago",
        permanent: true,
      },
      {
        source: "/attorney/evans-legacy-law-group-llc-lake-forest",
        destination: "/attorney/evans-legacy-law-group-libertyville",
        permanent: true,
      },
      {
        source: "/attorney/meents-law-p-c-formerly-fisher-meents-llc-wilmington",
        destination: "/attorney/meents-law-p-c-channahon",
        permanent: true,
      },
      {
        source: "/attorney/cowlin-naughton-curran-cuda-hanzel-woodstock",
        destination: "/attorney/cowlin-naughton-curran-cuda-hanzel-crystal-lake",
        permanent: true,
      },
      {
        source: "/attorney/bernabei-balestri-fiocchi-spring-valley",
        destination: "/attorney/bernabei-balestri-fiocchi-la-salle",
        permanent: true,
      },
      {
        source: "/attorney/will-county-bar-association-joliet",
        destination: "/county/will",
        permanent: true,
      },
      {
        source: "/attorney/maria-mastrolonardo-probate-real-estate-specialist-re-max-enterprises-naperville",
        destination: "/county/dupage",
        permanent: true,
      },
      {
        source: "/attorney/lewis-levinson-law-office-twin-lakes",
        destination: "/attorney/lewis-levinson-richmond",
        permanent: true,
      },
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
