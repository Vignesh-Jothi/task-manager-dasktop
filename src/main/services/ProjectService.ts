import { v4 as uuidv4 } from "uuid";
import { FileSystemService } from "./FileSystemService";
import { Project, ProjectIndex } from "../../types";

export class ProjectService {
  private fileSystemService: FileSystemService;
  private readonly filename = "projects.json";

  constructor(fileSystemService: FileSystemService) {
    this.fileSystemService = fileSystemService;
  }

  initialize(): void {
    const existing = this.fileSystemService.loadConfig(this.filename);
    if (!existing) {
      const empty: ProjectIndex = {
        projects: {},
        lastUpdated: new Date().toISOString(),
      };
      // Seed with default project
      const defaultProject: Project = {
        id: uuidv4(),
        name: "General",
        createdAt: new Date().toISOString(),
      };
      empty.projects[defaultProject.id] = defaultProject;
      this.fileSystemService.saveConfig(this.filename, empty);
    }
  }

  private loadIndex(): ProjectIndex {
    const data = this.fileSystemService.loadConfig(this.filename);
    if (!data) {
      return { projects: {}, lastUpdated: new Date().toISOString() };
    }
    return data as ProjectIndex;
  }

  private saveIndex(index: ProjectIndex): void {
    index.lastUpdated = new Date().toISOString();
    this.fileSystemService.saveConfig(this.filename, index);
  }

  getAllProjects(): Project[] {
    const index = this.loadIndex();
    return Object.values(index.projects).filter((p) => !p.archived);
  }

  createProject(name: string, color?: string): Project {
    const index = this.loadIndex();
    const project: Project = {
      id: uuidv4(),
      name: name.trim(),
      color,
      createdAt: new Date().toISOString(),
    };
    index.projects[project.id] = project;
    this.saveIndex(index);
    return project;
  }

  updateProject(id: string, updates: Partial<Project>): Project | null {
    const index = this.loadIndex();
    const existing = index.projects[id];
    if (!existing) return null;
    const updated: Project = { ...existing, ...updates };
    index.projects[id] = updated;
    this.saveIndex(index);
    return updated;
  }

  archiveProject(id: string): boolean {
    const index = this.loadIndex();
    const existing = index.projects[id];
    if (!existing) return false;
    existing.archived = true;
    index.projects[id] = existing;
    this.saveIndex(index);
    return true;
  }

  deleteProject(id: string): boolean {
    const index = this.loadIndex();
    const existing = index.projects[id];
    if (!existing) return false;
    delete index.projects[id];
    this.saveIndex(index);
    return true;
  }
}

export default ProjectService;
