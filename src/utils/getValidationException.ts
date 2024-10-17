import { BadRequestException, ValidationError } from '@nestjs/common'

export function getValidationException(errors: ValidationError[]) {
  const errorsString = errors.map(error => Object.values(error.constraints).join(', ')).join(' | ')

  const message = process.env.NODE_ENV === 'development' ? errorsString : 'Validation failed'

  throw new BadRequestException(message)
}
