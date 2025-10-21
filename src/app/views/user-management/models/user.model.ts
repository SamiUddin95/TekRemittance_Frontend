export interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  limitType: number;
  loginName: string;
  password?: string;
  isActive: boolean;
  isApproved?: boolean;
  isSupervise?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
