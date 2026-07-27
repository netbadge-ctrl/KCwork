import { Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { productDocuments } from "../../lib/demo-data";
import type { WorkspaceRouterProps } from "./workspace-router";
import { WorkspaceEmptyState } from "./workspace-empty-state";

const outline = ["1. 背景与目标", "2. 用户与角色", "3. 功能流程", "4. 权限规则", "5. 验收标准"];

export function PrdWorkspace({
  requirement,
  documentDraft,
  onSaveDocumentDraft,
  canEdit,
}: WorkspaceRouterProps) {
  const [request, setRequest] = useState("");
  const document = productDocuments.find(
    (item) => item.requirementId === requirement.id && item.kind === "prd",
  );
  if (!document) {
    return (
      <section className="workspace-canvas prd-workspace">
        <div className="workspace-heading"><div><p className="eyebrow">Product document</p><h2>PRD 撰写工作台</h2><p>当前工作区只展示 {requirement.code} 的产物。</p></div></div>
        <WorkspaceEmptyState title="当前需求暂无 PRD 产物" detail="可以通过底部对话框要求 PRD 撰写 Agent 生成首版内容。" />
      </section>
    );
  }
  return (
    <section className="workspace-canvas prd-workspace">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">Product document · {requirement.specVersion}</p>
          <h2>PRD 撰写工作台</h2>
          <p>基于已确认原型、Spec 和项目记忆生成可追溯文档。</p>
        </div>
      </div>

      <div className="prd-layout">
        <aside className="document-outline">
          <strong>文档目录</strong>
          {outline.map((item, index) => <button className={index === 1 ? "active" : ""} key={item} type="button">{item}</button>)}
          <div className="document-version-card"><small>当前版本</small><b>{document.version}</b><span>已确认 · 有新修订</span></div>
        </aside>

        <article className="prd-editor">
          <header><span className="document-tag">产品需求文档</span><small>引用 7 项上下文</small></header>
          <h1>{requirement.title}</h1>
          <p className="document-meta">{requirement.code} · Spec {requirement.specVersion} · 陈楠 · {document.updatedAt}更新</p>
          <h2>2. 用户与角色</h2>
          <p>项目成员可以查看项目内全部需求、代码变更和测试资产。项目角色只控制可编辑内容，不制造上下文隔离。</p>
          <div className="prd-role-grid">
            <div><b>项目管理员</b><span>成员、配置与全部资产</span></div>
            <div><b>产品</b><span>需求、原型与产品文档</span></div>
            <div><b>研发</b><span>技术 Spec、任务与代码</span></div>
            <div><b>测试</b><span>用例、报告与缺陷</span></div>
          </div>
          <h2>5. 验收标准</h2>
          {["AC-07 角色变更必须进行权限校验", "AC-09 观察者只能查看项目内容", "AC-12 所有变更写入审计记录"].map((item) => <p className="check-line" key={item}><Check size={14} />{item}</p>)}
        </article>

        <aside className="prd-ai-panel">
          <div><Sparkles size={17} /><strong>通过对话修改</strong></div>
          <p>描述需要修改的章节或规则，Agent 会先生成修订建议。</p>
          <textarea
            aria-label="PRD 修改要求"
            disabled={!canEdit}
            onChange={(event) => setRequest(event.target.value)}
            placeholder="例如：补充批量修改角色时的确认规则"
            value={request}
          />
          <button
            className="primary-small"
            disabled={!canEdit || !request.trim()}
            onClick={() => {
              onSaveDocumentDraft(request.trim());
              setRequest("");
            }}
            type="button"
          >生成修订建议</button>
          {documentDraft && (
            <div className="revision-proposal">
              <span>修订建议 · 待确认</span>
              <p>{documentDraft}</p>
              <small>影响：权限规则、交互原型、AC-11 测试用例</small>
              <button disabled={!canEdit} onClick={() => onSaveDocumentDraft("")} type="button">确认并保存新版本</button>
            </div>
          )}
          <div className="revision-history"><small>修订记录</small><span>v1.4 · 角色边界调整</span><span>v1.3 · 增加审计要求</span></div>
        </aside>
      </div>
    </section>
  );
}
