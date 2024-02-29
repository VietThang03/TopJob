import { Type } from "class-transformer";
import { IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, MaxLength, MinLength, ValidateNested } from "class-validator"
import mongoose from "mongoose";

class Company{
    @IsNotEmpty({
        message: "Id không được để trống!!!"
    })
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({
        message: "Name không được để trống!!!"
    })
    name: string
}

// Admin
export class CreateUserDto {
    @IsNotEmpty({
        message: "Name không được để trống!!!"
    })
    name: string

    @IsEmail({}, {
        message:"Email không hợp lệ!!!"
    })
    @IsNotEmpty({
        message:"Email không được để trống!!!"
    })
    email: string

    @IsNotEmpty({
        message:"Password không được để trống!!!"
    })
    @MinLength(6)
    @MaxLength(50)
    password: string

    @IsNotEmpty({
        message: "Age không được để trống!!!"
    })
    age: number

    @IsNotEmpty({
        message: "Gender không được để trống!!!"
    })
    gender: number

    @IsNotEmpty({
        message: "Address không được để trống!!!"
    })
    address: number

    @IsMongoId({
        message: 'Role phải có định dạng mongo object id!!!',
      })
    role: number

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company

}

// User
export class RegisterUserDto {
    @IsNotEmpty({
        message: "Name không được để trống!!!"
    })
    name: string

    @IsEmail({}, {
        message:"Email không hợp lệ!!!"
    })
    @IsNotEmpty({
        message:"Email không được để trống!!!"
    })
    email: string

    @IsNotEmpty({
        message:"Password không được để trống!!!"
    })
    @MinLength(6)
    @MaxLength(50)
    password: string

    @IsNotEmpty({
        message: "Age không được để trống!!!"
    })
    age: number

    @IsNotEmpty({
        message: "Gender không được để trống!!!"
    })
    gender: number

    @IsNotEmpty({
        message: "Address không được để trống!!!"
    })
    address: number
}
