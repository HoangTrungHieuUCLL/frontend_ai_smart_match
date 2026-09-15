export interface JobTaxonomyFields {
    category_l1?: string | null;
    category_l2?: string | null;
    category_l3?: string | null;
    experience_level?: string | null;
    seniority?: string | null;
    employment_type?: string | null;
    work_arrangement?: string | null;
    saturday_work?: string | null;
    work_schedule?: string | null;
    salary_min?: number | null;
    salary_max?: number | null;
    salary_unit?: string | null;
    salary_negotiable?: boolean | null;
    company_industry?: string | null;
    is_featured_employer?: boolean | null;
}

export interface Job extends JobTaxonomyFields {
    id: number;
    company_name: string;
    position: string;
    date: string;
    location: string;
    type: string;
    overview: string;
    responsibilities: string;
    requirements: string;
    offers: string;
    salary: string;
    notes: string;
    requirements_simplified?: string | null;
    compatibility_score: number | null;
}

export interface JobCreatePayload extends JobTaxonomyFields {
    company_name: string;
    position: string;
    date?: string | null;
    location?: string | null;
    type?: string | null;
    overview?: string | null;
    responsibilities?: string | null;
    requirements?: string | null;
    offers?: string | null;
    salary: string | null;
    notes: string | null;
    requirements_simplified?: string | null;
}

export interface JobFilterOptions {
    category_l2: string[];
    category_l3: string[];
    location: string[];
}

export interface CV {
    id: number;
    filename: string;
    uploaded_at: string;

    candidate_profile: Profile | null;
    compatibility_scores: CompatibilityScore[];
}

export interface Profile {
    id: number;
    cv_id: number | null;

    given_name: string;
    middle_name: string | null;
    family_name: string;
    current_title: string | null;
    skills: string | null;
    phone: string | null;
    location: string | null;
    email: string | null;
    bio: string | null;

    work_experiences: Experience[];
    educations: Education[];
    projects: Project[];
    languages: Language[];
    certifications: Certification[];
    compatibility_scores: CompatibilityScore[];
}

export interface Experience {
    id: number;
    profile_id: number;

    job_title: string | null;
    company_name: string | null;
    start_date: string | null;
    end_date: string | null;
}

export interface Education {
    id: number;
    profile_id: number;

    institution: string | null;
    degree: string | null;
    field_of_study: string | null;
    start_date: string | null;
    end_date: string | null;
}

export interface Project {
    id: number;
    profile_id: number;

    project_name: string | null;
    description: string | null;
}

export interface Language {
    id: number;
    profile_id: number;

    language_name: string | null;
    proficiency_level: string | null;
}

export interface Certification {
    id: number;
    profile_id: number;

    certification_name: string | null;
    issue_date: string | null;
}

export interface CompatibilityScore {
    id: number;
    profile_id: number;
    cv_id: number | null;

    score: number | null;
}
