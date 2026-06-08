export interface Hub {
    id?: number;
    code: string;
    name: string;
    isDeleted: boolean;
    createdBy?: string;
    updatedBy?: string;
    createdOn?: string;
    updatedOn?: string;
}

export interface HubListResponse {
    items: Hub[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}
