import {
  Bot,
  ChevronDown,
  FolderKanban,
  Plus,
  Settings,
} from "lucide-react";
import type { RecentTask, ViewId } from "../lib/types";

export interface SidebarProps {
  activeView: ViewId;
  recentTasks: RecentTask[];
  onNavigate(view: ViewId): void;
  onOpenTask(task: RecentTask): void;
  onOpenProfile(): void;
}

export function Sidebar({
  activeView,
  recentTasks,
  onNavigate,
  onOpenTask,
  onOpenProfile,
}: SidebarProps) {
  const links = [
    { label: "新建任务", icon: Plus, view: "home" as const },
    { label: "项目", icon: FolderKanban, view: "projects" as const },
    { label: "智能资产", icon: Bot, view: "assets" as const },
  ];

  return (
    <nav className="sidebar" aria-label="主导航">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          ✦
        </span>
        <span>KFlow</span>
        <small>v1.0</small>
      </div>

      <div className="primary-nav">
        {links.map(({ label, icon: Icon, view }) => (
          <button
            className={`nav-button ${activeView === view ? "active" : ""}`}
            key={view}
            onClick={() => onNavigate(view)}
            type="button"
          >
            <span className="nav-icon">
              <Icon size={17} strokeWidth={1.9} />
            </span>
            {label}
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
            className={`recent-task ${task.mode}`}
            key={task.id}
            onClick={() => onOpenTask(task)}
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
