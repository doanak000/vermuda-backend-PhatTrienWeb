import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  getManager,
  SelectQueryBuilder,
  Transaction,
  TransactionManager,
  EntityManager,
} from "typeorm";
import * as _ from "lodash";
import { FindAllArg } from "./dto/find-all.args";
import { User } from "./types/user.type";
import { CreateUserInput } from "./dto/create-user.input";
import { assignOmit } from "../../utils/utils";
import { UserTypeEntity } from "./../../common/entities/user-type.entity";
import { JwtPayload } from "./../../common/interfaces/jwt-payload";
import { UpdateUserInput } from "./dto/update-user.input";
import { UserAndCount } from "./types/user-and-count.type";
import { Role } from "../../common/interfaces/role";
import { UserEntity } from "./../../common/entities/user.entity";
import { QRManageEntity } from "./../../common/entities/qrmanage.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntity: Repository<UserEntity>,
    @InjectRepository(UserTypeEntity)
    private readonly userTypeEntity: Repository<UserTypeEntity>,
    @InjectRepository(QRManageEntity)
    private readonly qrmanageEntity: Repository<QRManageEntity>
  ) {}

  canSetType(currentUserType: string, destType: string): boolean {
    if (currentUserType === Role.client) {
      return false;
    }
    if (currentUserType === Role.agency && destType !== Role.client) {
      return false;
    }
    return true;
  }

  canUpdate(currentUser: JwtPayload, user: UserEntity) {
    if (currentUser.role === Role.agency) {
      if (user.id !== currentUser.id && user.agency.id !== currentUser.id)
        return false;
    }
    return true;
  }

  canDelete(currentUserType: string, destUser: UserEntity): boolean {
    if (
      currentUserType === Role.agency &&
      destUser.userType.role !== Role.client
    ) {
      return false;
    }
    return true;
  }

  async getAdmin(): Promise<UserEntity> {
    const admin = await this.userEntity
      .createQueryBuilder("user")
      .leftJoin("user.userType", "userType")
      .where("userType.role=:userTypeName", { userTypeName: Role.admin })
      .getOne();
    if (!admin)
      throw new NotFoundException("Not Found");
    return admin;
  }

  async getAgency(agencyId: string): Promise<UserEntity> {
    return await this.userEntity
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.userType", "userType")
      .where("(userType.role='admin' OR userType.role='agency')")
      .andWhere("user.id=:agencyId", { agencyId })
      .getOne();
  }

  limitOfGetOne(
    query: SelectQueryBuilder<UserEntity>,
    currentUser: JwtPayload
  ) {
    switch (currentUser.role) {
      case Role.client:
        query.andWhere("user.currentUserId=:id", {
          currentUserId: currentUser.id,
        });
        break;
      case Role.agency:
        query.andWhere(
          "((userType.role IN('client') AND agency.id=:currentUserId) OR user.id=:id)",
          { currentUserId: currentUser.id, id: currentUser.id }
        );
        break;
    }
  }

  limitOfGet(query: SelectQueryBuilder<UserEntity>, currentUser: JwtPayload) {
    switch (currentUser.role) {
      case Role.client:
        query.andWhere("user.id=:id", { id: currentUser.id });
        break;
      case Role.agency:
        query.andWhere(
          "(userType.role IN('client') AND agency.id=:currentUserId)",
          {
            currentUserId: currentUser.id,
          }
        );
    }
  }

  async findOne(currentUser: JwtPayload, id: string): Promise<User> {
    const queryUser = this.userEntity
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.userType", "userType")
      .leftJoinAndSelect("user.agency", "agency")
      .where("user.id=:userId", { userId: id });
    this.limitOfGetOne(queryUser, currentUser);

    const user = await queryUser.getOne();
    if (!user) {
      return null;
    }
    return user;
  }

  async findOneById(id: string): Promise<User> {
    return await getManager()
      .getRepository(UserEntity)
      .createQueryBuilder()
      .addSelect("UserEntity.pwd")
      .leftJoinAndSelect("UserEntity.userType", "userType")
      .where("UserEntity.id = :id", { id: id })
      .getOne();
  }

  async findMaxcount(user: string): Promise<UserAndCount> {
    try {
      const queryUser = this.userEntity
        .createQueryBuilder("user")
        .addSelect("user.pwd")
        .leftJoinAndSelect("user.userType", "userType")
        .leftJoinAndSelect("user.agency", "agency")
        .orderBy({ "user.createdAt": "DESC" });
      // if (user) queryUser.andWhere('user.id=:user', { user: user });
      // if (user) queryUser.andWhere('userType.id=:user', { user: user });
      if (user) queryUser.andWhere("agency.id=:user", { user: user });

      const queryResult = await queryUser.getManyAndCount();
      return {
        count: queryResult[1],
        users: queryResult[0],
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(
    currentUser: JwtPayload,
    { skip, take, searchText, userType }: FindAllArg
  ): Promise<UserAndCount> {
    try {
      const queryUser = this.userEntity
        .createQueryBuilder("user")
        .addSelect("user.pwd")
        .leftJoinAndSelect("user.userType", "userType")
        .leftJoinAndSelect("user.agency", "agency")
        .skip(skip)
        .take(take)
        .orderBy({ "user.createdAt": "DESC" });
      if (userType) queryUser.andWhere("userType.id=:userType", { userType });
      if (searchText)
        queryUser.andWhere(
          "( LOWER(user.nameKanji) LIKE LOWER(:searchText) OR LOWER(user.companyName) LIKE LOWER(:searchText) OR LOWER(user.id) LIKE LOWER(:searchText))",
          {
            searchText: `%${searchText}%`,
          }
        );
      this.limitOfGet(queryUser, currentUser);

      const queryResult = await queryUser.getManyAndCount();
      return {
        count: queryResult[1],
        users: queryResult[0],
      };
    } catch (error) {
      throw error;
    }
  }

  async create(
    currentUser: JwtPayload,
    userInput: CreateUserInput
  ): Promise<User> {
    try {
      const { userTypeId, agencyId, maxClient } = userInput;

      let user = await this.userEntity.findOne(userInput.id);
      if (user) {
        throw new BadRequestException(
          "You cannot create an account because the entered user ID already exists. Please use a different ID."
        );
      } else {
        user = new UserEntity();
      }
      // find maxClient with user present
      const currentMaxClient = await this.userEntity.findOne(currentUser.id);

      const userType = await this.userTypeEntity.findOne(userTypeId);
      if (userType.role === Role.admin) {
        throw new BadRequestException("Unable to create admin user.");
      }
      if (!userType)
        throw new BadRequestException("User type not found");
      if (!this.canSetType(currentUser.role, userType.role))
        throw new ForbiddenException("Unable to set user type");
      let agency;
      const { id, role } = currentUser;
      switch (true) {
        case role === Role.admin && !!agencyId:
          agency = await this.getAgency(agencyId);
          break;
        case role === Role.admin && !agencyId:
          agency = await this.getAgency(id);
          break;
        case role === Role.agency && !!agencyId:
          agency = await this.getAgency(id);
          break;
        case role === Role.agency && !agencyId:
          throw new BadRequestException("I can't set an agency");
      }
      if (!agency) throw new NotFoundException("Not found");
      user.agency = agency;

      // Check create maxClient without Admin
      if (currentUser.role === Role.agency && maxClient !== -1) {
        throw new ForbiddenException("Unable to set user type");
      }

      // Check Admin create client with set agency
      const clientCount = await this.findMaxcount(agency.id);
      const clientMaxCount = clientCount.count + 1;
      if (
        currentUser.role === Role.admin &&
        agency.maxClient >= 0 &&
        clientMaxCount > agency.maxClient
      ) {
        throw new ForbiddenException(
          "The number of companies has exceeded the agency limit."
        );
      }

      // check maxCount and count create
      const clients = await this.findAll(currentUser, {
        skip: 0,
        take: 10,
        searchText: null,
        userType: "3",
      });
      const maxCount = clients.count + 1;
      if (currentUser.role !== Role.admin && currentMaxClient.maxClient > 0)
        if (
          userType.role === Role.client &&
          maxCount > currentMaxClient.maxClient
        ) {
          throw new ForbiddenException("Unable to set user type");
        }
      // check maxClient === 0
      if (
        currentUser.role === Role.agency &&
        currentMaxClient.maxClient === 0
      ) {
        throw new ForbiddenException("Unable to set user type");
      }

      assignOmit(user, userInput, ["userTypeId", "agencyId"]);

      user.userType = userType;
      return await this.userEntity.save(user);
    } catch (error) {
      throw error;
    }
  }

  @Transaction()
  async update(
    currentUser: JwtPayload,
    updateUser: UpdateUserInput,
    @TransactionManager() manager?: EntityManager
  ): Promise<User> {
    try {
      const { id, userTypeId, agencyId, maxClient } = updateUser;

      const user = await this.userEntity.findOne(id, {
        relations: ["userType", "agency"],
      });
      if (!user) throw new NotFoundException("The user was not found.");

      // Check to update user type
      if (userTypeId) {
        const userType = await this.userTypeEntity.findOne(userTypeId);
        if (userType.role === Role.admin && id !== user.id) {
          throw new BadRequestException("Unable to update admin user.");
        }
        if (!userType)
          throw new NotFoundException("Not found");
        if (!this.canSetType(currentUser.role, userType.role))
          throw new ForbiddenException();
        if (
          userType.role === Role.client &&
          user.userType.role === Role.agency
        ) {
          const clients = (
            await this.findAll(currentUser, {
              skip: 0,
              take: 0,
              searchText: null,
              userType: "client",
            })
          ).users;
          if (clients.length) {
            const admin = await this.getAdmin();
            clients.forEach((client) => {
              client.agency = admin;
            });
            await manager.getRepository(UserEntity).save(clients);
          }
        }
        user.userType = userType;
      }

      let agency;
      if (agencyId) {
        agency = await this.getAgency(agencyId);
        if (!agency)
          throw new NotFoundException("Not found");
      }
      if (
        currentUser.role !== Role.admin &&
        agencyId &&
        agencyId !== user.agency.id
      )
        // update agency
        throw new BadRequestException("I can't set an agency");
      if (!this.canUpdate(currentUser, user)) throw new ForbiddenException();
      assignOmit(user, updateUser, ["userTypeId", "agencyId", "id"]);
      if (currentUser.role === Role.admin && agencyId) {
        user.agency = agency;
      }

      //check role !== admin update
      const currentMaxClient = await this.userEntity.findOne(id);
      if (
        userTypeId === Role.client &&
        maxClient !== currentMaxClient.maxClient
      ) {
        throw new ForbiddenException("Unable to set user type");
      }

      // check update client by Admin set agency
      const findcount = await this.findMaxcount(updateUser.agencyId);
      const countAgency = findcount.count + 1;
      const maxClientAgency = await this.findOneById(updateUser.agencyId);
      const userUpdate = await this.findOneById(updateUser.id);

      if (
        maxClientAgency.maxClient >= 0 &&
        userUpdate.userType.role !== Role.agency &&
        countAgency > maxClientAgency.maxClient
      ) {
        throw new ForbiddenException(
          "The number of companies has exceeded the agency limit."
        );
      }
      // check maxClientCount limit
      const clients = await this.findMaxcount(user.id);
      const maxCount = clients.count;
      if (maxClient >= 0)
        if (currentUser.role === Role.admin && maxClient < maxCount) {
          throw new ForbiddenException(
            "Please set the upper limit of creating companies at least the current number of companies."
          );
        }
      return await manager.getRepository(UserEntity).save(user);
    } catch (error) {
      throw error;
    }
  }

  @Transaction()
  async delete(
    currentUser: JwtPayload,
    id: string,
    @TransactionManager() manager?: EntityManager
  ): Promise<boolean> {
    try {
      const user = await this.userEntity.findOne(id, {
        relations: ["userType"],
      });
      if (!user) {
        throw new NotFoundException("The user was not found.");
      }

      if (!this.canDelete(currentUser.role, user)) {
        throw new ForbiddenException();
      }
      await manager.getRepository(UserEntity).remove(user);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async deletes(currentUser: JwtPayload, ids: string[]): Promise<boolean> {
    try {
      const queryUser = this.userEntity
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.userType", "userType")
        .leftJoinAndSelect("user.agency", "agency")
        .whereInIds(ids);
      this.limitOfGet(queryUser, currentUser);
      const users = await queryUser.getMany();
      if (users.length !== ids.length) {
        const notFoundIds = _.difference(
          ids,
          users.map((item) => item.id)
        );
        throw new NotFoundException(
          "Not found: " + notFoundIds.join(",")
        );
      }

      const whereOptions = [];
      users.map((user) => {
        whereOptions.push({ ownerId: user.id });
      });

      const qrmanages = await this.qrmanageEntity.find({
        where: whereOptions,
      });
      if (qrmanages) {
        qrmanages.forEach((qrmanage) => {
          qrmanage.ownerId = null;
        });
        await this.qrmanageEntity.save(qrmanages);
      }

      await this.userEntity.remove(users);
      return true;
    } catch (error) {
      throw error;
    }
  }
}
