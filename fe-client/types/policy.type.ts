export interface PolicySection {
  title: string;
  paragraphs: string[];
}

export interface Policy {
  title: string;
  slug: string;
  description: string;
  updatedAt: string;
  sections: PolicySection[];
}
