export interface Province {
    id?: string;
    code: string;
    name: string;
    countryId: string;
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
