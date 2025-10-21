export interface Bank {
    id?: string;
    code: string;
    name: string;
    iata?: string; // maps to backend 'imd'
    website?: string;
    phoneNo?: string;
    aliases?: string; // maps to backend 'allases'
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