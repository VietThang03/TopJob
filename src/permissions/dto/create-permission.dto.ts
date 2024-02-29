import { IsMongoId, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator"
import mongoose from "mongoose"

export class CreatePermissionDto {
    @IsString({
        message: "Name phải có định dạng string!!!"
    })
    @IsNotEmpty({
        message: "Name không được để trống!!!"
    })
    name: string

    @IsNotEmpty({
        message:"ApiPath không được để trống!!!"
    })
    @IsString({
        message: 'ApiPath is a mongo id'
    })
    apiPath: string

    @IsNotEmpty({
        message:"Method không được để trống!!!"
    })
    @IsString({
        message: "Method phải có định dạng string!!!"
    })
    method: string

    @IsNotEmpty({
        message:"Module không được để trống!!!"
    })
    @IsString({
        message: "Module phải có định dạng string!!!"
    })
    module: string
}

