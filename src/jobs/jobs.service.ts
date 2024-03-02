import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './entities/job.entity';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User } from 'src/users/user.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
  ) {}
  async create(createJobDto: CreateJobDto, user: User) {
    const {_id, email} = user
    const result = await this.jobModel.create({
      ...createJobDto,
      createdBy:{
        _id,
        email
      }
    })
    return {
      message: 'Create job successfully',
      result
    }
  }

  async findAll(page: number, limit: number, qs: string) {
    // phan trang luon dung skip va limit
    const { filter, projection, population, sort } = aqp(qs);
    delete filter.current
    delete filter.pageSize

    let offset = (+page - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .exec();

      return {
        message:'Get all job successfully',
        meta: {
          current: page, //trang hiện tại
          pageSize: limit, //số lượng bản ghi đã lấy
          pages: totalPages, //tổng số trang với điều kiện query
          total: totalItems // tổng số phần tử (số bản ghi)
          },
          result //kết quả query
      };
  }

  async findOne(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      throw new BadRequestException(`Not found company with ${id}`)
    }
   return await this.jobModel.findOne({
      _id: id
    })
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: User) {
    const {_id, email} = user
    const result = await this.jobModel.updateOne(
      {
        _id: id
      },{
        ...updateJobDto,
        updatedBy:{
          _id,
          email
        }
      }
    )
    return {
      message: 'Update job successfully',
      result
    }
  }

  async remove(id: string, user: User) {
    await Promise.all([
      this.jobModel.updateOne(
        {
          _id: id,
        },
        {
          deletedBy: {
            _id: user._id,
            email: user.email,
          },
        },
      ),
      this.jobModel.softDelete({
        _id: id,
      })
    ]);
    return {
      message: 'Delete job successfully',
    };
  }
}
