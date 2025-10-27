export interface Country {
    id?: string;
    code: string;
    name: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
}

export interface CountryListResponse {
    items: Country[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}
