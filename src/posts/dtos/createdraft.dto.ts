import { IsOptional, IsString } from 'class-validator'

export class CreateDraftDto {
  @IsString()
  title: string

  @IsString()
  @IsOptional()
  content?: string
}
