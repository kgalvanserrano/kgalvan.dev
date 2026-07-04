export interface ExperienceEntry {
  role: string;
  org: string;
  dateRange: string;
  summary: string;
  caseStudyHref?: string;
}

export const experienceEntries: ExperienceEntry[] = [
  {
    role: 'Founding Engineer',
    org: 'Conosi',
    dateRange: '05/2025 - Present',
    summary:
      'Sole engineer taking a consumer EdTech platform from concept to App Store submission.',
    caseStudyHref: '/projects/conosi',
  },
  {
    role: 'Project Management Intern',
    org: 'NASA Ames Research Center',
    dateRange: '01/2022 - 05/2022',
    summary:
      'Built data visualizations and a MongoDB pipeline for spacecraft mission data on a 6-person cross-functional team.',
  },
];
