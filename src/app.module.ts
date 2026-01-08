import { Module } from '@nestjs/common';
import { NotesModule } from './notes/notes.module';

/**
 * Root module of the application
 * Imports feature modules
 */
@Module({
  imports: [NotesModule],
})
export class AppModule { }
