import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './entities/permission.entity';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User } from 'src/users/user.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,
  ) {}
  async create(createPermissionDto: CreatePermissionDto, user: User) {
    const { _id, email } = user;
    const { apiPath, method, module, name } = createPermissionDto;
    const isExist = await this.permissionModel.findOne({
      apiPath,
      method
    })
    if(isExist){
      throw new BadRequestException(`Permission với apiPath=${apiPath}, method=${method} đã tồn tại`)
    }
    const result = await this.permissionModel.create({
      name,
      apiPath,
      method,
      module,
      createdBy: { _id, email }
    });
    return {
      message: "Create permission successfully",
      result
    };
  }

  async findAll(page: number, limit: number, qs: string) {
    const { filter, projection, population, sort } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+page - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.permissionModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population) //tg tu join bang vs mysql
      .select(projection as any)
      .exec();

    return {
      message: 'Get all permission successfully',
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
    if(!mongoose.Types.ObjectId.isValid(id)){
      throw new BadRequestException("Not found permission")
    }
    const result = await this.permissionModel.findOne({
      _id: id
    })
    return {
      message: "Get permission by id successfully",
      result
    };
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto, user: User) {
    if(mongoose.Types.ObjectId.isValid(id)){
      throw new BadRequestException("Not found ")
    }
    const {_id, email} = user
    const result = await this.permissionModel.updateOne({
      _id: id
    },{
      ...updatePermissionDto,
      updatedBy:{
        _id,
        email
      }
    })
    return `This action updates a #${id} permission`;
  }

  async remove(id: string, user: User) {
    await Promise.all([
      this.permissionModel.updateOne(
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
      this.permissionModel.softDelete({
        _id: id,
      })
    ]);
    return {
      message: 'Delete resume successfully',
    };
  }
}
