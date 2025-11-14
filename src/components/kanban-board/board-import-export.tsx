import { Button, Menu, Group } from "@mantine/core";
import {
  IconChevronDown,
  IconDownload,
  IconUpload,
  IconFileTypeJs,
  IconFileTypeCsv,
  IconFileTypeTxt,
} from "@tabler/icons-react";
import { useProjectStore } from "@/stores/projectStore";
import { useProjectTasks, useGetTeamMembers } from "@/hooks/project";
import { useGetMe } from "@/hooks/user";
import { queryClient } from "@/services/queryClient";
import { notifications } from "@mantine/notifications";

// === Utility chọn file ===
async function pickFile(accept: string[]) {
  return new Promise<File | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept.join(",");
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      resolve(file);
    };
    input.click();
  });
}

export function TaskImportExport() {
  const { currentProjectId } = useProjectStore();
  const { data: tasks } = useProjectTasks(currentProjectId);
  const { data: members } = useGetTeamMembers();
  const { data: me } = useGetMe();

  // === EXPORT HANDLERS ===
  const handleExportJSON = () => {
    const exportData = { projectId: currentProjectId, tasks, members };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `project_${currentProjectId}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
    notifications.show({
      title: "Export successful",
      message: "Exported project data as JSON ✅",
      color: "green",
    });
  };

  const handleExportCSV = () => {
    if (!tasks || tasks.length === 0) {
      notifications.show({
        title: "No data",
        message: "No tasks available to export",
        color: "yellow",
      });
      return;
    }

    const header = "id,title,status,assigneeId\n";
    const csv =
      header +
      tasks
        .map(
          (t: any) =>
            `${t.id},${t.title},${t.status},${t.assigneeId ?? "unassigned"}`
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `project_${currentProjectId}_tasks.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notifications.show({
      title: "Export successful",
      message: "Exported tasks as CSV ✅",
      color: "green",
    });
  };

  const handleExportMarkdown = () => {
    const md =
      `# Project ${currentProjectId}\n\n` +
      `**Exported by:** ${me?.name ?? "Unknown"}\n\n` +
      "## Tasks\n" +
      (tasks?.map((t: any) => `- [${t.status}] ${t.title}`).join("\n") ?? "") +
      "\n\n## Team Members\n" +
      (members?.map((m: any) => `- ${m.user.name} (${m.role})`).join("\n") ??
        "");

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `project_${currentProjectId}.md`;
    a.click();
    URL.revokeObjectURL(url);
    notifications.show({
      title: "Export successful",
      message: "Exported as Markdown ✅",
      color: "green",
    });
  };

  // === IMPORT HANDLERS ===
  const handleImportJSON = async () => {
    const file = await pickFile(["application/json"]);
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);

      // Gửi data lên API (tuỳ backend của bạn)
      console.log("Imported JSON:", imported);

      notifications.show({
        title: "Import successful",
        message: `Imported ${imported.tasks?.length ?? 0} tasks and ${
          imported.members?.length ?? 0
        } members`,
        color: "green",
      });

      queryClient.invalidateQueries(); // refresh toàn bộ cache
    } catch (err) {
      notifications.show({
        title: "Import failed",
        message: "Invalid file format or content",
        color: "red",
      });
    }
  };

  const handleImportCSV = async () => {
    const file = await pickFile(["text/csv"]);
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.trim().split("\n").slice(1); // bỏ header
      const importedTasks = lines.map((line) => {
        const [id, title, status, assigneeId] = line.split(",");
        return { id, title, status, assigneeId };
      });

      console.log("Imported CSV tasks:", importedTasks);

      notifications.show({
        title: "Import successful",
        message: `Imported ${importedTasks.length} tasks from CSV`,
        color: "green",
      });

      queryClient.invalidateQueries();
    } catch (err) {
      notifications.show({
        title: "Import failed",
        message: "Invalid CSV format",
        color: "red",
      });
    }
  };

  return (
    <Menu shadow="md" width={220}>
      <Menu.Target>
        <Button
          variant="outline"
          size="sm"
          rightSection={<IconChevronDown size={16} />}
          className="hidden lg:flex gap-2"
        >
          Import / Export
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {/* Export section */}
        <Menu.Label>
          <Group gap={6}>
            <IconDownload size={16} />
            Export
          </Group>
        </Menu.Label>
        <Menu.Item onClick={handleExportJSON}>
          <div className="flex items-center">
            <IconFileTypeJs size={16} style={{ marginRight: 8 }} />
            Export as JSON
          </div>
        </Menu.Item>
        <Menu.Item onClick={handleExportCSV}>
          <div className="flex items-center">
            <IconFileTypeCsv size={16} style={{ marginRight: 8 }} />
            Export as CSV
          </div>
        </Menu.Item>
        <Menu.Item onClick={handleExportMarkdown}>
          <div className="flex items-center">
            <IconFileTypeTxt size={16} style={{ marginRight: 8 }} />
            Export as Markdown
          </div>
        </Menu.Item>

        <Menu.Divider />

        {/* Import section */}
        <Menu.Label>
          <Group gap={6}>
            <IconUpload size={16} />
            Import
          </Group>
        </Menu.Label>
        <Menu.Item onClick={handleImportJSON}>
          <div className="flex items-center">
            <IconFileTypeJs size={16} style={{ marginRight: 8 }} />
            Import from JSON
          </div>
        </Menu.Item>
        <Menu.Item onClick={handleImportCSV}>
          <div className="flex items-center">
            <IconFileTypeCsv size={16} style={{ marginRight: 8 }} />
            Import from CSV
          </div>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
