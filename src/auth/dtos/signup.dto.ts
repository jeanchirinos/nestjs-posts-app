import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class SignUpDto {
  @IsEmail()
  email: string

  @IsNotEmpty()
  password: string

  @IsString()
  @IsOptional()
  name?: string
}
