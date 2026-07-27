import {
  Bell,
  Bot,
  Check,
  ChevronRight,
  Plug,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  ["账号", UserRound],
  ["Agent 偏好", Bot],
  ["Skill 与插件", Sparkles],
  ["连接与权限", Plug],
  ["通知", Bell],
] as const;

export function ProfileView() {
  const [model, setModel] = useState("企业通用模型");
  const [reasoning, setReasoning] = useState("标准");
  const [permission, setPermission] = useState("工作区内自动执行");
  const [notifications, setNotifications] = useState({
    finished: true,
    review: true,
    failed: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <div className="profile-view page-scroll">
      <header className="profile-page-header">
        <div className="profile-identity">
          <span className="profile-hero-avatar">陈</span>
          <div>
            <p className="eyebrow">个人工作区</p>
            <h1>个人设置</h1>
            <p>设置默认 Agent 工作方式、个人能力与连接。</p>
          </div>
        </div>
        <span className="profile-saved"><Check size={14} /> 已保存</span>
      </header>

      <div className="profile-layout">
        <aside className="profile-navigation" aria-label="个人设置分类">
          {navigation.map(([label, Icon], index) => (
            <a className={index === 0 ? "active" : ""} href={`#profile-${index}`} key={label}>
              <Icon size={16} />
              <span>{label}</span>
            </a>
          ))}
        </aside>

        <div className="profile-sections">
          <section className="profile-setting-card" id="profile-0">
            <div className="profile-section-heading">
              <div><UserRound size={18} /><h2>账号与企业工作区</h2></div>
              <span className="status-badge success">企业成员</span>
            </div>
            <div className="profile-account-row">
              <span className="profile-account-avatar">陈</span>
              <div><strong>陈楠</strong><small>chennan1@kingsoft.com</small></div>
              <button type="button">管理账号 <ChevronRight size={15} /></button>
            </div>
            <div className="profile-workspace-row">
              <span><strong>当前工作区</strong><small>金山办公 · 研发中心</small></span>
              <span className="profile-plan">Enterprise</span>
            </div>
          </section>

          <section className="profile-setting-card" id="profile-1">
            <div className="profile-section-heading"><div><Bot size={18} /><h2>Agent 偏好</h2></div></div>
            <p className="profile-section-note">作为新任务的个人默认值，项目中的角色与权限仍优先。</p>
            <label className="profile-field"><span>默认模型<small>用于大多数对话和执行</small></span><select aria-label="默认模型" value={model} onChange={(event) => setModel(event.target.value)}><option>企业通用模型</option><option>高性能推理模型</option><option>快速模型</option></select></label>
            <label className="profile-field"><span>推理强度<small>平衡响应速度和复杂任务质量</small></span><select aria-label="推理强度" value={reasoning} onChange={(event) => setReasoning(event.target.value)}><option>标准</option><option>较高</option><option>快速</option></select></label>
            <div className="profile-field"><span>沟通方式<small>简洁直接，先给结论再展开</small></span><button className="profile-inline-button" type="button">编辑偏好</button></div>
            <div className="profile-favorite-agents"><span>常用 Agent</span><div><span>PRD 撰写</span><span>前端开发</span><span>数据分析</span></div></div>
          </section>

          <section className="profile-setting-card" id="profile-2">
            <div className="profile-section-heading"><div><Sparkles size={18} /><h2>Skill 与插件</h2></div><button className="profile-inline-button" type="button">管理智能资产</button></div>
            <div className="profile-mini-grid">
              <article><span className="profile-mini-icon"><Sparkles size={17} /></span><div><strong>我的 Skill</strong><small>4 个已启用 · 1 个个人 Skill</small></div><ChevronRight size={15} /></article>
              <article><span className="profile-mini-icon"><Plug size={17} /></span><div><strong>已连接插件</strong><small>GitHub、Figma 等 3 个</small></div><ChevronRight size={15} /></article>
            </div>
          </section>

          <section className="profile-setting-card" id="profile-3">
            <div className="profile-section-heading"><div><ShieldCheck size={18} /><h2>连接与权限</h2></div></div>
            <label className="profile-field"><span>默认执行权限<small>Agent 需要扩大范围时仍会请求确认</small></span><select aria-label="默认执行权限" value={permission} onChange={(event) => setPermission(event.target.value)}><option>工作区内自动执行</option><option>每次执行前确认</option><option>仅查看</option></select></label>
            <div className="profile-connection-list">
              <span><strong>GitHub</strong><small>可访问 3 个授权代码库</small></span><button type="button">配置</button>
              <span><strong>企业知识库</strong><small>由组织管理员提供</small></span><span className="status-badge success">已连接</span>
            </div>
          </section>

          <section className="profile-setting-card" id="profile-4">
            <div className="profile-section-heading"><div><Bell size={18} /><h2>通知</h2></div></div>
            {[
              ["finished", "Agent 完成任务", "执行结束后在客户端提醒"],
              ["review", "需要我确认", "审核门禁或关键选择等待处理"],
              ["failed", "执行异常", "工具连接或 Agent 执行失败"],
            ].map(([key, label, note]) => (
              <button className="profile-notification-row" key={key} onClick={() => toggleNotification(key as keyof typeof notifications)} type="button">
                <span><strong>{label}</strong><small>{note}</small></span>
                <span className={`profile-switch ${notifications[key as keyof typeof notifications] ? "active" : ""}`} aria-hidden="true"><i /></span>
              </button>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
