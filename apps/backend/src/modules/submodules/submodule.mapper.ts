import type { SubmoduleRecord } from './submodule.repository.js';
import type { SubmoduleListItem, SubmoduleDetail } from './submodule.types.js';

export function toListItem(submodule: SubmoduleRecord): SubmoduleListItem {
  return {
    id: submodule.id,
    trainingCourseId: submodule.trainingCourseId,
    title: submodule.title,
    description: submodule.description,
    order: submodule.order,
    estimatedDurationMinutes: submodule.estimatedDurationMinutes,
    videoCount: submodule.videoCount,
    createdAt: submodule.createdAt.toISOString(),
    updatedAt: submodule.updatedAt.toISOString(),
  };
}

export function toDetail(submodule: SubmoduleRecord): SubmoduleDetail {
  return toListItem(submodule);
}