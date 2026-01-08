/**
 * Interface representing a Note entity
 */
export interface INote {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  modifiedAt: Date;
}

/**
 * Interface for note repository abstraction
 * This allows easy switching between different data sources
 */
export interface INoteRepository {
  findAll(filters?: NoteFilters, sort?: NoteSortOptions): Promise<INote[]>;
  findOne(id: string): Promise<INote | null>;
  create(createNoteDto: { title: string; content: string }): Promise<INote>;
  update(id: string, updateNoteDto: { title?: string; content?: string }): Promise<INote | null>;
  delete(ids: string[]): Promise<{ deletedCount: number }>;
}

/**
 * Filters for note queries
 */
export interface NoteFilters {
  orderBy?: 'title' | 'createdAt' | 'modifiedAt';
  order?: 'asc' | 'desc';
}

/**
 * Sort options for note queries
 */
export type NoteSortOptions = NoteFilters;
