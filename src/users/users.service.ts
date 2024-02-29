import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.schema';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User as UserType } from './user.interface';
import { Role, RoleDocument } from 'src/roles/entities/role.entity';
import { USER_ROLE } from 'src/databases/sample';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>
  ) {}
  // create(createUserDto: CreateUserDto) {
  //   return 'This action adds a new user';
  // }
  hashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  async create(createUserDto: CreateUserDto, user: UserType) {
    const {address, age, company, email, gender, name, password, role} = createUserDto
    const isExist = await this.userModel.findOne({email});
    if (isExist) {
      throw new BadRequestException(`Email ${email} already existed!!!`);
    }
    const hashPassword = this.hashPassword(password);
    return await this.userModel.create({
      email,
      password: hashPassword,
      name:name,
      address,
      age,
      company,
      role,
      gender,
      createdBy:{
        _id: user._id,
        email: user.email
      }
    });
  }

  async register(user: RegisterUserDto) {
    const hashPassword = this.hashPassword(user.password);

    const isExist = await this.userModel.findOne({ email: user.email });
    if (isExist) {
      throw new BadRequestException(`Email ${user.email} already existed!!!`);
    }

    const userRole = await this.roleModel.findOne({
      name: USER_ROLE
    })

    return await this.userModel.create({
      name: user.name,
      email: user.email,
      gender: user.gender,
      age: user.age,
      addrres: user.address,
      password: hashPassword,
      role: userRole._id,
    });
  }

  async findAll(page: number, limit: number, qs: string) {
    const { filter, projection, population, sort } = aqp(qs);
    //delete current voi pageSize de tranh filter query 2 trg nay vao database
    delete filter.current;
    delete filter.pageSize;

    //cong thuc phan trang
    let offset = (+page - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    
    const result = await this.userModel
    .find(filter)
    .skip(offset)
    .limit(defaultLimit)
    .sort(sort as any)
    .populate(population) //tg tu join bang vs mysql
    .select(projection as any)
    .exec();

    return {
      message: 'Get all user successfully',
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
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Not found user';
    return await this.userModel.findOne({
      _id: id,
    }).select("-password").populate({
      path: "role",
      select: {
        name: 1,
        _id: 1
      }
    });
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({
      email: username,
    }).populate({
      path: "role",
      select: {
        name: 1
      }
    });
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async update(updateUserDto: UpdateUserDto, user: UserType, id: string) {
    return await this.userModel.updateOne(
      {
        _id: id,
      },
      {
        ...updateUserDto,
        updatedBy:{
          _id: user._id,
          email: user.email
        }
      },
    );
  }

  async remove(id: string, user: UserType) {
    if(!mongoose.Types.ObjectId.isValid(id)){
      return 'Not found user'
    }
    // const foundUser = await this.userModel.findOne({
    //   _id: id
    // })
    // if(foundUser.role === "ADMIN"){
    //   throw new BadRequestException("Cannot delete role admin!!!")
    // }
     await this.userModel.updateOne({
      _id: id,
    },{
      deletedBy:{
        _id: user._id,
        email: user.email
      }
    });
    return this.userModel.softDelete({
      _id: id
    })
  }
}
