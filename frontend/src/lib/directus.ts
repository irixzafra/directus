import { createDirectus, rest, authentication, readItems, readItem, createItem, updateItem, deleteItem, readMe, aggregate } from '@directus/sdk';

// Types for our collections
export interface Candidate {
  id: string;
  email: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  linkedin_url: string | null;
  current_company: string | null;
  current_title: string | null;
  location: string | null;
  years_experience: number | null;
  skills: string[] | null;
  rating: number | null;
  ai_score: number | null;
  source: string | null;
  created_at: string;
}

export interface JobOffer {
  id: string;
  title: string;
  description: string | null;
  department: string | null;
  location: string | null;
  location_type: string;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
  status: string;
  created_at: string;
}

export interface Application {
  id: string;
  candidate_id: string | Candidate;
  job_offer_id: string | JobOffer;
  pipeline_stage_id: string | PipelineStage;
  status: string;
  match_score: number | null;
  rating: number | null;
  applied_at: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  slug: string;
  color: string;
  stage_order: number;
  stage_type: string;
}

export interface Company {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  company_size: string | null;
  website: string | null;
  status: string;
  created_at: string;
}

export interface Contact {
  id: string;
  email: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  job_title: string | null;
  company_id: string | Company;
  is_primary: boolean;
  created_at: string;
}

export interface Opportunity {
  id: string;
  name: string;
  company_id: string | Company;
  contact_id: string | Contact;
  value: number | null;
  stage: string;
  probability: number;
  expected_close_date: string | null;
  created_at: string;
}

export interface DirectusUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar: string | null;
  role: string;
}

// Schema definition
export interface Schema {
  candidates: Candidate[];
  job_offers: JobOffer[];
  applications: Application[];
  pipeline_stages: PipelineStage[];
  companies: Company[];
  contacts: Contact[];
  opportunities: Opportunity[];
  directus_users: DirectusUser[];
}

// Create Directus client
const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

export const directus = createDirectus<Schema>(directusUrl)
  .with(authentication('json'))
  .with(rest());

// Auth helpers
export const login = async (email: string, password: string) => {
  return directus.login({ email, password });
};

export const logout = async () => {
  return directus.logout();
};

export const getMe = async () => {
  return directus.request(readMe());
};

export const refreshToken = async () => {
  return directus.refresh();
};

// Generic CRUD helpers
export const getItems = <T extends keyof Schema>(
  collection: T,
  options?: Record<string, any>
): Promise<Schema[T]> => {
  return directus.request(readItems(collection, options as any)) as Promise<Schema[T]>;
};

export const getItem = <T extends keyof Schema>(
  collection: T,
  id: string,
  options?: Record<string, any>
): Promise<Schema[T][number]> => {
  return directus.request(readItem(collection, id, options as any)) as Promise<Schema[T][number]>;
};

export const createItemHelper = <T extends keyof Schema>(
  collection: T,
  data: Partial<Schema[T][number]>
) => {
  return directus.request(createItem(collection, data as any));
};

export const updateItemHelper = <T extends keyof Schema>(
  collection: T,
  id: string,
  data: Partial<Schema[T][number]>
) => {
  return directus.request(updateItem(collection, id, data as any));
};

export const deleteItemHelper = <T extends keyof Schema>(
  collection: T,
  id: string
) => {
  return directus.request(deleteItem(collection, id));
};

// Aggregate helper
export const getAggregate = <T extends keyof Schema>(
  collection: T,
  options: Record<string, any>
) => {
  return directus.request(aggregate(collection, options as any));
};
