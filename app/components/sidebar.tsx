import {
  Bot,
  BriefcaseBusiness,
  ChevronDown,
  Code2,
  FolderKanban,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { RecentTask, ViewId } from "../lib/types";

export interface SidebarProps {
  activeView: ViewId;
  collapsed: boolean;
  recentTasks: RecentTask[];
  onNavigate(view: ViewId): void;
  onDeleteTask(task: RecentTask): void;
  onOpenTask(task: RecentTask): void;
  onOpenProfile(): void;
  onToggleCollapsed(): void;
}

export function Sidebar({
  activeView,
  collapsed,
  recentTasks,
  onNavigate,
  onDeleteTask,
  onOpenTask,
  onOpenProfile,
  onToggleCollapsed,
}: SidebarProps) {
  const [peekExpanded, setPeekExpanded] = useState(false);
  const links = [
    { label: "新建任务", icon: Plus, view: "home" as const },
    { label: "项目", icon: FolderKanban, view: "projects" as const },
    { label: "智能资产", icon: Bot, view: "assets" as const },
  ];

  return (
    <nav
      className={`sidebar ${collapsed ? "collapsed" : ""} ${collapsed && peekExpanded ? "peek-expanded" : ""}`}
      aria-label="主导航"
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPeekExpanded(false);
        }
      }}
      onFocusCapture={() => {
        if (collapsed) setPeekExpanded(true);
      }}
      onMouseEnter={() => {
        if (collapsed) setPeekExpanded(true);
      }}
      onMouseLeave={() => setPeekExpanded(false)}
    >
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          ✦
        </span>
        <span className="brand-label">KFlow</span>
        <small>v1.0</small>
        <button
          aria-label={collapsed ? "展开左侧导航" : "收起左侧导航"}
          className="icon-button sidebar-toggle"
          data-tooltip={collapsed ? "固定展开侧边栏" : "收起侧边栏"}
          onClick={onToggleCollapsed}
          title={collapsed ? "展开左侧导航" : "收起左侧导航"}
          type="button"
        >
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>

      <div className="primary-nav">
        {links.map(({ label, icon: Icon, view }) => (
          <button
            aria-label={label}
            className={`nav-button ${activeView === view ? "active" : ""}`}
            data-tooltip={label}
            key={view}
            onClick={() => onNavigate(view)}
            title={label}
            type="button"
          >
            <span className="nav-icon">
              <Icon size={17} strokeWidth={1.9} />
            </span>
            <span className="nav-label">{label}</span>
          </button>
        ))}
      </div>

      <div className="recent-heading">
        <span>最新任务</span>
        <ChevronDown size={14} />
      </div>
      <div className="recent-list">
        {recentTasks.map((task) => (
          <div className="recent-task-row" key={task.id}>
            <button
              aria-label={`${task.mode === "office" ? "办公任务" : "开发任务"}：${task.title}${task.time}`}
              className={`recent-task ${task.mode}`}
              data-tooltip={`${task.title} · ${task.time}`}
              onClick={() => onOpenTask(task)}
              title={`${task.title} · ${task.time}`}
              type="button"
            >
              <span className="task-type-icon" aria-hidden="true">
                {task.mode === "office" ? <BriefcaseBusiness size={13} /> : <Code2 size={13} />}
              </span>
              <span className="task-copy">
                <strong>{task.title}</strong>
                <small>{task.time}</small>
              </span>
            </button>
            {!task.projectId && (
              <button
                aria-label={`删除任务：${task.title}`}
                className="recent-task-delete"
                data-tooltip="删除任务"
                onClick={() => onDeleteTask(task)}
                title="删除任务"
                type="button"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className={`profile ${activeView === "profile" ? "active" : ""}`}>
        <button aria-label="打开陈楠个人页面" className="profile-main" onClick={onOpenProfile} type="button">
          <span className="profile-avatar">陈</span>
          <span className="profile-copy">
            <strong>陈楠</strong>
            <small>研发中心</small>
          </span>
        </button>
        <button aria-label="个人设置" className="icon-button" data-tooltip="个人设置" onClick={onOpenProfile} title="个人设置" type="button">
          <Settings size={17} />
        </button>
      </div>
    </nav>
  );
}
