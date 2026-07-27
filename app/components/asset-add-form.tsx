import { useState } from "react";
import type { AssetItem, AssetKind } from "../lib/types";

type FieldValue = string;

interface FieldConfig {
  id: string;
  label: string;
  placeholder: string;
  /** 渲染为多行/逗号分隔列表(用于 capabilities) */
  multiline?: boolean;
  /** 渲染为下拉选项 */
  options?: readonly string[];
  optional?: boolean;
}

/** 每类资产差异化的添加字段。共性字段(名称/说明)由组件统一渲染。 */
const fieldsByKind: Record<AssetKind, FieldConfig[]> = {
  skill: [
    { id: "scope", label: "Skill 范围", placeholder: "选择范围", options: ["个人 Skill", "团队 Skill", "系统 Skill"] },
    { id: "trigger", label: "触发场景", placeholder: "例：撰写或修改产品文档" },
  ],
  plugin: [
    { id: "url", label: "连接地址", placeholder: "例：https://github.com/api" },
    { id: "capabilities", label: "能力（逗号分隔）", placeholder: "例：读取代码,比较 Diff,创建 PR", multiline: true },
  ],
  tool: [
    { id: "url", label: "MCP 服务地址", placeholder: "例：https://mcp.example.com/sse" },
    { id: "authMethod", label: "鉴权方式", placeholder: "选择鉴权", options: ["无需鉴权", "Bearer Token", "OAuth"] },
  ],
  agent: [
    { id: "capabilities", label: "能力描述（逗号分隔）", placeholder: "例：需求分析,原型设计,PRD 撰写", multiline: true },
    { id: "url", label: "来源地址", placeholder: "例：内置 / 企业 Agent 市场", optional: true },
  ],
  repository: [
    { id: "url", label: "仓库地址", placeholder: "例：https://github.com/org/repo.git" },
    { id: "branch", label: "默认分支", placeholder: "例：main" },
  ],
  knowledge: [
    { id: "url", label: "同步源地址", placeholder: "例：https://wiki.example.com/space" },
    { id: "count", label: "文档数量", placeholder: "例：286" },
  ],
  memory: [
    { id: "count", label: "记忆条数", placeholder: "例：23" },
  ],
};

const labelsByKind: Record<AssetKind, string> = {
  skill: "Skill",
  plugin: "插件",
  tool: "MCP",
  agent: "Agent",
  repository: "代码库",
  knowledge: "知识库",
  memory: "记忆库",
};

export interface AssetAddFormProps {
  kind: AssetKind;
  onAdd(asset: AssetItem): void;
  onCancel(): void;
}

export function AssetAddForm({ kind, onAdd, onCancel }: AssetAddFormProps) {
  const label = labelsByKind[kind];
  const fields = fieldsByKind[kind];
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [values, setValues] = useState<Record<string, FieldValue>>({});

  const update = (id: string, value: string) =>
    setValues((current) => ({ ...current, [id]: value }));

  const submit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const v = values;
    const capabilities = v.capabilities
      ? v.capabilities.split(/[，,]/).map((item) => item.trim()).filter(Boolean)
      : undefined;
    const count = v.count ? Number(v.count) || undefined : undefined;
    onAdd({
      id: `custom-${kind}-${Date.now()}`,
      kind,
      name: trimmedName,
      description: description.trim() || `新添加的${label}`,
      status: kind === "tool" || kind === "plugin" ? "已连接" : "可用",
      meta: "刚刚添加",
      enabled: true,
      scope: v.scope as AssetItem["scope"],
      trigger: v.trigger,
      capabilities,
      url: v.url,
      branch: v.branch,
      count,
      authMethod: v.authMethod,
    });
  };

  return (
    <form
      className="inline-create-form asset-add-form"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="asset-add-header">
        <strong>添加{label}</strong>
        <span>按{label}特性填写，添加后出现在当前分类。</span>
      </div>
      <label className="asset-add-field">
        <span>{label}名称</span>
        <input
          aria-label={`${label}名称`}
          autoFocus
          onChange={(event) => setName(event.target.value)}
          placeholder={`${label}名称`}
          value={name}
        />
      </label>
      <label className="asset-add-field">
        <span>说明</span>
        <input
          aria-label={`${label}说明`}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="简要说明"
          value={description}
        />
      </label>
      {fields.map((field) => {
        const value = values[field.id] ?? "";
        const inputId = `${label}${field.label}`;
        if (field.options) {
          return (
            <label className="asset-add-field" key={field.id}>
              <span>{field.label}</span>
              <select
                aria-label={inputId}
                onChange={(event) => update(field.id, event.target.value)}
                value={value}
              >
                <option value="">{field.placeholder}</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
          );
        }
        return (
          <label className="asset-add-field" key={field.id}>
            <span>{field.label}{field.optional ? "（可选）" : ""}</span>
            {field.multiline ? (
              <textarea
                aria-label={inputId}
                onChange={(event) => update(field.id, event.target.value)}
                placeholder={field.placeholder}
                rows={2}
                value={value}
              />
            ) : (
              <input
                aria-label={inputId}
                onChange={(event) => update(field.id, event.target.value)}
                placeholder={field.placeholder}
                value={value}
              />
            )}
          </label>
        );
      })}
      <div className="inline-create-actions">
        <button onClick={onCancel} type="button">取消</button>
        <button className="primary-button" disabled={!name.trim()} type="submit">添加</button>
      </div>
    </form>
  );
}
