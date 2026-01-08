import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { NoteRepository } from './repositories/note.repository';

/**
 * Module for managing notes
 * Provides CRUD operations for notes using JSON file storage
 */
@Module({
  controllers: [NotesController],
  providers: [NotesService, NoteRepository],
  exports: [NotesService, NoteRepository],
})
export class NotesModule { }
