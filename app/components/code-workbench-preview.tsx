import {
  Braces,
  Check,
  FileCode2,
  GitCompareArrows,
  RotateCcw,
  Save,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { codeChanges } from "../lib/demo-data";
import type { CodeChange, Requirement } from "../lib/types";

type WorkbenchMode = "code" | "diff";

const sourceByFile: Record<string, string> = {
  "src/features/roles/RolePanel.tsx": `import { RoleActions } from "./RoleActions";
import { useRolePermissions } from "./useRolePermissions";

export function RolePanel({ activeProject, member }) {
  const permissions = useRolePermissions(activeProject.id);
  const canEdit = permissions.includes("role:write");

  return (
    <RoleActions
      member={member}
      projectId={activeProject.id}
      disabled={!canEdit}
    />
  );
}`,
  "src/features/roles/useRolePermissions.ts": `export function useRolePermissions(projectId: string) {
  const session = useProjectSession(projectId);

  return session.role === "project-admin"
    ? ["role:read", "role:write", "audit:read"]
    : ["role:read"];
}`,
  "src/features/roles/RolePanel.test.tsx": `describe("RolePanel", () => {
  it("allows a project admin to edit roles", () => {
    renderRolePanel({ role: "project-admin" });
    expect(screen.getByRole("button", { name: "修改角色" }))
      .toBeEnabled();
  });

  it("keeps observers read-only", () => {
    renderRolePanel({ role: "observer" });
    expect(screen.getByRole("button", { name: "修改角色" }))
      .toBeDisabled();
  });
});`,
  "src/services/permissions/role-service.ts": `export async function updateProjectRole(input: UpdateRoleInput) {
  await assertProjectPermission(input.actorId, input.projectId, "role:write");
  const before = await members.find(input.projectId, input.memberId);

  return transaction(async (tx) => {
    const member = await members.updateRole(input, tx);
    await auditLogs.recordRoleChange(before, member, input.actorId, tx);
    return member;
  });
}`,
  "src/routes/project-members.ts": `router.patch("/:projectId/members/:memberId/role", async (request, reply) => {
  const member = await updateProjectRole({
    ...request.params,
    actorId: request.session.userId,
    role: request.body.role,
  });

  return reply.code(200).send(member);
});`,
  "src/repositories/role-audit-repository.ts": `export async function recordRoleChange(before, after, actorId, tx) {
  return tx.roleAuditLogs.create({
    projectId: after.projectId,
    memberId: after.memberId,
    beforeRole: before.role,
    afterRole: after.role,
    actorId,
  });
}`,
};

const diffByFile: Record<string, Array<{ kind: "added" | "removed" | "neutral"; text: string }>> = {
  "src/features/roles/RolePanel.tsx": [
    { kind: "removed", text: "const canEdit = isAdmin;" },
    { kind: "added", text: "const canEdit = permissions.includes(\"role:write\");" },
    { kind: "added", text: "const scope = activeProject.id;" },
    { kind: "neutral", text: "return <RoleActions disabled={!canEdit} />;" },
  ],
  "src/features/roles/useRolePermissions.ts": [
    { kind: "added", text: "export function useRolePermissions(projectId: string) {" },
    { kind: "added", text: "  const session = useProjectSession(projectId);" },
    { kind: "added", text: "  return resolvePermissions(session.role);" },
    { kind: "added", text: "}" },
  ],
  "src/features/roles/RolePanel.test.tsx": [
    { kind: "added", text: "it(\"allows project admins to edit roles\", () => {" },
    { kind: "added", text: "  renderRolePanel({ role: \"project-admin\" });" },
    { kind: "added", text: "  expect(editButton).toBeEnabled();" },
    { kind: "added", text: "});" },
  ],
  "src/services/permissions/role-service.ts": [
    { kind: "removed", text: "return members.updateRole(input);" },
    { kind: "added", text: "await assertProjectPermission(input.actorId, input.projectId, \"role:write\");" },
    { kind: "added", text: "return transaction(async (tx) => {" },
    { kind: "added", text: "  const member = await members.updateRole(input, tx);" },
    { kind: "added", text: "  await auditLogs.recordRoleChange(before, member, input.actorId, tx);" },
    { kind: "neutral", text: "  return member;" },
  ],
  "src/routes/project-members.ts": [
    { kind: "added", text: "router.patch(\"/:projectId/members/:memberId/role\", async (request, reply) => {" },
    { kind: "added", text: "  const member = await updateProjectRole(toRoleInput(request));" },
    { kind: "added", text: "  return reply.code(200).send(member);" },
    { kind: "added", text: "});" },
  ],
  "src/repositories/role-audit-repository.ts": [
    { kind: "added", text: "await tx.roleAuditLogs.create({" },
    { kind: "added", text: "  projectId, memberId, beforeRole, afterRole, actorId" },
    { kind: "added", text: "});" },
  ],
};

const backendChanges: CodeChange[] = [
  { id: "backend-role-service", requirementId: "role-permissions", taskId: "dev-audit-api", file: "src/services/permissions/role-service.ts", additions: 31, deletions: 4, rationale: "在事务中完成项目权限校验、角色更新和审计记录" },
  { id: "backend-member-route", requirementId: "role-permissions", taskId: "dev-audit-api", file: "src/routes/project-members.ts", additions: 22, deletions: 1, rationale: "增加成员角色变更接口并返回更新后的资源" },
  { id: "backend-audit-repository", requirementId: "role-permissions", taskId: "dev-audit-api", file: "src/repositories/role-audit-repository.ts", additions: 28, deletions: 0, rationale: "持久化变更前后角色与操作者，满足审计要求" },
];

function fileName(path: string) {
  return path.split("/").at(-1) ?? path;
}

export function CodeWorkbenchPreview({
  canEdit,
  initialMode,
  requirement,
}: {
  agentId: string;
  canEdit: boolean;
  initialMode: WorkbenchMode;
  requirement: Requirement | null;
}) {
  const changes = useMemo(
    () => [...codeChanges, ...backendChanges]
      .filter((change) => change.requirementId === requirement?.id),
    [requirement?.id],
  );
  const [mode, setMode] = useState<WorkbenchMode>(initialMode);
  useEffect(() => { setMode(initialMode); }, [initialMode]);
  const [selectedFile, setSelectedFile] = useState(changes[0]?.file ?? "");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savedDrafts, setSavedDrafts] = useState<Record<string, string>>({});
  const [savedFile, setSavedFile] = useState<string | null>(null);

  if (!requirement || changes.length === 0) {
    return <div className="empty-preview">当前需求暂无可查看的代码文件。</div>;
  }

  const activeFile = changes.find((change) => change.file === selectedFile) ?? changes[0];
  const original = sourceByFile[activeFile.file] ?? "// 当前文件内容已从代码仓库载入。";
  const savedSource = savedDrafts[activeFile.file] ?? original;
  const draft = drafts[activeFile.file] ?? savedSource;
  const dirty = draft !== savedSource;
  const diffLines = diffByFile[activeFile.file] ?? [];

  const resetDraft = () => {
    setDrafts((current) => ({ ...current, [activeFile.file]: savedSource }));
    setSavedFile(null);
  };

  return (
    <section className="code-workbench" aria-label="代码查看与编辑">
      <div className="code-workbench-toolbar">
        <div>
          <span>customer-portal</span>
          <b>feature/role-permissions</b>
        </div>
        <span className="workbench-context">{requirement.code} · 对话上下文已连接</span>
      </div>

      <div className="code-workbench-tabs" role="tablist" aria-label="代码视图">
        <button
          aria-selected={mode === "code"}
          className={mode === "code" ? "active" : ""}
          onClick={() => setMode("code")}
          role="tab"
          type="button"
        >
          <FileCode2 size={14} />代码
        </button>
        <button
          aria-selected={mode === "diff"}
          className={mode === "diff" ? "active" : ""}
          onClick={() => setMode("diff")}
          role="tab"
          type="button"
        >
          <GitCompareArrows size={14} />Diff
          <span>{changes.length}</span>
        </button>
      </div>

      <div className="code-workbench-main">
        <nav className="code-file-tree" aria-label="代码文件">
          <div className="file-tree-heading">变更文件</div>
          {changes.map((change) => (
            <button
              className={change.file === activeFile.file ? "active" : ""}
              key={change.id}
              onClick={() => {
                setSelectedFile(change.file);
                setSavedFile(null);
              }}
              type="button"
            >
              <Braces size={13} />
              <span>{fileName(change.file)}</span>
              <small>M</small>
            </button>
          ))}
        </nav>

        <div className="code-editor-pane">
          <div className="code-editor-heading">
            <span><Braces size={14} />{activeFile.file}</span>
            {mode === "code" && (
              <div>
                <button disabled={!canEdit || !dirty} onClick={resetDraft} type="button">
                  <RotateCcw size={13} />撤销
                </button>
                <button
                  className="save-code"
                  disabled={!canEdit || !dirty}
                  onClick={() => {
                    setSavedDrafts((current) => ({
                      ...current,
                      [activeFile.file]: draft,
                    }));
                    setSavedFile(activeFile.file);
                  }}
                  type="button"
                >
                  <Save size={13} />保存
                </button>
              </div>
            )}
          </div>

          {mode === "code" ? (
            <textarea
              aria-label={`编辑 ${fileName(activeFile.file)}`}
              onChange={(event) => {
                setDrafts((current) => ({
                  ...current,
                  [activeFile.file]: event.target.value,
                }));
                setSavedFile(null);
              }}
              readOnly={!canEdit}
              spellCheck={false}
              value={draft}
            />
          ) : (
            <div className="workbench-diff-code" aria-label={`${fileName(activeFile.file)} 代码差异`}>
              {diffLines.map((line, index) => (
                <div className={`diff-line ${line.kind}`} key={`${line.text}-${index}`}>
                  <span>{line.kind === "added" ? "+" : line.kind === "removed" ? "−" : " "}</span>
                  <code>{line.text}</code>
                </div>
              ))}
            </div>
          )}

          {mode === "code" && (
            <div className={`code-save-status ${savedFile === activeFile.file ? "saved" : ""}`}>
              {savedFile === activeFile.file ? (
                <><Check size={13} />已保存，对话已获得本次手动修改</>
              ) : dirty ? (
                "有未保存的手动修改"
              ) : (
                "代码区用于辅助查看和微调，主要开发操作仍通过对话完成"
              )}
            </div>
          )}
        </div>
      </div>

      {mode === "diff" && (
        <div className="workbench-diff-summary">
          <div>
            <b>AI 修改说明</b>
            <span>{activeFile.rationale}</span>
          </div>
          <p><strong>+{activeFile.additions}</strong><em>−{activeFile.deletions}</em></p>
          <button type="button">在对话中继续调整</button>
        </div>
      )}
    </section>
  );
}
