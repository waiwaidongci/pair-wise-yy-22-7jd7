import type { Request, Response } from "express";
import { restorationPlanService } from "../services/RestorationPlanService";
import { VersionConflictError } from "../services/VersioningService";

const getOperationNo = (req: Request): string =>
  String(req.body?.operation_no ?? req.headers["x-operation-no"] ?? `op-${Date.now()}-${Math.random().toString(36).slice(2)}`);

export const restorationPlanController = {
  list: (req: Request, res: Response) => res.json(restorationPlanService.list(getOperationNo(req))),

  create: (req: Request, res: Response) => {
    try {
      const { result } = restorationPlanService.create(req.body, getOperationNo(req));
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ code: "VALIDATION_FAILED", message: (err as Error).message });
    }
  },

  submit: (req: Request, res: Response) => {
    try {
      const { result, replayed } = restorationPlanService.submit(Number(req.params.id), getOperationNo(req));
      res.json({ ...result, replayed });
    } catch (err) {
      if (err instanceof VersionConflictError) return res.status(409).json({ code: "VERSION_CONFLICT", message: err.message });
      res.status(400).json({ code: "VALIDATION_FAILED", message: (err as Error).message });
    }
  },

  approve: (req: Request, res: Response) => {
    try {
      const { result, replayed } = restorationPlanService.approve(
        Number(req.params.id),
        Number(req.body.expected_version),
        String(req.body.comment ?? ""),
        getOperationNo(req)
      );
      res.json({ ...result, replayed });
    } catch (err) {
      if (err instanceof VersionConflictError) return res.status(409).json({ code: "VERSION_CONFLICT", message: err.message });
      res.status(400).json({ code: "VALIDATION_FAILED", message: (err as Error).message });
    }
  },

  reject: (req: Request, res: Response) => {
    try {
      const { result, replayed } = restorationPlanService.reject(
        Number(req.params.id),
        String(req.body.comment ?? ""),
        getOperationNo(req)
      );
      res.json({ ...result, replayed });
    } catch (err) {
      if (err instanceof VersionConflictError) return res.status(409).json({ code: "VERSION_CONFLICT", message: err.message });
      res.status(400).json({ code: "VALIDATION_FAILED", message: (err as Error).message });
    }
  }
};
