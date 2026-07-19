import {
  Bot,
  ChevronDown,
  FolderKanban,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
} from "lucide-react";
import type { RecentTask, ViewId } from "../lib/types";

export interface SidebarProps {
  activeView: ViewId;
  collapsed: boolean;
  recentTasks: RecentTask[];
  onNavigate(view: ViewId): void;
  onOpenTask(task: RecentTask): void;
  onOpenProfile(): void;
  onToggleCollapsed(): void;
}

export function Sidebar({
  activeView,
  collapsed,
  recentTasks,
  onNavigate,
  onOpenTask,
  onOpenProfile,
  onToggleCollapsed,
}: SidebarProps) {
  const links = [
    { label: "新建任务", icon: Plus, view: "home" as const },
    { label: "项目", icon: FolderKanban, view: "projects" as const },
    { label: "智能资产", icon: Bot, view: "assets" as const },
  ];

  return (
    <nav
      className={`sidebar ${collapsed ? "collapsed" : ""}`}
      aria-label="主导航"
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
          <button
            aria-label={`${task.title}${task.time}`}
            className={`recent-task ${task.mode}`}
            key={task.id}
            onClick={() => onOpenTask(task)}
            title={`${task.title} · ${task.time}`}
            type="button"
          >
            <span className="task-dot" />
            <span className="task-copy">
              <strong>{task.title}</strong>
              <small>{task.time}</small>
            </span>
          </button>
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
        <button aria-label="个人设置" className="icon-button" onClick={onOpenProfile} type="button">
          <Settings size={17} />
        </button>
      </div>
    </nav>
  );
}
