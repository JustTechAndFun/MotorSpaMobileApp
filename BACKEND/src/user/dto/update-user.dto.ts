import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { ROLE } from '../enum/role';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiPropertyOptional({ example: 'Le Thi B', minLength: 2, maxLength: 100 })
    @IsOptional()
    @IsString()
    @Length(2, 100)
    name?: string;

    @ApiPropertyOptional({ enum: ROLE })
    @IsOptional()
    @IsEnum(ROLE)
    role?: ROLE; // only admin can change
}
