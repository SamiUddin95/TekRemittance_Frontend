export interface Branch {
    id?: number;
    code: string;
    name: string;
    isActive: boolean;
    hubCode: number;
    isDeleted: boolean;
    createdBy?: string;
    updatedBy?: string;
    createdOn?: string;
    updatedOn?: string;
}

export interface BranchListResponse {
    items: Branch[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface HubDropdown {
    code: string;
    name: string;
}
