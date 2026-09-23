import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  uploadVideo,
  updateVideo,
  deleteVideo,
} from '../api/videos.api';
import { videosKeys } from './useVideos';
import { submodulesKeys } from '@/features/submodules/hooks/useSubmodules';
import { trainingCoursesKeys } from '@/features/training-courses/hooks/useTrainingCourses';
import type {
  CreateVideoInput,
  UpdateVideoInput,
} from '../types/video.types';

function invalidateRelated(
  queryClient: ReturnType<typeof useQueryClient>,
  submoduleId: string,
  courseId?: string
) {
  queryClient.invalidateQueries({ queryKey: videosKeys.bySubmodule(submoduleId) });
  queryClient.invalidateQueries({ queryKey: submodulesKeys.all });
  if (courseId) {
    queryClient.invalidateQueries({ queryKey: trainingCoursesKeys.detail(courseId) });
  }
  queryClient.invalidateQueries({ queryKey: trainingCoursesKeys.lists() });
}

export function useUploadVideo(submoduleId: string, courseId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVideoInput) => uploadVideo(input),
    onSuccess: () => {
      invalidateRelated(queryClient, submoduleId, courseId);
    },
  });
}

export function useUpdateVideo(submoduleId: string, courseId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateVideoInput }) =>
      updateVideo(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: videosKeys.detail(variables.id) });
      invalidateRelated(queryClient, submoduleId, courseId);
    },
  });
}

export function useDeleteVideo(submoduleId: string, courseId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVideo(id),
    onSuccess: () => {
      invalidateRelated(queryClient, submoduleId, courseId);
    },
  });
}