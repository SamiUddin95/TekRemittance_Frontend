export interface City {
    id?: number;
    code: string;
    name: string;
    countryId: number;
    countryName?: string;
    provinceId: number;
    provinceName?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CityListResponse {
    cities: City[];
    total: number;
    page: number;
    limit: number;
}
