import { UseGuards } from "@nestjs/common";
import { Query, Resolver, Args, Mutation } from "@nestjs/graphql";
import { Event } from "./model/event";
import { EventService } from "./event.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CreateEventInput } from "./dto/create-event.input";
import { JwtPayload } from "../../common/interfaces/jwt-payload";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { Role } from "../../common/interfaces/role";
import { Roles } from "../../common/decorators/roles.decorator";
import { FindAll } from "./dto/find-all.arg";
import { UpdateEventInput } from "./dto/update-event.input";
import { EventAndCount } from "./model/event-and-count";
import { SerialCode } from "./model/serial-code";

@Resolver(() => Event)
export class EventResolver {
  constructor(private readonly eventService: EventService) {}

  @Query(() => Event, { nullable: true })
  async event(@Args("id") id: string): Promise<Event> {
    return await this.eventService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.admin, Role.agency, Role.client)
  @Query(() => EventAndCount)
  async events(
    @CurrentUser() currentUser: JwtPayload,
    @Args() findOptions: FindAll
  ): Promise<EventAndCount> {
    return await this.eventService.findAll(currentUser, findOptions);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.admin, Role.agency, Role.client)
  @Mutation(() => Event)
  async createEvent(
    @CurrentUser() currentUser: JwtPayload,
    @Args("createEventInput") createEventInput: CreateEventInput
  ): Promise<Event> {
    return await this.eventService.create(currentUser, createEventInput);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.admin, Role.agency, Role.client)
  @Mutation(() => Event)
  async updateEvent(
    @CurrentUser() currentUser: JwtPayload,
    @Args("updateEventInput") updateEventInput: UpdateEventInput
  ): Promise<Event> {
    return await this.eventService.update(currentUser, updateEventInput);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.admin, Role.agency, Role.client)
  @Mutation(() => Boolean)
  async deleteEvent(
    @CurrentUser() currentUser: JwtPayload,
    @Args("id") id: string
  ): Promise<boolean> {
    return await this.eventService.delete(currentUser, id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.admin, Role.agency, Role.client)
  @Mutation(() => Boolean)
  async deleteEvents(
    @CurrentUser() currentUser: JwtPayload,
    @Args("ids", { type: () => [String] }) ids: string[]
  ): Promise<boolean> {
    return await this.eventService.deletes(currentUser, ids);
  }

  @Mutation(() => SerialCode)
  async exchangeCode(@Args("code") code: string): Promise<SerialCode> {
    return await this.eventService.exchangeCode(code);
  }
}
