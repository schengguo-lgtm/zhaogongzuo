/**
 * Unit tests for mock data, utilities, and rate limiting logic.
 * These tests do not require a running device/emulator.
 */

import {
  MOCK_SITES,
  getSiteById,
  getAllJobs,
  getSiteAvailabilityStatus,
} from '../src/mock/sites';

describe('Mock site data', () => {
  it('should have between 8 and 12 sites', () => {
    expect(MOCK_SITES.length).toBeGreaterThanOrEqual(8);
    expect(MOCK_SITES.length).toBeLessThanOrEqual(12);
  });

  it('each site should have at least one job', () => {
    for (const site of MOCK_SITES) {
      expect(site.jobs.length).toBeGreaterThan(0);
    }
  });

  it('each site should have valid coordinates (Korea region)', () => {
    for (const site of MOCK_SITES) {
      // Korea: lat 33–38, lng 125–130
      expect(site.latitude).toBeGreaterThan(33);
      expect(site.latitude).toBeLessThan(38.5);
      expect(site.longitude).toBeGreaterThan(124);
      expect(site.longitude).toBeLessThan(131);
    }
  });

  it('each job should have a positive daily wage', () => {
    for (const site of MOCK_SITES) {
      for (const job of site.jobs) {
        expect(job.dailyWage).toBeGreaterThan(0);
        expect(job.currency).toBe('KRW');
      }
    }
  });

  it('filledCount should not exceed headcount', () => {
    for (const site of MOCK_SITES) {
      for (const job of site.jobs) {
        expect(job.filledCount).toBeLessThanOrEqual(job.headcount);
      }
    }
  });
});

describe('getSiteById', () => {
  it('should return a site for a valid id', () => {
    const site = getSiteById('site-001');
    expect(site).toBeDefined();
    expect(site?.id).toBe('site-001');
  });

  it('should return undefined for an invalid id', () => {
    const site = getSiteById('nonexistent');
    expect(site).toBeUndefined();
  });
});

describe('getAllJobs', () => {
  it('should return all jobs with site metadata', () => {
    const jobs = getAllJobs();
    expect(jobs.length).toBeGreaterThan(0);
    for (const job of jobs) {
      expect(job.siteName).toBeDefined();
      expect(job.siteAddress).toBeDefined();
    }
  });
});

describe('getSiteAvailabilityStatus', () => {
  it('should return "full" when all jobs are filled', () => {
    const site = MOCK_SITES.find((s) =>
      s.jobs.every((j) => j.filledCount >= j.headcount),
    );
    if (site) {
      expect(getSiteAvailabilityStatus(site)).toBe('full');
    }
  });

  it('should return "available" for a site with many open spots', () => {
    const openSite = {
      ...MOCK_SITES[0],
      jobs: [
        {
          ...MOCK_SITES[0].jobs[0],
          headcount: 10,
          filledCount: 0,
        },
      ],
    };
    expect(getSiteAvailabilityStatus(openSite)).toBe('available');
  });

  it('should return "limited" for a site that is nearly full', () => {
    const limitedSite = {
      ...MOCK_SITES[0],
      jobs: [
        {
          ...MOCK_SITES[0].jobs[0],
          headcount: 10,
          filledCount: 8,
        },
      ],
    };
    expect(getSiteAvailabilityStatus(limitedSite)).toBe('limited');
  });
});
