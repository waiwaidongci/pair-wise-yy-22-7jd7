import { seed } from "../seed";
import type { RestorationPlan } from "../models/RestorationPlan";

const rows: RestorationPlan[] = seed.restorationPlan.map((row) => ({ ...row })) as RestorationPlan[];

export const restorationPlanRepository = {
  findAll: (): RestorationPlan[] => rows.map((row) => ({ ...row })),
  findById: (id: number): RestorationPlan | undefined => rows.find((row) => row.id === id),
  insert: (row: RestorationPlan): RestorationPlan => {
    rows.push(row);
    return { ...row };
  },
  update: (row: RestorationPlan): RestorationPlan => {
    const idx = rows.findIndex((r) => r.id === row.id);
    if (idx >= 0) rows[idx] = { ...row };
    return { ...rows[idx] };
  },
  nextId: (): number => rows.reduce((max, r) => Math.max(max, r.id), 0) + 1
};
