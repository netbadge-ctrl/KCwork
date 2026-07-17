import { CheckCircle2, CircleDashed, TestTube2, XCircle } from "lucide-react";
import { testCases, testReports } from "../../lib/demo-data";
import type { WorkspaceRouterProps } from "./workspace-router";

export function TestingWorkspace({ requirement, onOpenPreview }: WorkspaceRouterProps) {
  const cases = testCases.filter((testCase) => testCase.requirementId === requirement.id);
  const report = testReports.find((item) => item.requirementId === requirement.id);
  const statusIcon = {
    passed: <CheckCircle2 size={15} />,
    failed: <XCircle size={15} />,
    pending: <CircleDashed size={15} />,
  };
  return (
    <section className="workspace-canvas testing-workspace">
      <div className="workspace-heading"><div><p className="eyebrow">Spec verification</p><h2>测试工作台</h2><p>测试用例从 {requirement.code} 的验收标准派生并保留追溯。</p></div></div>
      <article className="role-workspace-summary"><TestTube2 size={22} /><div><strong>26 个测试用例 · {report?.passRate}% 通过</strong><small>{report?.failed} 个失败 · {report?.skipped} 个跳过</small></div>{report && <button aria-label="查看角色管理测试报告" className="secondary-small" onClick={() => onOpenPreview("test")} type="button">查看测试报告</button>}</article>
      <div className="test-case-table">
        <header><span>用例与验收标准</span><span>类型</span><span>结果</span></header>
        {cases.map((testCase) => (
          <article className={`test-case-row ${testCase.status}`} key={testCase.id}>
            <div><b>{testCase.specRef}</b><span>{testCase.title}</span></div>
            <span>{testCase.type === "automated" ? "自动化" : "人工"}</span>
            <span>{statusIcon[testCase.status]}{testCase.status === "passed" ? "通过" : testCase.status === "failed" ? "失败" : "待执行"}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
