import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsEmail, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsString, MaxLength, MinLength, ValidateNested } from "class-validator"
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

    @IsNotEmpty({
        message: "Logo không được để trống!!!"
    })
    logo: string
}

export class CreateJobDto {
    @IsString({
        message:"Name phải có định dạng string"
    })
    @IsNotEmpty({
        message: "Name không được để trống!!!"
    })
    name: string

    @IsString({
        //test tung phan tu trong array
        each: true,
        message:"Skills phải có định dạng string"
    })
    @IsNotEmpty({
        message:"Skills không được để trống!!!"
    })
    @IsArray({
        message: 'Skills phải có định dạng array string!!!',
      })
    skills: string[]

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company

    @IsNumber()
    @IsNotEmpty({
        message: "Salary không được để trống!!!"
    })
    salary: number

    @IsNumber()
    @IsNotEmpty({
        message: "Quantity không được để trống!!!"
    })
    quantity: number


    @IsNotEmpty({
        message: "Level không được để trống!!!"
    })
    @IsString({
        message:"Level phải có định dạng string"
    })
    level: string

    @IsString({
        message:"Description phải có định dạng string"
    })
    @IsNotEmpty({
        message:"Description không được để trống!!!"
    })
    description: string

    @IsString({
        message:"Location phải có định dạng string"
    })
    @IsNotEmpty({
        message:"Location không được để trống!!!"
    })
    location: string

    @IsDate({
        message:"StartDate phải có định dạng Date!!!"
    })
    @Transform(({value}) => new Date(value))
    @IsNotEmpty({
        message:"StartDate không được để trống!!!"
    })
    startDate: Date

    @IsDate({
        message:"EndDate phải có định dạng Date!!!"
    })
    @Transform(({value}) => new Date(value))
    @IsNotEmpty({
        message:"EndDate không được để trống!!!"
    })
    endDate: Date

    @IsBoolean({
        message:"IsActive phải có định dạng Boolean!!!"
    })
    @IsNotEmpty({
        message:"IsActive không được để trống!!!"
    })
    isActive: boolean

    // @IsString({
    //     message:"Logo phải có định dạng string"
    // })
    // @IsNotEmpty({
    //     message:"Logo không được để trống!!!"
    // })
    // logo: string
}