import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

/**
 * DTO for updating an existing note
 */
export class UpdateNoteDto {
  @ApiProperty({
    description: 'Title of the note',
    example: 'Updated Title',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Content of the note',
    example: 'Updated content',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;
}
