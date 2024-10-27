import {repository} from '@loopback/repository';
import {post, requestBody} from '@loopback/rest';
import {compareSync} from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import {AdminUserRepository} from '../repositories';

export class AdminAuthController {
  constructor(
    @repository(AdminUserRepository)
    public adminUserRepository: AdminUserRepository,
  ) {}

  @post('/admin/login')
  async login(
    @requestBody() credentials: {username: string; password: string},
  ): Promise<object> {
    const user = await this.adminUserRepository.findOne({
      where: {username: credentials.username},
    });

    if (!user) {
      return {success: false, message: 'Usuario no encontrado'};
    }

    const passwordMatch = compareSync(credentials.password, user.password);
    if (!passwordMatch) {
      return {success: false, message: 'Contraseña incorrecta'};
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET || 'mysecret',
      {expiresIn: '1h'},
    );

    return {
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      name: user.name,
    };
  }
}
