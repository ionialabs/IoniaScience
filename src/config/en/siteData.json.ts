import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
  name: "IoniaScience",
  // Your website's title and description (meta fields)
  title: "IoniaScience – Readable science from the latest research",
  description:
    "IoniaScience turns peer-reviewed research papers into clear, engaging science stories — across biology, medicine, neuroscience, and beyond — with interactive apps and tools on the way.",

  // Your information for blog post purposes
  author: {
    name: "IoniaScience Team",
    email: "info@ionialabs.com",
    twitter: "IoniaScience",
  },

  // default image for meta tags if the page doesn't have an image already
  defaultImage: {
    src: "/favicon.png",
    alt: "IoniaScience logo",
  },
};

export default siteData;
