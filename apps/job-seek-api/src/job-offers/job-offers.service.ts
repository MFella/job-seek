import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';

@Injectable()
export class JobOffersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createJobOfferDto: CreateJobOfferDto) {
    return this.prisma.jobOffer.create({
      data: {
        ...createJobOfferDto,
        postedAt: new Date(createJobOfferDto.postedAt),
      },
    });
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
