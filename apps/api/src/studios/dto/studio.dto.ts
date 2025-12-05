import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsBoolean, 
  IsArray, 
  Min, 
  Max 
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateStudioDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  postalCode: string;

  @IsOptional()
  @IsString()
  country?: string = 'France';

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  surface?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  capacity?: number = 2;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  bedrooms?: number = 1;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  bathrooms?: number = 1;

  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  pricePerNight: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isAvailable?: boolean = true;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  minStay?: number = 1;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @Max(365)
  maxStay?: number = 30;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[] = [];

  @IsOptional()
  @IsString()
  primaryPhoto?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[] = [];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rules?: string[] = [];
}

export class UpdateStudioDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsNumber()
  surface?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  bathrooms?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  pricePerNight?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minStay?: number;

  @IsOptional()
  @IsNumber()
  @Max(365)
  maxStay?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsString()
  primaryPhoto?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rules?: string[];
}
