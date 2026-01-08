import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { INote, INoteRepository, NoteSortOptions } from '../interfaces/note.interface';

/**
 * Repository implementation for Note entity using JSON file storage
 * This follows the Repository pattern to allow easy switching of data sources
 */
@Injectable()
export class NoteRepository implements INoteRepository, OnModuleInit {
  private readonly dataDir = path.join(process.cwd(), 'data');
  private readonly notesFile = path.join(this.dataDir, 'notes.json');

  /**
   * Initialize the repository and ensure data directory exists
   */
  async onModuleInit(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      // Create empty array if file doesn't exist
      try {
        await fs.access(this.notesFile);
      } catch {
        await this.writeNotes([]);
      }
    } catch (error) {
      console.error('Error initializing repository:', error);
    }
  }

  /**
   * Read all notes from the JSON file
   * @returns Array of all notes
   */
  private async readNotes(): Promise<INote[]> {
    try {
      const data = await fs.readFile(this.notesFile, 'utf-8');
      const notes = JSON.parse(data);
      // Convert date strings back to Date objects
      return notes.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        modifiedAt: new Date(note.modifiedAt),
      }));
    } catch (error) {
      console.error('Error reading notes:', error);
      return [];
    }
  }

  /**
   * Write notes to the JSON file
   * @param notes - Array of notes to write
   */
  async writeNotes(notes: INote[]): Promise<void> {
    try {
      await fs.writeFile(this.notesFile, JSON.stringify(notes, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing notes:', error);
      throw error;
    }
  }

  /**
   * Find all notes with optional filters and sorting
   * @param filters - Optional filters and sort options
   * @returns Array of notes matching the criteria
   */
  async findAll(filters?: NoteSortOptions): Promise<INote[]> {
    let notes = await this.readNotes();

    if (filters?.orderBy) {
      notes = this.sortNotes(notes, filters.orderBy, filters.order || 'asc');
    }

    return notes;
  }

  /**
   * Sort notes by the specified field
   * @param notes - Array of notes to sort
   * @param orderBy - Field to sort by
   * @param order - Sort order (asc or desc)
   * @returns Sorted array of notes
   */
  private sortNotes(notes: INote[], orderBy: string, order: 'asc' | 'desc'): INote[] {
    const sortedNotes = [...notes];

    sortedNotes.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (orderBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'modifiedAt':
          aValue = a.modifiedAt.getTime();
          bValue = b.modifiedAt.getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sortedNotes;
  }

  /**
   * Find a single note by its ID
   * @param id - Unique identifier of the note
   * @returns Note if found, null otherwise
   */
  async findOne(id: string): Promise<INote | null> {
    const notes = await this.readNotes();
    const note = notes.find((n) => n.id === id);
    return note || null;
  }

  /**
   * Create a new note
   * @param createNoteDto - DTO containing title and content
   * @returns Created note
   */
  async create(createNoteDto: { title: string; content: string }): Promise<INote> {
    const now = new Date();
    const id = this.generateId();

    const newNote: INote = {
      id,
      title: createNoteDto.title,
      content: createNoteDto.content,
      createdAt: now,
      modifiedAt: now,
    };

    const notes = await this.readNotes();
    notes.push(newNote);
    await this.writeNotes(notes);

    return newNote;
  }

  /**
   * Update an existing note
   * @param id - Unique identifier of the note to update
   * @param updateNoteDto - DTO containing fields to update
   * @returns Updated note if found, null otherwise
   */
  async update(
    id: string,
    updateNoteDto: { title?: string; content?: string },
  ): Promise<INote | null> {
    const notes = await this.readNotes();
    const noteIndex = notes.findIndex((n) => n.id === id);

    if (noteIndex === -1) {
      return null;
    }

    const note = notes[noteIndex];

    if (updateNoteDto.title !== undefined) {
      note.title = updateNoteDto.title;
    }

    if (updateNoteDto.content !== undefined) {
      note.content = updateNoteDto.content;
    }

    // Automatically update modifiedAt on any modification
    note.modifiedAt = new Date();

    await this.writeNotes(notes);
    return note;
  }

  /**
   * Delete one or multiple notes by their IDs
   * @param ids - Array of note IDs to delete
   * @returns Object containing the count of deleted notes
   */
  async delete(ids: string[]): Promise<{ deletedCount: number }> {
    const notes = await this.readNotes();
    const initialLength = notes.length;

    const filteredNotes = notes.filter((note) => !ids.includes(note.id));
    const deletedCount = initialLength - filteredNotes.length;

    if (deletedCount > 0) {
      await this.writeNotes(filteredNotes);
    }

    return { deletedCount };
  }

  /**
   * Generate a unique identifier for a new note
   * @returns Unique identifier string
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
