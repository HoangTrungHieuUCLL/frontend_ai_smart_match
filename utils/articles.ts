export type ArticleEntry = {
  slug: string;
  title: string;
  category: "Inspirational Stories" | "Employer Perspective" | "Expert Insights";
  date: string;
  body: string;
};

export const ARTICLES: ArticleEntry[] = [
  {
    slug: "unemployment-isnt-entirely-the-unemployed-persons-fault",
    title: "When unemployment isn't entirely the unemployed person's fault",
    category: "Inspirational Stories",
    date: "2026-03-12",
    body: "A look at the structural and market factors that shape job loss and job searches, and why compassion — not blame — is the right starting point for both candidates and employers.",
  },
  {
    slug: "building-employer-brand-attract-candidates-naturally",
    title: "Building employer brand: How to attract candidates naturally",
    category: "Inspirational Stories",
    date: "2026-02-20",
    body: "Practical steps for shaping an authentic employer brand that draws in the right candidates without relying on aggressive outbound sourcing.",
  },
  {
    slug: "recruitment-strategies-that-actually-work",
    title: "Recruitment strategies that actually work in today's market",
    category: "Employer Perspective",
    date: "2026-01-28",
    body: "An overview of sourcing, screening, and closing tactics that hold up in a competitive hiring market, from an employer's point of view.",
  },
  {
    slug: "ai-applications-in-hiring",
    title: "How AI is changing hiring in Vietnam",
    category: "Employer Perspective",
    date: "2026-01-05",
    body: "From resume screening to candidate matching, a survey of where AI tools genuinely help hiring teams — and where human judgment still matters most.",
  },
  {
    slug: "headhunting-practices-in-vietnam",
    title: "Headhunting practices in Vietnam: what employers should know",
    category: "Employer Perspective",
    date: "2025-12-15",
    body: "A primer on how headhunting engagements typically work in the Vietnamese market and how to evaluate a headhunting partner.",
  },
  {
    slug: "workplace-dynamics-that-shape-retention",
    title: "The workplace dynamics that shape retention",
    category: "Expert Insights",
    date: "2025-11-30",
    body: "Experts weigh in on the day-to-day dynamics — management style, recognition, autonomy — that most influence whether employees stay.",
  },
  {
    slug: "hr-management-models-compared",
    title: "HR management models, compared",
    category: "Expert Insights",
    date: "2025-11-10",
    body: "A comparison of common HR operating models and how to choose the right one as a company scales.",
  },
  {
    slug: "career-development-trends",
    title: "Career development trends worth watching",
    category: "Expert Insights",
    date: "2025-10-22",
    body: "What's changing in how professionals think about growth, mobility, and skill-building — and what it means for employers.",
  },
];

export function getArticleBySlug(slug: string): ArticleEntry | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}
