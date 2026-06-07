import { UserRole } from '../../../entities/user.entity';

export class AuthResponse {
  accessToken: string;
  user: {
    id: number;
    username: string;
    realName: string;
    phone: string;
    role: UserRole;
    areaId: number | null;
    status: number;
  };
}
