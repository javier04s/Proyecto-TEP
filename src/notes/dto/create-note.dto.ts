import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO for creating a new note
 */
export class CreateNoteDto {
  @ApiProperty({
    description: 'Title of the note',
    example: 'My First Note',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Content of the note',
    example: 'This is the content of my first note',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
