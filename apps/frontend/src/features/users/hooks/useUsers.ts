import { useQuery } from '@tanstack/react-query';
import { listUsers, getUser } from '../api/users.api';
import type { UserListFilters } from '../types/user.types';

export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filters: UserListFilters) => [...usersKeys.lists(), filters] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
};

export function useUsers(filters: UserListFilters) {
  return useQuery({
    queryKey: usersKeys.list(filters),
    queryFn: () => listUsers(filters),
    placeholderData: (prev) => prev,
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: usersKeys.detail(id ?? ''),
    queryFn: () => getUser(id!),
    enabled: !!id,
  });
}