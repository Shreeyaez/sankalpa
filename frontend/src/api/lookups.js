import { lookupsAPI } from './axios';

class LookupService {
  constructor() {
    this.cache = {};
  }

  async fetchWithCache(key, fetchFn) {
    if (this.cache[key]) {
      return this.cache[key];
    }
    try {
      const response = await fetchFn();
      this.cache[key] = response.data;
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      return [];
    }
  }

  async getAllLookups() {
    try {
      const [
        priorityLevels,
        projectTypes,
        roadTypes,
        delayTypes,
        alertTypes,
        budgetSources,
        fiscalYears,
      ] = await Promise.all([
        this.fetchWithCache('priorityLevels', lookupsAPI.priorityLevels),
        this.fetchWithCache('projectTypes', lookupsAPI.projectTypes),
        this.fetchWithCache('roadTypes', lookupsAPI.roadTypes),
        this.fetchWithCache('delayTypes', lookupsAPI.delayTypes),
        this.fetchWithCache('alertTypes', lookupsAPI.alertTypes),
        this.fetchWithCache('budgetSources', lookupsAPI.budgetSources),
        this.fetchWithCache('fiscalYears', lookupsAPI.fiscalYears),
      ]);

      return {
        priorityLevels,
        projectTypes,
        roadTypes,
        delayTypes,
        alertTypes,
        budgetSources,
        fiscalYears,
      };
    } catch (error) {
      console.error('Error fetching all lookups:', error);
      return {
        priorityLevels: [],
        projectTypes: [],
        roadTypes: [],
        delayTypes: [],
        alertTypes: [],
        budgetSources: [],
        fiscalYears: [],
      };
    }
  }

  clearCache() {
    this.cache = {};
  }
}

export const lookupService = new LookupService();