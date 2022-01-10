require("dotenv").config();
import * as ormconfig from "./ormconfig";
import { Module, DynamicModule } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./http/user/user.module";
import { AuthModule } from "./http/auth/auth.module";
import { EventModule } from "./http/event/event.module";
import { VideoModule } from "./http/video/video.module";
import { QrmanageModule } from "./http/qrmanage/qrmanage.module";

export function DatabaseOrmModule(): DynamicModule {
  return TypeOrmModule.forRoot(ormconfig);
}

@Module({
  imports: [
    QrmanageModule,
    TypeOrmModule.forRoot(ormconfig),
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: true,
      introspection: true,
      playground: true,
      formatError: (error) => {
        return error.extensions.exception.response || error;
      },
      context: ({ req }) => ({ req }),
    }),
    UserModule,
    VideoModule,
    EventModule,
    AuthModule,
  ],
})
export class AppModule {}
