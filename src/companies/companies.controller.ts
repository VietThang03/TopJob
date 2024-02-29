import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { User } from 'src/decorator/customize';
import { User as UserType } from 'src/users/user.interface';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto, @User() user: UserType) {
    return this.companiesService.create(createCompanyDto, user);
  }

  @Get()
  findAll(@Query("current") page: string, @Query("pageSize") limit: string, @Query() qs: string) {
    return this.companiesService.findAll(+page, +limit, qs);
  }

  @Get(':id')
  findOneCompany(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto, @User() user: UserType) {
    return this.companiesService.update(id, updateCompanyDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: UserType) {
    return this.companiesService.remove(id, user);
  }
}