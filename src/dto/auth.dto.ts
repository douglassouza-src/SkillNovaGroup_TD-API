export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  role: 'MASTER' | 'MANAGER' | 'COORDINATOR' | 'TECHNICIAN';
  teamId: string | null;
}