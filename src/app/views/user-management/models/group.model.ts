export interface Group {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
createdBy?: string;   // ADD THIS
  updatedBy?: string;
}
