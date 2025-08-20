import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './user/guards/access-token.guard';
import { ConfigModule } from '@nestjs/config';
import { UploadModule } from './common/upload/upload.module';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UploadModule,
    MulterModule.register({ storage: null }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
