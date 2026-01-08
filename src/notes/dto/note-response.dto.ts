import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for note response (without content)
 */
export class NoteResponseDto {
  @ApiProperty({ description: 'Unique identifier of the note' })
  id: string;

  @ApiProperty({ description: 'Title of the note' })
  title: string;

  @ApiProperty({ description: 'Date when the note was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the note was last modified' })
  modifiedAt: Date;
}

/**
 * DTO for note response with content (full details)
 */
export class NoteDetailResponseDto extends NoteResponseDto {
  @ApiProperty({ description: 'Content of the note' })
  content: string;
}
