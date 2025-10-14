export interface Country {
    id?: number;
    code: string;
    name: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CountryListResponse {
    countries: Country[];
    total: number;
    page: number;
    limit: number;
}
