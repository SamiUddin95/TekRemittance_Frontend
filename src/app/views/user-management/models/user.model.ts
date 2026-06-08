export interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  userType?: string;
  limitType: number;
  loginName: string;
  password?: string;
  isActive: boolean;
  isApproved?: boolean;
  isSupervise?: boolean;
  hubs?: Array<{ code: string; name: string }>;
  bankBranches?: Array<{ code: string; name: string }>;
  createdAt?: Date;
  updatedAt?: Date;
}
