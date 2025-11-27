import { IsNotEmpty, IsInt, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  @IsInt()
  studioId: number;

  @IsNotEmpty()
  @IsInt()
  guestId: number;

  @IsNotEmpty()
  @IsDateString()
  checkIn: string;

  @IsNotEmpty()
  @IsDateString()
  checkOut: string;

  @IsOptional()
  @IsString()
  specialRequests?: string;

  @IsOptional()
  @IsInt()
  nights?: number;

  @IsOptional()
  @IsInt()
  subtotal?: number;

  @IsOptional()
  @IsInt()
  total?: number;
}

export class UpdateReservationDto {
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @IsOptional()
  @IsString()
  specialRequests?: string;
}   
