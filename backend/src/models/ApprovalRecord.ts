/** 专家审批意见留痕：先到者 APPLIED 生效，后到者 CONFLICT_RETAINED 保留意见 */
export interface ApprovalRecord {
  id: number;
  plan_id: number;
  version: number;
  expert_id: number;
  decision: string;
  opinion: string;
  outcome: string;
  operation_id: string;
  created_at: string;
}
