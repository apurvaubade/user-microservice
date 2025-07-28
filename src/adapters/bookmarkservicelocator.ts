import { Request, Response } from "express";
import { BookmarkCreateDto } from "src/bookmark/dto/bookmark-create.dto";
import { BookmarkUpdateDto } from "src/bookmark/dto/bookmark-update.dto";
import { BookmarkSearchDto } from "src/bookmark/dto/bookmark-search.dto";

export interface IBookmarkServicelocator {
  createBookmark(
    request: Request,
    bookmarkDto: BookmarkCreateDto,
    response: Response
  ): Promise<void>;

  updateBookmark(
    bookmarkId: string,
    bookmarkDto: BookmarkUpdateDto,
    response: Response
  ): Promise<void>;

  deleteBookmark(
    bookmarkId: string,
    response: Response
  ): Promise<void>;

  deleteBookmarkByUserAndContent(
    userId: string,
    doId: string,
    response: Response
  ): Promise<void>;

  getBookmarkById(
    bookmarkId: string,
    response: Response
  ): Promise<void>;

  searchBookmarks(
    request: Request,
    bookmarkSearchDto: BookmarkSearchDto,
    response: Response
  ): Promise<void>;

  getAllBookmarks(
    userId: string,
    response: Response
  ): Promise<void>;

  checkBookmark(
    userId: string,
    doId: string,
    response: Response
  ): Promise<void>;
} 