import { IsEmail, IsMongoId, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator"
import mongoose from "mongoose"

export class CreateResumeDto {
    @IsString({
        message: "Url phải có định dạng string!!!"
    })
    @IsNotEmpty({
        message: "Url không được để trống!!!"
    })
    url: string

    @IsNotEmpty({
        message:"CompanyId không được để trống!!!"
    })
    @IsMongoId({
        message: 'CompanyId is a mongo id'
    })
    companyId: mongoose.Schema.Types.ObjectId

    @IsNotEmpty({
        message:"JobId không được để trống!!!"
    })
    @IsMongoId({
        message: 'JobId is a mongo id'
    })
    jobId: mongoose.Schema.Types.ObjectId
}

