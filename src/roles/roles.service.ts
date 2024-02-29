import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { User } from 'src/users/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './entities/role.entity';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { ADMIN_ROLE } from 'src/databases/sample';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}
  async create(createRoleDto: CreateRoleDto, user: User) {
    const {_id, email} = user
    const isExistedName = await this.roleModel.findOne({
      name: createRoleDto.name
    })
    if(isExistedName){
      throw new BadRequestException(`${createRoleDto.name} already existed before`)
    }
    const result = await this.roleModel.create({
      ...createRoleDto,
      createdBy:{
        _id,
        email
      }
    })
    return {
      message: "Create role successfully",
      result
    }
  }

  async findAll(page: number, limit: number, qs: string) {
    const { filter, projection, population, sort } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+page - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.roleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.roleModel
    .find(filter)
    .skip(offset)
    .limit(defaultLimit)
    .sort(sort as any)
    .populate(population) //tg tu join bang vs mysql
    .select(projection as any)
    .exec();

    return {
      message: 'Get all role successfully',
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
      throw new BadRequestException("Id not found")
    }
    const result = await this.roleModel.findOne({
      _id: id
    }).populate({
      path: "permissions",
      select: {
        _id: 1,
        apiPath: 1,
        name: 1,
        method: 1,
        module: 1
      }
    })
    return {
      message: "Get role by id successfully",
      result
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, user: User) {
    const {_id, email} = user
    if(mongoose.Types.ObjectId.isValid(id)){
      throw new BadRequestException("Id not found")
    }
    const isExistedName = await this.roleModel.findOne({
      name: updateRoleDto.name
    })
    if(isExistedName){
      throw new BadRequestException(`${updateRoleDto.name} already existed before`)
    }
    const result = await this.roleModel.updateOne({
      _id: id
    },
    {
      ...updateRoleDto,
      updatedBy:{
        _id,
        email
      }
    })
    return {
      message: "Update role successfully",
      result
    }
  }

  async remove(id: string, user: User) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      throw new BadRequestException("Id not found")
    }
    const foundUser = await this.roleModel.findOne({
      _id: id
    })
    if(foundUser.name === ADMIN_ROLE){
      throw new BadRequestException("Cannot delete role admin!!!!")
    }
    await Promise.all([
      this.roleModel.updateOne(
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
      this.roleModel.softDelete({
        _id: id,
      })
    ]);
    return {
      message: 'Delete role successfully',
    };
  }
}
