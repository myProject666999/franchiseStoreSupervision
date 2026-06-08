import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const user = await this.userService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (user.status !== 1) {
      throw new UnauthorizedException('账号已被禁用');
    }

    const payload = {
      id: user.id,
      username: user.username,
      realName: user.realName,
      role: user.role,
      areaId: user.areaId,
    };

    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        phone: user.phone,
        role: user.role,
        areaId: user.areaId,
        avatar: user.avatar,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}
