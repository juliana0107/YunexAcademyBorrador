export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function normalizePagination(params: PaginationParams): PaginationParams {
  const rawPage = Math.floor(params.page);
  const rawLimit = Math.floor(params.limit);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(100, rawLimit) : 20;

  return { page, limit };
}

export function calculateOffset(params: PaginationParams): number {
  const { page, limit } = normalizePagination(params);
  return (page - 1) * limit;
}

export function buildPaginationMeta(
  params: PaginationParams,
  total: number
): PaginationMeta {
  const { page, limit } = normalizePagination(params);
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}