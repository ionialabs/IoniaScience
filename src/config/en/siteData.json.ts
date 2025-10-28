import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
  name: "IoniaScience",
  // Your website's title and description (meta fields)
  title: "IoniaScience – Exploring space science and discovery",
  description:
    "IoniaScience highlights research and engineering projects from the Ionia Labs team, covering astronomy, space exploration, and the science behind our mission.",

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
