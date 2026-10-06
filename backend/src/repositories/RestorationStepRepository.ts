import { seed } from "../seed";
import type { RestorationStep } from "../models/RestorationStep";

const rows: RestorationStep[] = seed.restorationStep.map((row) => ({ ...row })) as RestorationStep[];

export const restorationStepRepository = {
  findAll: (): RestorationStep[] => rows.map((row) => ({ ...row })),
  findByPlan: (planId: number): RestorationStep[] =>
    rows.filter((row) => row.plan_id === planId).map((row) => ({ ...row })),
  findById: (id: number): RestorationStep | undefined => rows.find((row) => row.id === id),
  insert: (row: RestorationStep): RestorationStep => {
    rows.push(row);
    return { ...row };
  },
  update: (row: RestorationStep): RestorationStep => {
    const idx = rows.findIndex((r) => r.id === row.id);
    if (idx >= 0) rows[idx] = { ...row };
    return { ...rows[idx] };
  },
  nextId: (): number => rows.reduce((max, r) => Math.max(max, r.id), 0) + 1
};
