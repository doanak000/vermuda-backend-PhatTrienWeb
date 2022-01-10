import { UseGuards } from "@nestjs/common";
import { Resolver, Args, Mutation, Query } from "@nestjs/graphql";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { JwtPayload } from "../../common/interfaces/jwt-payload";
import { CreateQrmanageInput } from "./dto/create-qrmanage.dto";
import { FindAll } from "./dto/find-all.arg";
import { UpdateQrmanageInput } from "./dto/update-qrmanage.dto";
import { QrmanageAndCount } from "./model/qrmanage-and-count";
import { QrmanageService } from "./qrmanage.service";

@Resolver()
export class QrmanageResolver {
  constructor(private readonly qrmanageService: QrmanageService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => QrmanageAndCount)
  async qrmanages(
    @CurrentUser() user: JwtPayload,
    @Args() findAll: FindAll
  ): Promise<QrmanageAndCount> {
    return this.qrmanageService.findAll(user, findAll);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  createQrmanage(
    @CurrentUser() user: JwtPayload,
    @Args("input") input: CreateQrmanageInput
  ): Promise<boolean> {
    return this.qrmanageService.createQrmanage(user, input, false);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  updateQrmanage(
    @CurrentUser() user: JwtPayload,
    @Args("id") id: string,
    @Args("input") input: UpdateQrmanageInput
  ): Promise<boolean> {
    return this.qrmanageService.updateQrmanage(user, id, input);
  }
}
