import { IsString, IsNotEmpty, IsDate, IsOptional, MaxLength, MinDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    title: string;

    @Type(() => Date)
    @IsDate()
    @MinDate(new Date('1970-01-01'))
    occurrence: Date;

    @IsString()
    @IsOptional()
    @MaxLength(5000)
    description?: string;
}
