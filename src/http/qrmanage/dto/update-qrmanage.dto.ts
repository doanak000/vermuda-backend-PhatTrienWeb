import {  InputType, OmitType } from "@nestjs/graphql";
import { CreateQrmanageInput } from "./create-qrmanage.dto";

@InputType()
export class UpdateQrmanageInput extends OmitType(CreateQrmanageInput, ['eventId', 'expDate', 'prizes']) {

}
