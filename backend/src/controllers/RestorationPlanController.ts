import type { NextFunction, Request, Response } from "express";
import { restorationPlanService } from "../services/RestorationPlanService";
import { ERROR_CODES } from "../constants/errorCodes";
import type { ApprovePlanPayload, SubmitPlanPayload } from "../types/RestorationPlanPayload";

/** 控制器层异常包装：在 service 错误上补 controller 上下文后交给全局错误中间件 */
const wrap = (err: unknown, action: string) => {
  if (err instanceof Error && !("code" in err)) {
    return Object.assign(err, { code: ERROR_CODES.VALIDATION_FAILED, message: `RestorationPlanController.${action}: ${err.message}` });
  }
  return err;
};

export const restorationPlanController = {
  list: (_req: Request, res: Response) => res.json(restorationPlanService.list()),
  create: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(restorationPlanService.create(req.body));
    } catch (err) {
      next(wrap(err, "create"));
    }
  },
  submit: (req: Request, res: Response, next: NextFunction) => {
    try {
      const actorId = (req as unknown as { user?: { id?: number } }).user?.id ?? 0;
      const result = restorationPlanService.submit(Number(req.params.id), req.body as SubmitPlanPayload, actorId);
      res.status(result.httpStatus).json(result.body);
    } catch (err) {
      next(wrap(err, "submit"));
    }
  },
  approve: (req: Request, res: Response, next: NextFunction) => {
    try {
      const expertId = (req as unknown as { user?: { id?: number } }).user?.id ?? 0;
      const result = restorationPlanService.approve(Number(req.params.id), req.body as ApprovePlanPayload, expertId);
      res.status(result.httpStatus).json(result.body);
    } catch (err) {
      next(wrap(err, "approve"));
    }
  },
  trace: (req: Request, res: Response) => res.json(restorationPlanService.trace(Number(req.params.id)))
};
