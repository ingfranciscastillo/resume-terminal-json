/**
 * Typed loader for resume data.
 *
 * Swap the JSON below to change the entire portfolio — the file must follow
 * the JSON Resume schema: https://jsonresume.org/schema/
 */
import resumeData from "../data/resume.json";

export interface ResumeProfile {
  network: string;
  username: string;
  url: string;
}

export interface ResumeBasics {
  name: string;
  label?: string;
  email?: string;
  phone?: string;
  url?: string;
  summary?: string;
  location?: {
    address?: string;
    postalCode?: string;
    city?: string;
    countryCode?: string;
    region?: string;
  };
  profiles?: ResumeProfile[];
}

export interface ResumeWork {
  name: string;
  position: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
}

export interface ResumeEducation {
  institution: string;
  url?: string;
  area?: string;
  studyType?: string;
  startDate?: string;
  endDate?: string;
  score?: string;
  courses?: string[];
}

export interface ResumeSkill {
  name: string;
  level?: string;
  keywords?: string[];
}

export interface ResumeProject {
  name: string;
  description?: string;
  highlights?: string[];
  keywords?: string[];
  startDate?: string;
  endDate?: string;
  url?: string;
  roles?: string[];
  entity?: string;
  type?: string;
}

export interface ResumeCertificate {
  name: string;
  date?: string;
  issuer?: string;
  url?: string;
}

export interface ResumeLanguage {
  language: string;
  fluency?: string;
}

export interface Resume {
  basics: ResumeBasics;
  work?: ResumeWork[];
  education?: ResumeEducation[];
  skills?: ResumeSkill[];
  projects?: ResumeProject[];
  certificates?: ResumeCertificate[];
  languages?: ResumeLanguage[];
}

export const resume = resumeData as unknown as Resume;

/** Slug a project name into a stable identifier for `open <project>`. */
export const slug = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
