export interface UserOptionDTO  {
  id: string;
  name: string;
  email: string;
  role: 'MASTER' | 'MANAGER' | 'COORDINATOR' | 'TECHNICIAN';
  teamId: string | null;
  isActive: boolean;
}