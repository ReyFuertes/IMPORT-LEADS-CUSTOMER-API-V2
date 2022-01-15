import { Repository, EntityRepository, getCustomRepository } from 'typeorm';
import * as _ from 'lodash';
import { IUserDto, UserStatusType } from './user.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';
import { sqlOp } from 'src/models/generic.model';
import { UserTokenRepository } from '../user-token/user-token.repository';

@EntityRepository(User)
export class UserRepository extends Repository<User> {

  async updateUser(dto: IUserDto): Promise<IUserDto> {
    try {
      const user = new User();
      user.id = dto?.id;
      user.username = String(dto?.username).toLowerCase();
      user.salt = await bcrypt.genSalt();
      user.password = await this.hashPassword(dto?.password, user.salt);
      const updated_user = await this.save(user);
      return {
        id: updated_user?.id,
        username: updated_user?.username,
        created_at: updated_user?.created_at
      }
    } catch (error) {
      throw new BadRequestException(`User update failed: ${error}`);
    }
  }

  async getById(id: string): Promise<IUserDto> {
    const query = this.createQueryBuilder('user');
    let result: IUserDto = await query
      .select(['id', 'username', 'created_at'])
      .where("id = :id", { id: id })
      .orderBy('created_at', 'DESC')
      .getRawOne();

    return {
      id: result?.id,
      username: result?.username,
      created_at: result?.created_at
    }
  }

  async getUsers(dto: any): Promise<IUserDto[]> {
    const query = this.createQueryBuilder('user')
      .select(['id', 'username', 'created_at'])
      .orderBy('created_at', 'DESC');

    const where = dto;
    const page = Object.assign({}, {
      take: dto?.take,
      skip: dto?.skip
    });
    delete where?.skip;
    delete where?.take;

    try {
      Object.entries(where)?.forEach(c => {
        const obj = Object.assign({}, Object.entries(c)
          .reduce((acc, [k, v]) => ({ ...acc, [c[0]]: `%${v}%` }), {})
        );
        query.orWhere(`${Object.keys(obj)} ${sqlOp.iLike} :${Object.keys(obj)}`, obj)
      });
    } catch (error) {
      throw new BadRequestException();
    }
    if (page?.skip) {
      query.skip(page?.skip)
    }
    if (page?.take) {
      query.take(page?.take)
    }

    let results: IUserDto[] = await query.getRawMany();
    const response = await Promise.all(results.map(async (user) => {
      return {
        id: user?.id,
        username: user?.username,
        created_at: user?.created_at
      }
    }));
    return response;
  }

  async approve(dto: IUserDto): Promise<void> {
    const user = await this.findOne({ id: dto.id });
    await this.save(Object.assign({}, user, { status: UserStatusType.Approved }));
  }

  async hashPassword(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }

  async deleteUser(id: string): Promise<IUserDto> {
    const exist = await this.findOne({ id });
    if (exist) {
      this.createQueryBuilder()
        .delete()
        .from(User)
        .where("id = :id", { id })
        .execute();

      delete exist.password;
      delete exist.username;
      delete exist.salt;

      return exist;
    }
    return null;
  }

  async createUser(dto: IUserDto, curr_user: any): Promise<IUserDto> {
    const exist = await this.findOne({ username: dto.username.toLowerCase() });
    if (!exist && dto) {
      const user = new User();
      user.username = String(dto?.username).toLowerCase();
      user.salt = await bcrypt.genSalt();
      user.password = await this.hashPassword(dto?.password, user.salt);
      if (dto?.is_master_admin === null) {
        user.is_master_admin = false;
      } else {
        user.is_master_admin = dto?.is_master_admin;
      }
      if (dto?.create_admin === true) {
        const user_token_repo = getCustomRepository(UserTokenRepository);
        const token = await user_token_repo.findOne({ app_token: dto.create_admin_token });
        if (!token) {
          throw new BadRequestException(`User token failed.`);
        }
      }
      const new_user = await this.save(user);

      return {
        id: new_user?.id,
        username: new_user?.username,
        created_at: new_user?.created_at
      }
    }
  }
}


