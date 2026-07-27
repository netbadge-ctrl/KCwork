import { useMemo, useState } from "react";
import type { AssetItem, AssetKind } from "../lib/types";

type FieldValue = string;
type FieldControl =
  | "text"
  | "url"
  | "password"
  | "textarea"
  | "select"
  | "segmented"
  | "multi";

interface FieldConfig {
  id: string;
  label: string;
  placeholder?: string;
  control?: FieldControl;
  options?: readonly string[];
  required?: boolean;
  hint?: string;
  wide?: boolean;
}

interface SectionConfig {
  title: string;
  description: string;
  fields: FieldConfig[];
}

interface AssetAddConfig {
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  submitLabel: string;
  primaryField: string;
  descriptionField?: string;
  sections: SectionConfig[];
}

export const assetAddConfigs: Record<AssetKind, AssetAddConfig> = {
  skill: {
    label: "Skill",
    eyebrow: "能力说明与触发规则",
    title: "添加 Skill",
    description: "安装可复用的任务能力，并明确哪些 Agent 在什么场景下调用。",
    submitLabel: "添加 Skill",
    primaryField: "skillName",
    descriptionField: "instruction",
    sections: [
      {
        title: "安装来源",
        description: "Skill 可以来自企业市场、Git 仓库或本地 SKILL.md。",
        fields: [
          { id: "installMethod", label: "添加方式", control: "segmented", options: ["企业市场", "Git 仓库", "本地文件"], required: true },
          { id: "source", label: "来源地址或 Skill ID", placeholder: "例：skills/product/prd-writing", required: true, wide: true },
          { id: "entryPath", label: "入口文件", placeholder: "例：SKILL.md", hint: "从 Git 仓库添加时可指定子目录" },
        ],
      },
      {
        title: "调用方式",
        description: "定义 Skill 的识别名称、触发说明和可使用范围。",
        fields: [
          { id: "skillName", label: "Skill 名称", placeholder: "例：PRD 专业写作", required: true },
          { id: "scope", label: "可见范围", control: "select", options: ["个人 Skill", "团队 Skill", "系统 Skill"], required: true },
          { id: "enabledAgents", label: "可调用 Agent", control: "multi", options: ["产品设计 Agent", "开发 Agent", "测试 Agent", "日常办公 Agent"], required: true, wide: true },
          { id: "instruction", label: "触发说明", control: "textarea", placeholder: "描述用户表达什么意图时应调用此 Skill，以及它会产出什么。", required: true, wide: true },
        ],
      },
    ],
  },
  plugin: {
    label: "插件",
    eyebrow: "插件市场与权限",
    title: "安装插件",
    description: "从企业插件市场安装能力包，确认版本、作用范围和敏感操作策略。",
    submitLabel: "安装插件",
    primaryField: "pluginName",
    descriptionField: "purpose",
    sections: [
      {
        title: "选择插件",
        description: "插件由管理员审核后进入企业市场，安装时不需要手填接口地址。",
        fields: [
          { id: "market", label: "插件来源", control: "segmented", options: ["企业插件市场", "私有插件包"], required: true },
          { id: "pluginName", label: "插件", control: "select", options: ["GitHub Enterprise", "Figma", "Jira", "企业测试平台", "企业云文档"], required: true },
          { id: "version", label: "版本", control: "select", options: ["使用最新稳定版", "跟随企业锁定版本", "指定版本"], required: true },
          { id: "purpose", label: "使用说明", placeholder: "例：读取代码、比较 Diff 并创建 Pull Request", required: true, wide: true },
        ],
      },
      {
        title: "安装与授权",
        description: "限定插件能在哪些空间生效，以及遇到外部写操作时如何确认。",
        fields: [
          { id: "installScope", label: "安装范围", control: "segmented", options: ["仅自己", "指定团队", "全企业"], required: true },
          { id: "permissionPolicy", label: "重要操作", control: "select", options: ["每次询问", "沿用企业默认", "仅管理员可执行"], required: true },
          { id: "capabilities", label: "启用能力", control: "multi", options: ["读取内容", "搜索与引用", "创建内容", "修改内容", "发送或发布"], required: true, wide: true },
        ],
      },
    ],
  },
  tool: {
    label: "MCP",
    eyebrow: "服务连接",
    title: "连接 MCP 服务",
    description: "配置服务协议、端点和凭据，并限定允许调用该服务的 Agent。",
    submitLabel: "保存并测试连接",
    primaryField: "serverName",
    descriptionField: "endpoint",
    sections: [
      {
        title: "服务端点",
        description: "填写由 MCP 服务提供方给出的连接信息。",
        fields: [
          { id: "serverName", label: "服务名称", placeholder: "例：企业需求平台 MCP", required: true },
          { id: "transport", label: "传输协议", control: "segmented", options: ["Streamable HTTP", "SSE", "stdio"], required: true },
          { id: "endpoint", label: "服务地址", control: "url", placeholder: "https://mcp.example.com/mcp", required: true, wide: true },
          { id: "timeout", label: "请求超时", control: "select", options: ["15 秒", "30 秒", "60 秒"], required: true },
        ],
      },
      {
        title: "鉴权与调用",
        description: "凭据仅用于连接测试，界面不会在资产卡片中展示。",
        fields: [
          { id: "authMethod", label: "鉴权方式", control: "select", options: ["无需鉴权", "Bearer Token", "OAuth 2.0", "自定义请求头"], required: true },
          { id: "credential", label: "凭据或密钥引用", control: "password", placeholder: "输入凭据，或填写企业密钥库引用" },
          { id: "allowedAgents", label: "允许调用的 Agent", control: "multi", options: ["产品设计 Agent", "开发 Agent", "测试 Agent", "日常办公 Agent"], required: true, wide: true },
        ],
      },
    ],
  },
  agent: {
    label: "Agent",
    eyebrow: "角色与能力组合",
    title: "创建 Agent",
    description: "定义一个面向具体工作职责的 Agent，并组合它可调用的模型与资产。",
    submitLabel: "创建 Agent",
    primaryField: "agentName",
    descriptionField: "roleGoal",
    sections: [
      {
        title: "角色定义",
        description: "Agent 应围绕稳定职责设计，而不是一次性的任务描述。",
        fields: [
          { id: "agentName", label: "Agent 名称", placeholder: "例：接口契约审查 Agent", required: true },
          { id: "model", label: "默认模型", control: "select", options: ["企业默认模型", "高推理模型", "快速执行模型"], required: true },
          { id: "roleGoal", label: "职责与目标", control: "textarea", placeholder: "说明它负责什么、交付什么，以及哪些事情不应自行决定。", required: true, wide: true },
          { id: "instructions", label: "核心指令", control: "textarea", placeholder: "填写稳定工作原则、输出格式与必须遵守的约束。", required: true, wide: true },
        ],
      },
      {
        title: "能力装配",
        description: "选择 Agent 可以使用的企业能力，运行时仍按用户和项目权限校验。",
        fields: [
          { id: "skills", label: "装配 Skill", control: "multi", options: ["PRD 专业写作", "Spec 开发", "代码审查", "测试用例设计"], wide: true },
          { id: "connections", label: "连接能力", control: "multi", options: ["GitHub 插件", "Figma 插件", "需求平台 MCP", "测试平台 MCP"], wide: true },
          { id: "projectScope", label: "可用范围", control: "segmented", options: ["个人", "指定项目", "全企业"], required: true },
        ],
      },
    ],
  },
  repository: {
    label: "代码库",
    eyebrow: "代码连接与索引",
    title: "连接代码库",
    description: "从代码托管平台选择仓库，设置基线分支和 Agent 可检索的索引范围。",
    submitLabel: "连接并开始索引",
    primaryField: "repository",
    descriptionField: "repositoryUrl",
    sections: [
      {
        title: "仓库连接",
        description: "使用已有的企业代码托管授权，不在这里填写账号密码。",
        fields: [
          { id: "provider", label: "代码托管平台", control: "segmented", options: ["GitHub Enterprise", "GitLab", "自建 Git"], required: true },
          { id: "credential", label: "企业连接", control: "select", options: ["研发中心 GitHub 连接", "基础平台 GitLab 连接", "新增企业连接"], required: true },
          { id: "repository", label: "组织 / 仓库", placeholder: "例：netbadge-ctrl/KCwork", required: true },
          { id: "repositoryUrl", label: "仓库地址", control: "url", placeholder: "https://github.com/org/repository", required: true, wide: true },
          { id: "branch", label: "基线分支", placeholder: "main", required: true },
        ],
      },
      {
        title: "索引规则",
        description: "控制 Agent 能看到哪些代码，以及何时刷新代码上下文。",
        fields: [
          { id: "indexScope", label: "索引内容", control: "multi", options: ["源码与符号", "README / Wiki", "提交历史", "Issue / PR"], required: true, wide: true },
          { id: "paths", label: "包含路径", placeholder: "例：apps/web, packages/shared；留空表示全部", wide: true },
          { id: "syncFrequency", label: "同步频率", control: "select", options: ["代码变更时", "每 30 分钟", "每天", "仅手动"], required: true },
        ],
      },
    ],
  },
  knowledge: {
    label: "知识库",
    eyebrow: "内容来源与权限继承",
    title: "创建知识库",
    description: "连接企业文档或代码 Wiki，明确同步范围、权限规则和可被引用的内容。",
    submitLabel: "创建并同步",
    primaryField: "knowledgeName",
    descriptionField: "contentScope",
    sections: [
      {
        title: "知识来源",
        description: "知识库是一组持续同步的来源，不需要用户手填文档数量。",
        fields: [
          { id: "knowledgeName", label: "知识库名称", placeholder: "例：产品与业务知识库", required: true },
          { id: "sourceType", label: "来源类型", control: "segmented", options: ["企业文档", "代码 Wiki", "网页与站点", "文件目录"], required: true },
          { id: "connector", label: "已授权连接", control: "select", options: ["企业云文档", "Confluence", "SharePoint", "GitHub Wiki", "新增连接"], required: true },
          { id: "contentScope", label: "空间、目录或页面范围", placeholder: "例：产品中心 / 已发布规范；支持添加多个范围", required: true, wide: true },
        ],
      },
      {
        title: "同步与使用",
        description: "Agent 的每次回答都会保留来源引用，并受原始内容权限约束。",
        fields: [
          { id: "permissionMode", label: "权限策略", control: "select", options: ["继承源系统权限", "仅指定团队可用", "全企业可用"], required: true },
          { id: "syncFrequency", label: "同步频率", control: "select", options: ["内容变更时", "每小时", "每天", "仅手动"], required: true },
          { id: "indexContent", label: "索引内容", control: "multi", options: ["正文", "附件", "评论", "历史版本", "页面关系"], required: true, wide: true },
        ],
      },
    ],
  },
  memory: {
    label: "记忆库",
    eyebrow: "多人记忆与治理",
    title: "创建记忆库",
    description: "定义哪些工作事实可以沉淀为共享记忆，以及如何确认、复核和失效。",
    submitLabel: "创建记忆空间",
    primaryField: "memoryName",
    descriptionField: "captureRule",
    sections: [
      {
        title: "记忆空间",
        description: "记忆不是文档备份，而是从工作过程提炼出的稳定事实和共同决策。",
        fields: [
          { id: "memoryName", label: "记忆库名称", placeholder: "例：客户门户项目记忆", required: true },
          { id: "scope", label: "生效范围", control: "segmented", options: ["项目", "团队", "企业"], required: true },
          { id: "contributors", label: "可贡献成员", control: "select", options: ["范围内全部成员", "指定角色", "仅维护人"], required: true },
          { id: "maintainers", label: "维护人与复核人", placeholder: "输入成员或项目角色", required: true, wide: true },
        ],
      },
      {
        title: "沉淀规则",
        description: "候选记忆在确认前不会影响 Agent，冲突内容会进入待复核。",
        fields: [
          { id: "sources", label: "允许的来源", control: "multi", options: ["Agent 对话", "需求评审", "代码与 ADR", "测试结论", "人工录入"], required: true, wide: true },
          { id: "captureRule", label: "候选记忆规则", control: "textarea", placeholder: "例：仅提炼已确认的范围、术语、架构决策和长期约束。", required: true, wide: true },
          { id: "confirmation", label: "生效方式", control: "select", options: ["至少 1 位维护人确认", "项目角色共同确认", "管理员确认"], required: true },
          { id: "reviewCycle", label: "复核周期", control: "select", options: ["每 30 天", "每季度", "需求完成时", "仅在冲突时"], required: true },
        ],
      },
    ],
  },
};

