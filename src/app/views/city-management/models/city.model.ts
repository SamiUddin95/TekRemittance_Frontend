export interface City {
    id?: string;
    code: string;
    name: string;
    countryId: string;
    countryName?: string;
    provinceId: string;
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
