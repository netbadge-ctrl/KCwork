import {
  Check,
  GitBranch,
  Palette,
  Puzzle,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";

export type ProductToolSettingsKind = "prototype" | "prd";

export function ProductToolSettings({
  kind,
  canEdit,
  onClose,
}: {
  kind: ProductToolSettingsKind;
  canEdit: boolean;
  onClose(): void;
}) {
  const [figmaConnected, setFigmaConnected] = useState(false);
  const [repositoryConnected, setRepositoryConnected] = useState(true);
  const [repository, setRepository] = useState("customer-portal-web");
  const [componentLibrary, setComponentLibrary] = useState("Ant Design 5");
  const [framework, setFramework] = useState("React + Vite");
  const [prdSkill, setPrdSkill] = useState("企业系统 PRD Writer");
  const [useProjectKnowledge, setUseProjectKnowledge] = useState(true);
  const [usePrototypeContext, setUsePrototypeContext] = useState(true);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <section className="product-tool-settings" aria-label={`${kind === "prototype" ? "原型" : "PRD"}工具设置`}>
      <header>
        <div>
          <span><Settings size={13} /> 工具设置</span>
          <h3>{kind === "prototype" ? "原型工具" : "PRD 工具"}</h3>
          <p>{kind === "prototype" ? "配置原型生成、设计稿同步与前端实现偏好。" : "配置产品文档的生成能力与默认上下文。"}</p>
        </div>
        <button aria-label="关闭工具设置" className="icon-button" onClick={onClose} type="button"><X size={16} /></button>
      </header>

      <div className="product-tool-settings-body">
        {kind === "prototype" ? (
          <>
            <div className="tool-settings-section">
              <div className="tool-settings-section-title"><span>授权与连接</span><small>仅用于当前企业工作空间</small></div>
              <article className="tool-connection-card">
                <span className="tool-connection-icon figma"><Palette size={16} /></span>
                <div><b>Figma</b><small>{figmaConnected ? "已授权 · 可导入与同步设计稿" : "导入历史设计稿并回写原型版本"}</small></div>
                <button className={figmaConnected ? "connected" : ""} disabled={!canEdit} onClick={() => setFigmaConnected((value) => !value)} type="button">{figmaConnected ? <><Check size={12} />已授权</> : "授权对接"}</button>
              </article>
              <article className="tool-connection-card">
                <span className="tool-connection-icon repository"><GitBranch size={16} /></span>
                <div><b>代码仓库</b><small>{repositoryConnected ? "GitHub 已授权 · 可读取组件与工程结构" : "连接仓库以复用真实组件和样式"}</small></div>
                <button className={repositoryConnected ? "connected" : ""} disabled={!canEdit} onClick={() => setRepositoryConnected((value) => !value)} type="button">{repositoryConnected ? <><Check size={12} />已授权</> : "授权对接"}</button>
              </article>
            </div>

            <div className="tool-settings-section">
              <div className="tool-settings-section-title"><span>默认生成环境</span><small>新原型默认采用，可在单次任务中覆盖</small></div>
              <label className="tool-settings-field">
                <span>默认代码仓库</span>
                <select disabled={!canEdit || !repositoryConnected} onChange={(event) => setRepository(event.target.value)} value={repository}>
                  <option value="customer-portal-web">customer-portal-web</option>
                  <option value="design-system">enterprise-design-system</option>
                  <option value="none">不绑定默认仓库</option>
                </select>
                <small>Agent 会优先读取仓库中的组件、Token 与页面结构。</small>
              </label>
              <div className="tool-settings-grid">
                <label className="tool-settings-field">
                  <span><Puzzle size={12} /> 前端组件</span>
                  <select disabled={!canEdit} onChange={(event) => setComponentLibrary(event.target.value)} value={componentLibrary}>
                    <option>Ant Design 5</option>
                    <option>Arco Design</option>
                    <option>shadcn/ui</option>
                    <option>Material UI</option>
                    <option>使用仓库现有组件</option>
                  </select>
                </label>
                <label className="tool-settings-field">
                  <span>默认框架</span>
                  <select disabled={!canEdit} onChange={(event) => setFramework(event.target.value)} value={framework}>
                    <option>React + Vite</option>
                    <option>Next.js</option>
                    <option>Vue 3 + Vite</option>
                    <option>Nuxt</option>
                    <option>静态 HTML</option>
                  </select>
                </label>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="tool-settings-section">
              <div className="tool-settings-section-title"><span>PRD 生成 Skill</span><small>决定默认文档结构与写作规则</small></div>
              <div className="prd-skill-options">
                {[{
                  name: "企业系统 PRD Writer",
                  detail: "适合权限、流程和中后台系统，强调边界与异常处理。",
                }, {
                  name: "精益需求说明",
                  detail: "适合快速迭代，聚焦目标、范围、方案和验收条件。",
                }, {
                  name: "标准产品需求文档",
                  detail: "通用 PRD 章节结构，适合跨团队评审与归档。",
                }].map((skill) => (
                  <label className={prdSkill === skill.name ? "selected" : ""} key={skill.name}>
                    <input checked={prdSkill === skill.name} disabled={!canEdit} name="prd-skill" onChange={() => setPrdSkill(skill.name)} type="radio" />
                    <span className="skill-option-icon"><Sparkles size={14} /></span>
                    <span><b>{skill.name}</b><small>{skill.detail}</small></span>
                    {prdSkill === skill.name && <Check size={14} />}
                  </label>
                ))}
              </div>
              <button className="skill-market-link" type="button"><Sparkles size={13} /> 从智能资产选择其他 Skill</button>
            </div>

            <div className="tool-settings-section">
              <div className="tool-settings-section-title"><span>默认生成上下文</span><small>Agent 每次按需检索，不会一次性加载全部资料</small></div>
              <label className="tool-settings-toggle">
                <span><b>检索项目知识库</b><small>引用项目规范、历史需求与领域知识</small></span>
                <input checked={useProjectKnowledge} disabled={!canEdit} onChange={(event) => setUseProjectKnowledge(event.target.checked)} type="checkbox" />
              </label>
              <label className="tool-settings-toggle">
                <span><b>关联当前原型</b><small>生成或修订 PRD 时使用原型页面与组件信息</small></span>
                <input checked={usePrototypeContext} disabled={!canEdit} onChange={(event) => setUsePrototypeContext(event.target.checked)} type="checkbox" />
              </label>
            </div>
          </>
        )}
      </div>

      <footer>
        <span>{saved ? <><Check size={12} /> 设置已保存</> : "仅影响后续新执行，不改写已有版本"}</span>
        <button disabled={!canEdit} onClick={save} type="button">保存设置</button>
      </footer>
    </section>
  );
}
