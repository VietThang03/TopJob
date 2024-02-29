import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { User } from 'src/users/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Subscriber, SubscriberDocument } from './entities/subscriber.entity';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(Subscriber.name)
    private subscriberModel: SoftDeleteModel<SubscriberDocument>,
  ) {}
  async create(createSubscriberDto: CreateSubscriberDto, user: User) {
    const {_id, email} = user
    const isExists = await this.subscriberModel.findOne({
      email: createSubscriberDto.email
    })
    if(isExists){
      throw new BadRequestException(`Email ${createSubscriberDto.email} đã tồn tại trên hệ thống!!`)
    }
    const result = await this.subscriberModel.create({
      ...createSubscriberDto,
      createdBy: {
        _id,
        email
      }
    })
    return {
      message: 'Create subscriber successfully!!!',
      result
    }
  }

  async findAll(page: number, limit: number, qs: string) {
    const { filter, projection, population, sort } = aqp(qs);
    //delete current voi pageSize de tranh filter query 2 trg nay vao database
    delete filter.current;
    delete filter.pageSize;

    let offset = (+page - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.subscriberModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.subscriberModel
    .find(filter)
    .skip(offset)
    .limit(defaultLimit)
    .sort(sort as any)
    .populate(population) //tg tu join bang vs mysql
    .select(projection as any)
    .exec();

    return {
      message: 'Get all subscriber successfully',
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
    const result = await this.subscriberModel.findOne({
      _id: id
    })
    return {
      message: "Get subcriber by id successfully",
      result
    }
  }

  async update(id: string, updateSubscriberDto: UpdateSubscriberDto, user: User) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      throw new BadRequestException("Id not found")
    }
    const {_id, email} = user
    const result = await this.subscriberModel.updateOne({
      _id: id
    },{
      ...updateSubscriberDto,
      updatedBy:{
        _id,
        email
      }
    })
    return {
      message: 'Update subscriber successfully',
      result
    }
  }

  async remove(id: string, user: User) {
    await Promise.all([
      this.subscriberModel.updateOne(
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
      this.subscriberModel.softDelete({
        _id: id,
      })
    ]);
    return {
      message: 'Delete subscriber successfully',
    };
  }
}
