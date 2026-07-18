import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
  name: "IoniaScience",
  // Your website's title and description (meta fields)
  title: "IoniaScience – La science récente, rendue lisible",
  description:
    "IoniaScience transforme les articles de recherche évalués par les pairs en récits scientifiques clairs et captivants — en biologie, médecine, neurosciences et au-delà — avec des applications interactives à venir.",

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
