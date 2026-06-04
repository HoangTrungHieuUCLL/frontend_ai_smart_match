export interface Job {
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
    compatibility_score: number | null;
}

export interface JobCreatePayload {
    company_name: string;
    position: string;
    date: string;
    location: string;
    type: string;
    overview: string;
    responsibilities: string;
    requirements: string;
    offers: string;
    salary: string | null;
    notes: string | null;
    requirements_simplified: string;
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
