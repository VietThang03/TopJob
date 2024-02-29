import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateSubscriberDto {
  @IsNotEmpty({
    message: 'Name không được để trống!!!',
  })
  @IsString({
    message: 'Name phải có định dạng string!!!',
  })
  name: string;

  @IsNotEmpty({
    message: 'Email không được để trống!!!',
  })
  @IsString({
    message: 'Email phải có định dạng string!!!',
  })
  @IsEmail({},{
    message: "Email khồn đúng định dạng!!"
  })
  email: string;

  @IsNotEmpty({
    message: 'Skills không được để trống!!!',
  })
  @IsString({
    each: true,
    message: 'Skills phải có định dạng string!!!',
  })
  @IsArray({
    message: 'Skills phải có định dạng array string!!!',
  })
  skills: string[];
}
