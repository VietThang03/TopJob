import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { User } from 'src/users/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Resume, ResumeDocument } from './entities/resume.entity';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,
  ) {}
  async create(createResumeDto: CreateResumeDto, user: User) {
    const { _id, email } = user;
    const { companyId, jobId, url } = createResumeDto;
    const newCV = await this.resumeModel.create({
      url,
      companyId,
      jobId,
      email,
      userId: _id,
      status: 'PENDING',
      createdBy: {
        _id,
        email,
      },
      history: [
        {
          status: 'PENDING',
          updatedAt: new Date(),
          updatedBy: {
            _id,
            email,
          },
        },
      ],
    });
    return {
      message: 'Send CV successfully',
      _id: newCV._id,
      createdAt: newCV.createdAt,
    };
  }

  async findAll(page: number, limit: number, qs: string) {
    // phan trang luon dung skip va limit
    const { filter, projection, population, sort } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+page - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
      .exec();

    return {
      message: 'Get all resume successfully',
      meta: {
        current: page, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  async findOne(id: string) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Not found resume');
    }
    const result = await this.resumeModel.findOne({
      _id: id,
    });
    return {
      message: 'Get resume by id successfully',
      result,
    };
  }

  async findUser(user: User) {
    const result = await this.resumeModel
      .findOne({
        userId: user._id,
      })
      .sort('-createdAt')
      .populate([
        {
          path: 'companyId',
          select: { name: 1 },
        },
        {
          path: 'jobId',
          select: { name: 1 },
        }
      ]);
      return {
        message: "Get user successfully",
        result
      }
  }

  async update(id: string, status: string, user: User) {
    const { _id, email } = user;
    const result = await this.resumeModel.updateOne(
      {
        _id: id,
      },
      {
        status,
        updatedBy: {
          _id,
          email,
        },
        $push: {
          history: {
            status,
            updatedAt: new Date(),
            updatedBy: {
              _id,
              email,
            },
          },
        },
      },
    );
    return {
      message: 'Update resume successfully',
      result,
    };
  }

  async remove(id: string, user: User) {
    await Promise.all([
      this.resumeModel.updateOne(
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
      this.resumeModel.softDelete({
        _id: id,
      }),
    ]);
    return {
      message: 'Delete resume successfully',
    };
  }
}
