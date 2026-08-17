export interface TeamDTO {
  id: string;
  name: string;
  description: string | null;
  managerId: string | null;
  coordinatorId: string | null;
  isActive: boolean;
  createdAt: Date;
  createdBy: string | null;
  updatedAt: Date;
  updatedBy: string | null;
  deactivatedAt: Date | null;
  deactivatedBy: string | null;
}

export interface TeamListDTO {
  id: string;
  name: string;
  description: string | null;
  managerId: string | null;
  managerName: string | null;
  coordinatorId: string | null;
  coordinatorName: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}