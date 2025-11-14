import { z } from 'zod';

// Response types
export interface ApiResponse<T> {
  data?: T;
  errors?: string | Record<string, string[]>;
  paging?: {
    current_page: number;
    total_page: number;
    size: number;
  };
}

// User types
export interface UserResponse {
  username: string;
  name: string;
  token?: string;
}

// Posting types
export interface PostingResponse {
  id: string;
  title: string;
  description: string;
  date: string;
  pictures: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PostingListResponse {
  id: string;
  title: string;
  description: string;
  date: string;
  pictures: string[];
  createdAt: string;
  updatedAt: string;
}

// Pagination
export interface PaginationQuery {
  page?: number;
  size?: number;
}
