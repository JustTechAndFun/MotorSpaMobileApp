import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { MotorServiceModule } from './motor_service/motor_service.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule, MotorServiceModule, DatabaseModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
