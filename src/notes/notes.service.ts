import { Injectable, NotFoundException } from '@nestjs/common';
import { NoteRepository } from './repositories/note.repository';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { INote, NoteSortOptions } from './interfaces/note.interface';
import { NoteResponseDto, NoteDetailResponseDto } from './dto/note-response.dto';

/**
 * Service for managing notes business logic
 */
@Injectable()
export class NotesService {
  constructor(private readonly noteRepository: NoteRepository) { }

  /**
   * Get all notes with optional filtering and sorting
   * Returns notes without content (for list view)
   * @param orderBy - Field to sort by (title, createdAt, modifiedAt)
   * @param order - Sort order (asc or desc)
   * @returns Array of notes without content
   */
  async findAll(orderBy?: 'title' | 'createdAt' | 'modifiedAt', order: 'asc' | 'desc' = 'asc'): Promise<NoteResponseDto[]> {
    const filters: NoteSortOptions = {};

    if (orderBy) {
      filters.orderBy = orderBy;
      filters.order = order;
    }

    const notes = await this.noteRepository.findAll(filters);
    return notes.map((note) => this.mapToResponseDto(note));
  }

  /**
   * Get a single note by ID with full details including content
   * @param id - Unique identifier of the note
   * @returns Note with all details including content
   * @throws NotFoundException if note is not found
   */
  async findOne(id: string): Promise<NoteDetailResponseDto> {
    const note = await this.noteRepository.findOne(id);

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    return this.mapToDetailResponseDto(note);
  }

  /**
   * Create a new note
   * @param createNoteDto - DTO containing title and content
   * @returns Created note with all details
   */
  async create(createNoteDto: CreateNoteDto): Promise<NoteDetailResponseDto> {
    const note = await this.noteRepository.create(createNoteDto);
    return this.mapToDetailResponseDto(note);
  }

  /**
   * Update an existing note
   * Automatically updates modifiedAt timestamp
   * @param id - Unique identifier of the note to update
   * @param updateNoteDto - DTO containing fields to update
   * @returns Updated note with all details
   * @throws NotFoundException if note is not found
   */
  async update(id: string, updateNoteDto: UpdateNoteDto): Promise<NoteDetailResponseDto> {
    const note = await this.noteRepository.update(id, updateNoteDto);

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    return this.mapToDetailResponseDto(note);
  }

  /**
   * Delete one or multiple notes
   * @param ids - Single ID string or array of IDs
   * @returns Object containing the count of deleted notes
   */
  async remove(ids: string | string[]): Promise<{ deletedCount: number }> {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    return await this.noteRepository.delete(idsArray);
  }

  /**
   * Map INote to NoteResponseDto (without content)
   * @param note - Note interface
   * @returns Note response DTO without content
   */
  private mapToResponseDto(note: INote): NoteResponseDto {
    return {
      id: note.id,
      title: note.title,
      createdAt: note.createdAt,
      modifiedAt: note.modifiedAt,
    };
  }

  /**
   * Map INote to NoteDetailResponseDto (with content)
   * @param note - Note interface
   * @returns Note detail response DTO with content
   */
  private mapToDetailResponseDto(note: INote): NoteDetailResponseDto {
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      modifiedAt: note.modifiedAt,
    };
  }
}
