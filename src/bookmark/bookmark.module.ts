import { Module } from "@nestjs/common";
import { BookmarkController } from "./bookmark.controller";
import { BookmarkAdapter } from "./bookmarkadapter";
import { PostgresModule } from "src/adapters/postgres/postgres-module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Bookmark } from "./entities/bookmark.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Bookmark]),
    PostgresModule,
  ],
  controllers: [BookmarkController],
  providers: [BookmarkAdapter],
})
export class BookmarkModule {} 