export interface AssetAddFormProps {
  kind: AssetKind;
  onAdd(asset: AssetItem): void;
  onCancel(): void;
}

const splitValues = (value = "") =>
  value.split("、").map((item) => item.trim()).filter(Boolean);

export function AssetAddForm({ kind, onAdd, onCancel }: AssetAddFormProps) {
  const config = assetAddConfigs[kind];
  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const requiredFields = useMemo(
    () => config.sections.flatMap((section) => section.fields).filter((field) => field.required),
    [config],
  );
  const canSubmit = requiredFields.every((field) => Boolean(values[field.id]?.trim()));

  const update = (id: string, value: string) =>
    setValues((current) => ({ ...current, [id]: value }));

  const toggleOption = (id: string, option: string) => {
    const current = splitValues(values[id]);
    const next = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option];
    update(id, next.join("、"));
  };

  const submit = () => {
    if (!canSubmit) return;
    const name = values[config.primaryField].trim();
    const description =
      values[config.descriptionField ?? ""]?.trim() ||
      `${config.label}配置已添加`;
    const metaByKind: Record<AssetKind, string> = {
      skill: `${values.scope} · ${values.installMethod}`,
      plugin: `${values.pluginName} · ${values.version}`,
      tool: `${values.transport} · ${values.authMethod}`,
      agent: values.model,
      repository: `${values.branch} · 开始索引`,
      knowledge: `${values.sourceType} · ${values.syncFrequency}`,
      memory: `${values.scope}记忆 · ${values.confirmation}`,
    };
    const statusByKind: Record<AssetKind, string> = {
      skill: "已启用",
      plugin: "待授权",
      tool: "连接测试中",
      agent: "已启用",
      repository: "索引中",
      knowledge: "同步中",
      memory: "可用",
    };

    onAdd({
      id: `custom-${kind}-${Date.now()}`,
      kind,
      name,
      description,
      status: statusByKind[kind],
      meta: metaByKind[kind],
      enabled: true,
      scope: kind === "skill" ? values.scope as AssetItem["scope"] : undefined,
      trigger: kind === "skill" ? values.instruction : undefined,
      capabilities:
        kind === "plugin"
          ? splitValues(values.capabilities)
          : kind === "agent"
            ? [...splitValues(values.skills), ...splitValues(values.connections)]
            : undefined,
      url:
        kind === "repository"
          ? values.repositoryUrl
          : kind === "tool"
            ? values.endpoint
            : values.source,
      branch: kind === "repository" ? values.branch : undefined,
      authMethod: kind === "tool" ? values.authMethod : undefined,
      details: values,
    });
  };

  return (
    <form
      className="asset-add-form"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      {config.sections.map((section) => (
        <section className="asset-add-section" key={section.title}>
          <header>
            <h3>{section.title}</h3>
            <p>{section.description}</p>
          </header>
          <div className="asset-add-fields">
            {section.fields.map((field) => {
              const value = values[field.id] ?? "";
              const control = field.control ?? "text";
              return (
                <div className={`asset-add-field ${field.wide ? "wide" : ""}`} key={field.id}>
                  <span>{field.label}{field.required ? <b> *</b> : null}</span>
                  {control === "select" ? (
                    <select
                      aria-label={field.label}
                      onChange={(event) => update(field.id, event.target.value)}
                      value={value}
                    >
                      <option value="">请选择</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : control === "segmented" ? (
                    <div className="asset-add-segmented" role="group" aria-label={field.label}>
                      {field.options?.map((option) => (
                        <button
                          aria-pressed={value === option}
                          className={value === option ? "active" : ""}
                          key={option}
                          onClick={() => update(field.id, option)}
                          type="button"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : control === "multi" ? (
                    <div className="asset-add-options" role="group" aria-label={field.label}>
                      {field.options?.map((option) => {
                        const selected = splitValues(value).includes(option);
                        return (
                          <button
                            aria-pressed={selected}
                            className={selected ? "active" : ""}
                            key={option}
                            onClick={() => toggleOption(field.id, option)}
                            type="button"
                          >
                            {selected ? "✓ " : ""}{option}
                          </button>
                        );
                      })}
                    </div>
                  ) : control === "textarea" ? (
                    <textarea
                      aria-label={field.label}
                      onChange={(event) => update(field.id, event.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      value={value}
                    />
                  ) : (
                    <input
                      aria-label={field.label}
                      autoFocus={field.id === config.sections[0].fields[0].id}
                      onChange={(event) => update(field.id, event.target.value)}
                      placeholder={field.placeholder}
                      type={control}
                      value={value}
                    />
                  )}
                  {field.hint && <small>{field.hint}</small>}
                </div>
              );
            })}
          </div>
        </section>
      ))}
      <footer className="asset-add-footer">
        <p><b>*</b> 为必填项，添加后可在资产详情中继续维护。</p>
        <div>
          <button onClick={onCancel} type="button">取消</button>
          <button className="primary-button" disabled={!canSubmit} type="submit">
            {config.submitLabel}
          </button>
        </div>
      </footer>
    </form>
  );
}
