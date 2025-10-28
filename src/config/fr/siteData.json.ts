import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
  name: "IoniaScience",
  // Your website's title and description (meta fields)
  title: "IoniaScience – Explorer la science spatiale et la recherche",
  description:
    "IoniaScience présente les recherches et projets d'Ionia Labs, avec un regard sur l'astronomie, l'exploration spatiale et la science derrière notre mission.",

  // Your information for blog post purposes
  author: {
    name: "Équipe IoniaScience",
    email: "info@ionialabs.com",
    twitter: "IoniaScience",
  },

  // default image for meta tags if the page doesn't have an image already
  defaultImage: {
    src: "/favicon.png",
    alt: "Logo IoniaScience",
  },
};

export default siteData;
