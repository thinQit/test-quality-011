export type TestStatus = 'draft' | 'active' | 'archived';

export interface Test {
  id: string;
  title: string;
  description?: string | null;
  status: TestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TestsResponse {
  items: Test[];
  total: number;
  page: number;
  pageSize: number;
}
