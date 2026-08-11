import { IsISO8601, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateJobOfferDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  company!: string;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsString()
  @IsNotEmpty()
  source!: string;

  @IsUrl()
  url!: string;

  @IsISO8601()
  postedAt!: string;
}
