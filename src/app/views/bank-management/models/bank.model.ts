export interface Bank {
    id?: number;
    code: string;
    name: string;
    iata?: string;
    website?: string;
    phoneNo?: string;
    description?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface BankListResponse {
    banks: Bank[];
    total: number;
    page: number;
    limit: number;
}