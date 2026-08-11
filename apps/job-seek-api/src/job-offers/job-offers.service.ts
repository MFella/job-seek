import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';

@Injectable()
export class JobOffersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createJobOfferDto: CreateJobOfferDto) {
    try {
      return await this.prisma.jobOffer.create({
        data: {
          ...createJobOfferDto,
          postedAt: new Date(createJobOfferDto.postedAt),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Job offer with url ${createJobOfferDto.url} already exists`,
        );
      }

      throw error;
    }
  }

  findAll() {
    return this.prisma.jobOffer.findMany({ orderBy: { postedAt: 'desc' } });
  }

  async findOne(id: string) {
    const jobOffer = await this.prisma.jobOffer.findUnique({ where: { id } });

    if (!jobOffer) {
      throw new NotFoundException(`Job offer ${id} not found`);
    }

    return jobOffer;
  }

  async update(id: string, updateJobOfferDto: UpdateJobOfferDto) {
    await this.findOne(id);

    return this.prisma.jobOffer.update({
      where: { id },
      data: {
        ...updateJobOfferDto,
        postedAt: updateJobOfferDto.postedAt
          ? new Date(updateJobOfferDto.postedAt)
          : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.jobOffer.delete({ where: { id } });
  }
}
