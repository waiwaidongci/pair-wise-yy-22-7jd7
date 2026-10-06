import type { Request, Response } from "express";
import { restorationStepService } from "../services/RestorationStepService";

const getOperationNo = (req: Request): string =>
  String(req.body?.operation_no ?? req.headers["x-operation-no"] ?? `op-${Date.now()}-${Math.random().toString(36).slice(2)}`);

export const restorationStepController = {
  list: (req: Request, res: Response) => {
    const planId = req.query.plan_id;
    const rows = planId != null
      ? restorationStepService.listByPlan(Number(planId), getOperationNo(req))
      : restorationStepService.list(getOperationNo(req));
    res.json(rows);
  },

  create: (req: Request, res: Response) => {
    try {
      const { result } = restorationStepService.create(req.body, getOperationNo(req));
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ code: "VALIDATION_FAILED", message: (err as Error).message });
    }
  }
};
