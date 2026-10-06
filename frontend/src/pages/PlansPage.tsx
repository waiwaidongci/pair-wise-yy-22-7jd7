import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Input, Modal, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { useRestorationStepStore } from "../stores/RestorationStepStore";
import { usePlanApproval } from "../hooks/usePlanApproval";
import { StatusBadge } from "../components/common/StatusBadge";
import type { RestorationPlan } from "../types/RestorationPlan";
import type { RestorationStep } from "../types/RestorationStep";

const { TextArea } = Input;

type CommentState = { id: number; action: "approve" | "reject" } | null;

export function PlansPage() {
  const { rows, load } = useRestorationPlanStore();
  const stepRows = useRestorationStepStore((s) => s.rows);
  const loadSteps = useRestorationStepStore((s) => s.load);
  const { pageRows, page, setPage, pageSize, total, submit, approve, reject } = usePlanApproval(rows);
  const [commentFor, setCommentFor] = useState<CommentState>(null);
  const [comment, setComment] = useState("");
  const [conflict, setConflict] = useState(false);

  useEffect(() => {
    load();
    loadSteps();
  }, [load, loadSteps]);

  const stepsByPlan = useMemo(() => {
    const map = new Map<number, RestorationStep[]>();
    stepRows.forEach((step) => {
      const list = map.get(step.plan_id) ?? [];
      list.push(step);
      map.set(step.plan_id, list);
    });
    return map;
  }, [stepRows]);

  const openComment = (id: number, action: "approve" | "reject") => {
    setCommentFor({ id, action });
    setComment("");
  };

  const confirmComment = async () => {
    if (!commentFor) return;
    const result = commentFor.action === "approve"
      ? await approve(commentFor.id, comment)
      : await reject(commentFor.id, comment);
    setConflict(result.conflict);
    setCommentFor(null);
  };

  const columns: ColumnsType<RestorationPlan> = [
    {
      title: "方案",
      dataIndex: "plan_title",
      render: (_, row) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{row.plan_title}</Typography.Text>
          <Space size={4}>
            <Tag>v{row.version_no} 工作稿</Tag>
            {row.frozen_version_no != null && <Tag color="blue">冻结 v{row.frozen_version_no}</Tag>}
          </Space>
        </Space>
      )
    },
    { title: "方法", dataIndex: "method" },
    { title: "风险", dataIndex: "risk_assessment" },
    {
      title: "状态",
      dataIndex: "approval_status",
      render: (status: string) => <StatusBadge value={status} />
    },
    {
      title: "操作",
      render: (_, row) => (
        <Space>
          {row.approval_status === "DRAFT" && (
            <Button size="small" onClick={async () => { const r = await submit(row.id); setConflict(r.conflict); }}>
              提交审批
            </Button>
          )}
          {row.approval_status === "SUBMITTED" && (
            <>
              <Button size="small" type="primary" onClick={() => openComment(row.id, "approve")}>
                审批通过
              </Button>
              <Button size="small" danger onClick={() => openComment(row.id, "reject")}>
                驳回
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">relic-restore</p>
          <h1>修复方案</h1>
        </div>
      </div>

      {conflict && (
        <Alert
          type="warning"
          showIcon
          message="版本冲突：审批已被其他专家先处理"
          description="您的审批意见已保留留档，请同步后查看最新版本再继续操作。"
          closable
          onClose={() => setConflict(false)}
        />
      )}

      <Table
        rowKey="id"
        columns={columns}
        dataSource={pageRows}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: setPage,
          showSizeChanger: false
        }}
        expandable={{
          expandedRowRender: (row) => {
            const steps = stepsByPlan.get(row.id) ?? [];
            const frozenSteps = steps.filter((s) => s.version_no === row.frozen_version_no);
            const draftSteps = steps.filter((s) => s.version_no !== row.frozen_version_no);
            return (
              <Space direction="vertical" size={8} style={{ padding: "8px 0" }}>
                {row.frozen_version_no != null && (
                  <div>
                    <Typography.Text type="secondary">冻结版本 v{row.frozen_version_no} 步骤（审批通过后生效）：</Typography.Text>
                    {frozenSteps.length === 0 ? (
                      <Typography.Text type="secondary"> 暂无</Typography.Text>
                    ) : (
                      <Space size={4} wrap>
                        {frozenSteps.map((s) => (
                          <Tag key={s.id} color="blue">{s.step_order} · v{s.version_no}</Tag>
                        ))}
                      </Space>
                    )}
                  </div>
                )}
                <div>
                  <Typography.Text type="secondary">工作稿步骤（审批期间新记录，留在下一版本）：</Typography.Text>
                  {draftSteps.length === 0 ? (
                    <Typography.Text type="secondary"> 暂无</Typography.Text>
                  ) : (
                    <Space size={4} wrap>
                      {draftSteps.map((s) => (
                        <Tag key={s.id}>{s.step_order} · v{s.version_no}</Tag>
                      ))}
                    </Space>
                  )}
                </div>
              </Space>
            );
          }
        }}
      />

      <Modal
        title={commentFor?.action === "approve" ? "审批通过" : "驳回方案"}
        open={commentFor != null}
        onOk={confirmComment}
        onCancel={() => setCommentFor(null)}
        okText="确认"
        cancelText="取消"
      >
        <TextArea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="请输入审批意见（冲突时意见将保留留档）"
        />
      </Modal>
    </section>
  );
}
