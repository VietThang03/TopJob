import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import mongoose from 'mongoose';

export class CreateRoleDto {
  @IsString({
    message: 'Name phải có định dạng string!!!',
  })
  @IsNotEmpty({
    message: 'Name không được để trống!!!',
  })
  name: string;

  @IsNotEmpty({
    message: 'Description không được để trống!!!',
  })
  @IsString({
    message: 'Description phải có định dạng string!!!',
  })
  description: string;

  @IsNotEmpty({
    message: 'IsActive không được để trống!!!',
  })
  @IsBoolean({
    message: 'IsActive phải có định dạng boolean!!!',
  })
  isActive: boolean;

  @IsNotEmpty({
    message: 'Permissions không được để trống!!!',
  })
  @IsMongoId({
    each: true,
    message: 'Permissions phải có định dạng mongo object id!!!',
  })
  @IsArray({
    message: 'Permissions phải có định dạng Array',
  })
  permissions: mongoose.Schema.Types.ObjectId[];
}
