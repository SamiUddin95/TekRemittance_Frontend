export interface Province {
    id?: number;
    code: string;
    name: string;
    countryId: number;
    countryName?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ProvinceListResponse {
    provinces: Province[];
    total: number;
    page: number;
    limit: number;
}
