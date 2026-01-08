import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteResponseDto, NoteDetailResponseDto } from './dto/note-response.dto';

/**
 * Controller for managing notes
 * Provides REST endpoints for CRUD operations on notes
 */
@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  /**
   * Get all notes (without content)
   * Supports filtering and sorting
   * @param orderBy - Field to sort by (title, createdAt, modifiedAt)
   * @param order - Sort order (asc or desc)
   * @returns Array of notes without content
   */
  @Get()
  @ApiOperation({ summary: 'Get all notes (list view without content)' })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['title', 'createdAt', 'modifiedAt'],
    description: 'Field to sort by',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
    example: 'asc',
  })
  @ApiResponse({
    status: 200,
    description: 'List of notes retrieved successfully',
    type: [NoteResponseDto],
  })
  async findAll(
    @Query('orderBy') orderBy?: 'title' | 'createdAt' | 'modifiedAt',
    @Query('order') order: 'asc' | 'desc' = 'asc',
  ): Promise<NoteResponseDto[]> {
    return this.notesService.findAll(orderBy, order);
  }

  /**
   * Get a single note by ID (with full details including content)
   * @param id - Unique identifier of the note
   * @returns Note with all details including content
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a single note by ID (with content)' })
  @ApiParam({ name: 'id', description: 'Note unique identifier' })
  @ApiResponse({
    status: 200,
    description: 'Note retrieved successfully',
    type: NoteDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async findOne(@Param('id') id: string): Promise<NoteDetailResponseDto> {
    return this.notesService.findOne(id);
  }

  /**
   * Create a new note
   * @param createNoteDto - DTO containing title and content
   * @returns Created note with all details
   */
  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({
    status: 201,
    description: 'Note created successfully',
    type: NoteDetailResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createNoteDto: CreateNoteDto): Promise<NoteDetailResponseDto> {
    return this.notesService.create(createNoteDto);
  }

  /**
   * Update an existing note
   * Only title and content can be modified
   * modifiedAt is automatically updated
   * @param id - Unique identifier of the note to update
   * @param updateNoteDto - DTO containing fields to update
   * @returns Updated note with all details
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing note' })
  @ApiParam({ name: 'id', description: 'Note unique identifier' })
  @ApiResponse({
    status: 200,
    description: 'Note updated successfully',
    type: NoteDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Note not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ): Promise<NoteDetailResponseDto> {
    return this.notesService.update(id, updateNoteDto);
  }

  /**
   * Delete a single note by ID
   * @param id - Unique identifier of the note to delete
   * @returns Object containing the count of deleted notes
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a single note by ID' })
  @ApiParam({ name: 'id', description: 'Note unique identifier' })
  @ApiResponse({
    status: 200,
    description: 'Note deleted successfully',
    schema: {
      type: 'object',
      properties: {
        deletedCount: { type: 'number', example: 1 },
      },
    },
  })
  async removeSingle(@Param('id') id: string): Promise<{ deletedCount: number }> {
    return this.notesService.remove(id);
  }

  /**
   * Delete multiple notes by IDs
   * @param body - Body containing array of note IDs
   * @returns Object containing the count of deleted notes
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete multiple notes by IDs' })
  @ApiResponse({
    status: 200,
    description: 'Notes deleted successfully',
    schema: {
      type: 'object',
      properties: {
        deletedCount: { type: 'number', example: 2 },
      },
    },
  })
  async removeMultiple(@Body() body: { ids: string[] }): Promise<{ deletedCount: number }> {
    if (!body?.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return { deletedCount: 0 };
    }

    return this.notesService.remove(body.ids);
  }
}
