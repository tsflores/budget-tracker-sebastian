import { api } from './api';
import type { MonthlySnapshot } from './history-store';

export function getSnapshots(): Promise<MonthlySnapshot[]> {
  return api.get<MonthlySnapshot[]>('/history/snapshots');
}

export function saveSnapshot(snapshot: MonthlySnapshot): Promise<MonthlySnapshot> {
  return api.post<MonthlySnapshot>('/history/snapshots', snapshot);
}
