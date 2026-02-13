export interface Aml {
  id: string;
  cnic: string;
  accountName: string;
  address: string;
  createdBy: string;
  createdOn: string;
  updatedBy: string;
  updatedOn: string;
}

export interface AmlFilter {
  cnic?: string;
  accountName?: string;
  address?: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  statusCode: number;
  errorMessage: any;
}

export interface AmlListResponse {
  items: Aml[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateAmlRequest {
  id: string;
  cnic: string;
  accountName: string;
  address: string;
  createdBy: string;
  createdOn: string;
  updatedBy: string;
  updatedOn: string;
}
