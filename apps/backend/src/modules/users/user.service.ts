import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../shared/errors/http-error.js';
import { hashPassword, comparePassword } from '../../shared/utils/password.util.js';
import * as repo from './user.repository.js';
import { toDetail, toListItem } from './user.mapper.js';
import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
  ChangePasswordInput,
} from './user.schema.js';
import type { PaginatedUsers, UserDetail } from './user.types.js';
import { eventBus, EVENTS } from '../../shared/events/event-bus.js';

export async function list(query: ListUsersQuery): Promise<PaginatedUsers> {
  const { items, total } = await repo.list({
    search: query.search,
    status: query.status,
    role: query.role,
    page: query.page,
    limit: query.limit,
  });

  return {
    items: items.map(toListItem),
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(total / query.limit),
  };
}

export async function getById(id: string): Promise<UserDetail> {
  const user = await repo.findById(id);
  if (!user) throw new NotFoundError('User not found');
  return toDetail(user);
}

export async function create(input: CreateUserInput): Promise<UserDetail> {
  const existing = await repo.findByEmail(input.email);
  if (existing) throw new ConflictError('A user with that email already exists');

  const passwordHash = await hashPassword(input.password);

  const created = await repo.create({
    email: input.email,
    passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    roles: input.roles,
  });

  await eventBus.emit(EVENTS.USER_CREATED, { userId: created.id });

  return toDetail(created);
}

export async function update(
  id: string,
  input: UpdateUserInput,
  currentUserId: string
): Promise<UserDetail> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('User not found');

  if (id === currentUserId && input.roles !== undefined) {
    const losesAdmin = existing.roles.includes('ADMIN') && !input.roles.includes('ADMIN');
    if (losesAdmin) {
      throw new ForbiddenError('You cannot remove your own ADMIN role');
    }
  }

  const updated = await repo.update(id, {
    firstName: input.firstName,
    lastName: input.lastName,
    status: input.status,
    avatarUrl: input.avatarUrl,
    roles: input.roles,
  });

  if (!updated) throw new NotFoundError('User not found');

  await eventBus.emit(EVENTS.USER_UPDATED, { userId: id });

  return toDetail(updated);
}

export async function remove(id: string, currentUserId: string): Promise<void> {
  if (id === currentUserId) {
    throw new ForbiddenError('You cannot delete your own user');
  }

  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('User not found');

  await repo.remove(id);

  await eventBus.emit(EVENTS.USER_UPDATED, { userId: id });
}

export async function changeOwnPassword(
  userId: string,
  input: ChangePasswordInput
): Promise<void> {
  const user = await repo.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  const matches = await comparePassword(input.currentPassword, user.passwordHash);
  if (!matches) throw new ForbiddenError('Current password is incorrect');

  const newHash = await hashPassword(input.newPassword);
  await repo.updatePassword(userId, newHash);
}

export async function adminChangePassword(userId: string, newPassword: string): Promise<void> {
  const user = await repo.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  const newHash = await hashPassword(newPassword);
  await repo.updatePassword(userId, newHash);
}