import { ContentSectionManager } from "./content/editors";

export default function AdminHome() {
  return <ContentSectionManager pageTitle="Home" sectionKeys={["hero", "features", "stats", "cta"]} />;
}
