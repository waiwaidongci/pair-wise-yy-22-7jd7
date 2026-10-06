import { useMemo, useState } from "react";
import { message } from "antd";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";

type VersionedRow = {
  id: number;
  version_no: number;
  frozen_version_no: number | null;
  approval_status: string;
};

export function usePlanApproval<T extends VersionedRow>(rows: T[] = []) {
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const pageRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page]);

  const submitPlan = useRestorationPlanStore((s) => s.submit);
  const approvePlan = useRestorationPlanStore((s) => s.approve);
  const rejectPlan = useRestorationPlanStore((s) => s.reject);

  const submit = async (id: number) => {
    const result = await submitPlan(id);
    if (result.conflict) {
      message.warning("提交时方案状态已变化，请同步后重试");
    } else {
      message.success("方案已提交审批，待审内容已冻结");
    }
    return result;
  };

  const approve = async (id: number, comment: string) => {
    const plan = rows.find((r) => r.id === id);
    // 以冻结版本作为待审版本号，后端据此做乐观锁
    const expectedVersion = plan?.frozen_version_no ?? plan?.version_no ?? 1;
    const result = await approvePlan(id, expectedVersion, comment);
    if (result.conflict) {
      message.warning("审批已被其他专家先处理，您的意见已保留，请同步后查看最新版本");
    } else {
      message.success("审批通过，冻结版本步骤已生效");
    }
    return result;
  };

  const reject = async (id: number, comment: string) => {
    const result = await rejectPlan(id, comment);
    if (result.conflict) {
      message.warning("方案状态已变化，意见已保留，请同步后重试");
    } else {
      message.success("已驳回，意见已留档");
    }
    return result;
  };

  return { page, setPage, pageSize, pageRows, total: rows.length, submit, approve, reject };
}
