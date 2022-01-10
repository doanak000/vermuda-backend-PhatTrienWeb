import { UserEntity } from "./../../common/entities/user.entity";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  FindManyOptions,
  getConnection,
  Repository,
  SelectQueryBuilder,
} from "typeorm";
import { EventEntity } from "../../common/entities/event.entity";
import { SerialCodeEntity } from "../../common/entities/serial-code.entity";
import { QRManageEntity } from "../../common/entities/qrmanage.entity";
import { CreateQrmanageInput } from "./dto/create-qrmanage.dto";
import { PrizeEntity } from "../../common/entities/prize.entity";
import { JwtPayload } from "../../common/interfaces/jwt-payload";
import { FindAll } from "./dto/find-all.arg";
import { Role } from "../../common/interfaces/role";
import { QrmanageAndCount } from "./model/qrmanage-and-count";
import { UpdateQrmanageInput } from "./dto/update-qrmanage.dto";

@Injectable()
export class QrmanageService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventEntity: Repository<EventEntity>,
    @InjectRepository(QRManageEntity)
    private readonly qrmanageEntity: Repository<QRManageEntity>,
    @InjectRepository(UserEntity)
    private readonly userEntity: Repository<UserEntity>
  ) {}

  async findAll(
    user: JwtPayload,
    { limit, offset, eventId, qrmanageId, searchText }: FindAll
  ): Promise<QrmanageAndCount> {
    const findOptions: FindManyOptions<QRManageEntity> = {
      take: limit,
      skip: offset,
      relations: [
        "event",
        "owner",
        "event.prizes",
        "serialCodes",
        "event.owner",
        "event.owner.agency",
      ],
      order: {
        id: "DESC",
      },
    };

    const findCondition = (qb: SelectQueryBuilder<QRManageEntity>) => {
      qb.where("1 = 1");
      if (user.role === Role.client) {
        qb.andWhere("QRManageEntity__event.ownerId = :ownerId", {
          ownerId: user.id,
        });
      }

      if (user.role === Role.agency) {
        qb.andWhere(
          "(QRManageEntity__event.ownerId = :ownerId OR QRManageEntity__event__owner__agency.id = :agencyId)",
          {
            ownerId: user.id,
            agencyId: user.id,
          }
        );
      }

      if (searchText) {
        qb.andWhere(
          "(QRManageEntity.memo like :searchText OR QRManageEntity__event.name like :searchText)",
          {
            searchText: `%${searchText}%`,
          }
        );
      }

      if (eventId) {
        qb.andWhere("QRManageEntity.eventId = :eventId", { eventId });
      }
      if (qrmanageId) {
        qb.andWhere("QRManageEntity.id = :qrmanageId", { qrmanageId });
      }
      qb.andWhere("QRManageEntity__serialCodes.qrmanageId IS NOT NULL");
    };

    findOptions.where = findCondition;

    const [qrmanages, count] = await this.qrmanageEntity.findAndCount(
      findOptions
    );

    return {
      count,
      qrmanages: qrmanages.map((qrmanage) => {
        const prizes = qrmanage.event.prizes.map((prize) => {
          const serialCodesByPrize = qrmanage.serialCodes.filter(
            (serial) => serial.prizeId === prize.id
          );
          return {
            ...prize,
            serialCodes: serialCodesByPrize,
          };
        });
        return {
          ...qrmanage,
          countSerialCodes: qrmanage.serialCodes.length,
          expDate: qrmanage.serialCodes[0].expDate,
          prizes,
        };
      }),
    };
  }

  async createQrmanage(
    user: JwtPayload,
    { eventId, memo, expDate, prizes: prizesInput }: CreateQrmanageInput,
    isNew?: boolean
  ): Promise<boolean> {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const event = await this.eventEntity.findOne(eventId);
      if (!event) throw new NotFoundException("Event not found!");

      await this.checkLinkingUser(event.ownerId, user);

      const qrmanage = new QRManageEntity();
      qrmanage.memo = memo;
      qrmanage.eventId = eventId;
      qrmanage.ownerId = user.id;
      const newQrmanage = await queryRunner.manager.save(qrmanage);
      const currentCreate = await queryRunner.manager.count(QRManageEntity, {
        where: { eventId: eventId },
      });

      let newPrizes: { numberOfCode: number; id: string }[] = [];
      if (isNew) {
        const prizes: PrizeEntity[] = [];
        prizesInput.forEach((item) => {
          const prize = new PrizeEntity();
          prize.name = item.name;
          prize.rank = item.rank;
          prize.imageUrl = item.imageUrl;
          prize.numberOfCode = item.numberOfCode;
          prize.eventId = eventId;
          prize.videoId = item.videoId;
          prize.qrmanageId = newQrmanage.id;

          prizes.push(prize);
        });
        newPrizes = await queryRunner.manager.save(prizes);
      } else {
        newPrizes = [...prizesInput];
      }

      const serialCodes: SerialCodeEntity[] = [];
      newPrizes.forEach((item) => {
        for (let i = 0; i < item.numberOfCode; i++) {
          const serialCode = new SerialCodeEntity();
          serialCode.code = `${currentCreate}${i}${Math.random()
            .toString()
            .slice(2, 10 - (i + "").length)
            .toString()}`;
          serialCode.eventId = eventId;
          serialCode.qrmanageId = newQrmanage.id;
          serialCode.expDate = new Date(expDate);
          serialCode.prizeId = item.id;
          serialCodes.push(serialCode);
        }
      });
      await queryRunner.manager.insert(SerialCodeEntity, serialCodes);

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      queryRunner.rollbackTransaction();
      throw new BadRequestException();
    } finally {
      await queryRunner.release();
    }
  }

  async updateQrmanage(
    user: JwtPayload,
    id: string,
    { memo }: UpdateQrmanageInput
  ): Promise<boolean> {
    const qrmanage = await this.qrmanageEntity.findOne(id, {
      relations: ["event"],
    });
    if (!qrmanage) {
      throw new NotFoundException();
    }

    await this.checkLinkingUser(qrmanage.event.ownerId, user);
    qrmanage.memo = memo;
    await this.qrmanageEntity.save(qrmanage);
    return true;
  }

  async checkLinkingUser(ownerIdOfEvent: string, currentUser: JwtPayload) {
    if (currentUser.role !== Role.admin) {
      if (
        currentUser.role === Role.agency &&
        ownerIdOfEvent !== currentUser.id
      ) {
        const clientsOfAgency = await this.userEntity.find({
          where: {
            agency: {
              id: currentUser.id,
            },
          },
        });
        const clientOfAgency = clientsOfAgency.find(
          (client) => client.id == ownerIdOfEvent
        );
        if (!clientOfAgency) throw new ForbiddenException();
      } else {
        if (ownerIdOfEvent !== currentUser.id) {
          throw new ForbiddenException();
        }
      }
    }
  }
}
