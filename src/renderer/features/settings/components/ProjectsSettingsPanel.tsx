import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Project } from "../../../../types";

const ProjectsSettingsPanel: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectColor, setNewProjectColor] = useState("#4f46e5");
  const [isSaving, setIsSaving] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState("#4f46e5");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const items = await (window as any).api.getAllProjects();
      setProjects(items);
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  };

  const handleCreate = async () => {
    if (!newProjectName.trim()) return;
    setIsSaving(true);
    try {
      await (window as any).api.createProject(
        newProjectName.trim(),
        newProjectColor
      );
      setNewProjectName("");
      await loadProjects();
    } catch (err) {
      console.error("Failed to create project", err);
      alert("Failed to create project");
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (p: Project) => {
    setEditingProjectId(p.id);
    setEditingName(p.name);
    setEditingColor(p.color || "#4f46e5");
  };

  const cancelEdit = () => {
    setEditingProjectId(null);
    setEditingName("");
    setEditingColor("#4f46e5");
  };

  const saveEdit = async () => {
    if (!editingProjectId) return;
    try {
      await (window as any).api.updateProject(editingProjectId, {
        name: editingName.trim(),
        color: editingColor,
      });
      cancelEdit();
      await loadProjects();
    } catch (err) {
      console.error("Failed to update project", err);
      alert("Failed to update project");
    }
  };

  const deleteProject = async (id: string) => {
    if (
      !confirm(
        "Delete this project? Tasks referencing it will keep the old id."
      )
    )
      return;
    try {
      await (window as any).api.deleteProject(id);
      await loadProjects();
    } catch (err) {
      console.error("Failed to delete project", err);
      alert("Failed to delete project");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-[220px] space-y-2">
              <label className="text-sm font-medium">New Project Name</label>
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g. Marketing Launch"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <Input
                type="color"
                value={newProjectColor}
                onChange={(e) => setNewProjectColor(e.target.value)}
                className="h-10 w-16 p-1"
              />
            </div>
            <Button onClick={handleCreate} disabled={isSaving}>
              {isSaving ? "Saving..." : "Add"}
            </Button>
          </div>
          <div className="space-y-2">
            {projects.length === 0 && (
              <p className="text-sm text-[color:var(--text-muted)]">
                No projects yet.
              </p>
            )}
            {projects.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-3 py-2 rounded border border-[color:var(--text-muted)]/20 bg-[var(--bg-card)]"
              >
                {editingProjectId === p.id ? (
                  <div className="flex-1 flex items-center gap-3">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="color"
                      value={editingColor}
                      onChange={(e) => setEditingColor(e.target.value)}
                      className="h-8 w-10 p-1"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-block h-4 w-4 rounded"
                      style={{ background: p.color || "#4f46e5" }}
                    />
                    <span className="text-sm">
                      {p.name}
                      {p.archived && (
                        <span className="ml-2 text-xs text-[color:var(--text-muted)]">
                          (Archived)
                        </span>
                      )}
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  {editingProjectId === p.id ? (
                    <>
                      <Button size="sm" variant="outline" onClick={saveEdit}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(p)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteProject(p.id)}
                        className="text-red-500"
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[color:var(--text-muted)]">
            Deleting a project does not remove tasks; they retain their previous
            projectId for historical reference.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsSettingsPanel;
