import { describe, it, expect } from 'vitest';
import { experienceEntries } from './experience';

describe('experienceEntries', () => {
  it('lists Conosi first, most recent role first', () => {
    expect(experienceEntries[0].org).toBe('Conosi');
    expect(experienceEntries[0].role).toBe('Founding Engineer');
  });

  it('includes the NASA Ames internship with accurate dates', () => {
    const nasa = experienceEntries.find((e) => e.org === 'NASA Ames Research Center');
    expect(nasa).toBeDefined();
    expect(nasa?.dateRange).toBe('01/2022 - 05/2022');
  });

  it('links the Conosi entry to its Projects case study', () => {
    const conosi = experienceEntries.find((e) => e.org === 'Conosi');
    expect(conosi?.caseStudyHref).toBe('/projects/conosi');
  });
});
