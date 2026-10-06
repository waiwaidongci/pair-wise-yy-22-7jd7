import type { NextFunction, Request, Response } from "express";
import { restorationStepService } from "../services/RestorationStepService";
import { ERROR_CODES } from "../constants/errorCodes";
import type { CreateRestorationStepPayload, ExecuteRestorationStepPayload } from "../types/RestorationStepPayload";

/** 控制器层异常包装：在 service 错误上补 controller 上下文后交给全局错误中间件 */
const wrap = (err: unknown, action: string) => {
  if (err instanceof Error && !("code" in err)) {
    return Object.assign(err, { code: ERROR_CODES.VALIDATION_FAILED, message: `RestorationStepController.${action}: ${err.message}` });
  }
  return err;
};

export const restorationStepController = {
  list: (_req: Request, res: Response) => res.json(restorationStepService.list()),
  create: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(restorationStepService.create(req.body as CreateRestorationStepPayload));
    } catch (err) {
      next(wrap(err, "create"));
    }
  },
  execute: (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = restorationStepService.execute(Number(req.params.id), req.body as ExecuteRestorationStepPayload);
      res.status(result.httpStatus).json(result.body);
    } catch (err) {
      next(wrap(err, "execute"));
    }
  }
};
