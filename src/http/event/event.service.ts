import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as moment from 'moment-timezone';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEntity } from '../../common/entities/event.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Event } from './model/event';
import { CreateEventInput } from './dto/create-event.input';
import { JwtPayload } from '../../common/interfaces/jwt-payload';
import { UserEntity } from '../../common/entities/user.entity';
import { assignPartial } from '../../utils/utils';
import { FindAll } from './dto/find-all.arg';
import { UpdateEventInput } from './dto/update-event.input';
import { Role } from '../../common/interfaces/role';
import { EventAndCount } from './model/event-and-count';
import * as _ from 'lodash';
import { SerialCodeEntity } from '../../common/entities/serial-code.entity';
import { SerialCodeStatus } from '../../common/interfaces/serial-code-status';
import { QrmanageService } from '../qrmanage/qrmanage.service';
import { SerialCode } from './model/serial-code';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventEntity: Repository<EventEntity>,
    @InjectRepository(UserEntity)
    private readonly userEntity: Repository<UserEntity>,
    @InjectRepository(SerialCodeEntity)
    private readonly serialCodeEntity: Repository<SerialCodeEntity>,
    private readonly qrmanageService: QrmanageService
  ) {}

  async assignValue(
    event: EventEntity,
    eventInput: CreateEventInput | UpdateEventInput
  ) {
    assignPartial(event, eventInput);
  }

  async canUpdate(
    currentUser: JwtPayload,
    event: EventEntity
  ): Promise<boolean> {
    if (currentUser.role === Role.admin) {
      return true;
    }
    if (currentUser.id !== event.owner.id) {
      return false;
    }
    if (currentUser.role === Role.agency) {
      const clientsOfAgency = await this.userEntity.find({
        where: {
          agency: {
            id: currentUser.id,
          },
        },
      });
      const clientOfAgency = clientsOfAgency.find(
        (client) => client.id == currentUser.id
      );
      if (clientOfAgency) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }

  canDelete(currentUser: JwtPayload, event: EventEntity): boolean {
    if (currentUser.role === Role.admin) {
      return true;
    }
    if (currentUser.id !== event.owner.id) {
      return false;
    }
    return true;
  }

  limitOfGet(currentUser: JwtPayload, query: SelectQueryBuilder<EventEntity>) {
    switch (currentUser.role) {
      case Role.client:
        query.andWhere("owner.id=:ownerId", { ownerId: currentUser.id });
        break;
      case Role.agency:
        query
          .leftJoin("owner.agency", "agency")
          .andWhere("(owner.id=:ownerId or owner.agency.id=:agencyId)", {
            ownerId: currentUser.id,
            agencyId: currentUser.id,
          });
        break;
    }
  }

  async findAll(
    currentUser: JwtPayload,
    { id, ownerId, offset, limit, orderBy, isExpired, searchText }: FindAll
  ): Promise<EventAndCount> {
    try {
      const queryEvent = this.eventEntity
        .createQueryBuilder("event")
        .skip(offset)
        .take(limit)
        .where("event.name like :searchText", { searchText: `%${searchText}%` })
        .leftJoinAndSelect("event.prizes", "prize")
        .leftJoinAndSelect("prize.video", "video")
        .leftJoinAndSelect("prize.serialCodes", "serialCodes")
        .leftJoinAndSelect("event.owner", "owner");

      if (orderBy) {
        const { field, direction } = orderBy;

        queryEvent.orderBy(
          `event.${field ? field : "createdAt"}`,
          direction ? direction : "DESC"
        );
      } else {
        queryEvent.orderBy({ "event.createdAt": "DESC" });
      }

      if (isExpired != null) {
        if (isExpired) {
          queryEvent.andWhere(
            `STR_TO_DATE(event.endTime, '%Y/%m/%d') < DATE(NOW())`
          );
        } else {
          queryEvent.andWhere(
            `STR_TO_DATE(event.endTime, '%Y/%m/%d') >= DATE(NOW())`
          );
        }
      }

      if (id) queryEvent.andWhere("event.id=:id", { id });
      if (ownerId) queryEvent.andWhere("owner.id=:ownerId", { ownerId });

      this.limitOfGet(currentUser, queryEvent);

      const [events, count] = await queryEvent.getManyAndCount();
      events.forEach((item) => item.prizes.sort((a, b) => a.rank - b.rank));
      return {
        count,
        events: events.map((event) => {
          const prizes = event.prizes.map((prize) => {
            return {
              ...prize,
              countSerialCodes: prize.serialCodes.length,
            };
          });
          return {
            ...event,
            prizes,
          };
        }),
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string): Promise<Event> {
    try {
      const queryEvent = this.eventEntity
        .createQueryBuilder("event")
        .leftJoinAndSelect("event.prizes", "prize")
        .leftJoinAndSelect("prize.video", "video")
        .leftJoinAndSelect("prize.serialCodes", "serialCodes")
        .leftJoinAndSelect("event.owner", "owner")
        .where("event.id=:id", { id });

      const event = await queryEvent.getOne();
      event.prizes.sort((a, b) => a.rank - b.rank);

      return event;
    } catch (error) {
      return error;
    }
  }

  async create(
    currentUser: JwtPayload,
    eventInput: CreateEventInput
  ): Promise<Event> {
    try {
      const prizes = [...eventInput.prizes];
      const event = new EventEntity();
      const owner = await this.userEntity.findOne(currentUser.id);
      if (!owner) throw new NotFoundException("The user was not found.");
      delete eventInput.prizes;
      await this.assignValue(event, eventInput);
      event.owner = owner;
      const newEvent = await this.eventEntity.save(event);
      await this.qrmanageService.createQrmanage(
        currentUser,
        {
          eventId: newEvent.id,
          expDate: new Date(event.endTime),
          prizes: prizes,
        },
        true
      );
      return newEvent;
    } catch (err) {
      switch (err.message.split(":")[0]) {
        case "ER_DUP_ENTRY":
          throw new BadRequestException(
            `${eventInput.name} Event already existed.`
          );
        default:
          throw err;
      }
    }
  }

  async update(
    currentUser: JwtPayload,
    updateEventInput: UpdateEventInput
  ): Promise<Event> {
    try {
      const event = await this.eventEntity.findOne(updateEventInput.id, {
        relations: ["prizes", "owner"],
      });
      if (!event) throw new NotFoundException("The event was not found");
      if (!this.canUpdate(currentUser, event))
        throw new ForbiddenException("You do not have permission to update the event.");
      await this.assignValue(event, updateEventInput);
      return await this.eventEntity.save(event);
    } catch (error) {
      throw error;
    }
  }

  async delete(currentUser: JwtPayload, id: string): Promise<boolean> {
    try {
      const event = await this.eventEntity.findOne(id, {
        relations: ["prizes", "owner"],
      });
      if (!this.canDelete(currentUser, event))
        throw new ForbiddenException("You do not have permission to delete events.");
      await this.eventEntity.remove(event);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async deletes(currentUser: JwtPayload, ids: string[]) {
    if (!ids.length) {
      throw new NotFoundException("Not found ID");
    }
    let events = await this.eventEntity.findByIds(ids, {
      relations: ["prizes", "owner", "owner.agency"],
    });
    if (currentUser.role !== Role.admin) {
      events = events.filter(
        (item) =>
          item.owner.id === currentUser.id ||
          item.owner.agency?.id === currentUser.id
      );
    }
    if (!events.length) {
      throw new NotFoundException("Not found");
    }
    if (events.length !== ids.length) {
      const failIds = _.difference(
        ids,
        events.map((item) => item.id)
      );
      throw new BadRequestException(
        "Event IDs:" + failIds.join(", ") + "Cannot be deleted."
      );
    }
    await this.eventEntity.delete(events.map((item) => item.id));
    return true;
  }

  async exchangeCode(code: string): Promise<SerialCode> {
    const serialCode = await this.serialCodeEntity.findOne(code, {
      relations: ["event", "prize", "prize.video"],
    });
    if (!serialCode || serialCode.status !== SerialCodeStatus.valid) {
      throw new BadRequestException("Lottery");
    }
    const tz = process.env.TIME_ZONE;
    const endCurrentDate = moment(new Date())
      .tz(tz)
      .format("YYYYMMDD");
    const expDateSerialCode = moment(serialCode.expDate).format("YYYYMMDD");
    const expEvent = moment(new Date(serialCode.event.endTime)).format(
      "YYYYMMDD"
    );

    if (expDateSerialCode < endCurrentDate) {
      throw new BadRequestException("QR code has expired");
    }
    if (expEvent < endCurrentDate) {
      throw new BadRequestException("The event is over.");
    }

    await this.eventEntity
      .createQueryBuilder()
      .update()
      .where("id=:eventId", { eventId: serialCode.eventId })
      .set({
        numberOfLotteryPeople: () => "numberOfLotteryPeople + 1",
      })
      .execute();

    serialCode.status = SerialCodeStatus.invalid;
    return await this.serialCodeEntity.save(serialCode);
  }
}
