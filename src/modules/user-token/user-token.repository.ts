import { EntityRepository, Repository } from "typeorm";
import { UserToken } from "./user-token.entity";


@EntityRepository(UserToken)
export class UserTokenRepository extends Repository<UserToken> {
}