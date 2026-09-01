export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface CursorPaginatedResponse<T> {
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiErrorShape {
  detail?: string
  [field: string]: unknown
}
