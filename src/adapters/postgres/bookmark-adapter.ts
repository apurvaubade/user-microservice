import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Request, Response } from "express";
// import { Bookmark } from "src/bookmark/entities/bookmark.entity";
import { Bookmark } from "src/bookmark/entities/bookmark.entity";
import { BookmarkCreateDto } from "src/bookmark/dto/bookmark-create.dto";
import { BookmarkUpdateDto } from "src/bookmark/dto/bookmark-update.dto";
import { BookmarkSearchDto } from "src/bookmark/dto/bookmark-search.dto";
import { IBookmarkServicelocator } from "src/adapters/bookmarkservicelocator";
import { v4 as uuidv4 } from "uuid";
import { API_RESPONSES } from "@utils/response.messages";
import { LoggerUtil } from "src/common/logger/LoggerUtil";
import APIResponse from "src/common/responses/response";
import { APIID } from "src/common/utils/api-id.config";

@Injectable()
export class PostgresBookmarkService implements IBookmarkServicelocator {
  constructor(
    @InjectRepository(Bookmark)
    private bookmarkRepository: Repository<Bookmark>
  ) {}

  async createBookmark(
    request: Request,
    bookmarkDto: BookmarkCreateDto,
    response: Response
  ): Promise<void> {
    try {
      // Check if bookmark already exists
      const existingBookmark = await this.bookmarkRepository.findOne({
        where: { 
          userId: bookmarkDto.userId, 
          doId: bookmarkDto.doId 
        }
      });

      if (existingBookmark) {
        // Bookmark already exists - return 200 OK
        APIResponse.success(
          response,
          APIID.BOOKMARK_CREATE,
          existingBookmark,
          200,
          "Bookmark already exists"
        );
        return;
      }

      // Create new bookmark
      const bookmark = new Bookmark();
      bookmark.id = uuidv4();
      bookmark.userId = bookmarkDto.userId;
      bookmark.doId = bookmarkDto.doId;
      bookmark.createdBy = bookmarkDto.createdBy;

      const savedBookmark = await this.bookmarkRepository.save(bookmark);

      // Return 201 Created for new bookmark
      APIResponse.success(
        response,
        APIID.BOOKMARK_CREATE,
        savedBookmark,
        201,
        "Bookmark created successfully"
      );
    } catch (error) {
      LoggerUtil.error("Error creating bookmark", error);
      APIResponse.error(
        response,
        APIID.BOOKMARK_CREATE,
        "Internal server error occurred",
        "InternalServerError",
        500
      );
    }
  }

  async updateBookmark(
    bookmarkId: string,
    bookmarkDto: BookmarkUpdateDto,
    response: Response
  ): Promise<void> {
    try {
      const bookmark = await this.bookmarkRepository.findOne({
        where: { id: bookmarkId },
      });

      if (!bookmark) {
        APIResponse.error(
          response,
          APIID.BOOKMARK_UPDATE,
          API_RESPONSES.BOOKMARK_NOT_FOUND,
          "NotFoundException",
          404
        );
        return;
      }

      if (bookmarkDto.doId) {
        bookmark.doId = bookmarkDto.doId;
      }
      bookmark.updatedBy = bookmarkDto.updatedBy;

      const updatedBookmark = await this.bookmarkRepository.save(bookmark);

      APIResponse.success(
        response,
        APIID.BOOKMARK_UPDATE,
        updatedBookmark,
        200,
        API_RESPONSES.BOOKMARK_UPDATED_SUCCESSFULLY
      );
    } catch (error) {
      LoggerUtil.error("Error updating bookmark", error);
      APIResponse.error(
        response,
        APIID.BOOKMARK_UPDATE,
        API_RESPONSES.INTERNAL_SERVER_ERROR,
        "InternalServerError",
        500
      );
    }
  }

  async deleteBookmark(bookmarkId: string, response: Response): Promise<void> {
    try {
      const bookmark = await this.bookmarkRepository.findOne({
        where: { id: bookmarkId },
      });

      if (!bookmark) {
        APIResponse.error(
          response,
          APIID.BOOKMARK_DELETE,
          API_RESPONSES.BOOKMARK_NOT_FOUND,
          "NotFoundException",
          404
        );
        return;
      }

      await this.bookmarkRepository.remove(bookmark);

      APIResponse.success(
        response,
        APIID.BOOKMARK_DELETE,
        {},
        200,
        API_RESPONSES.BOOKMARK_DELETED_SUCCESSFULLY
      );
    } catch (error) {
      LoggerUtil.error("Error deleting bookmark", error);
      APIResponse.error(
        response,
        APIID.BOOKMARK_DELETE,
        API_RESPONSES.INTERNAL_SERVER_ERROR,
        "InternalServerError",
        500
      );
    }
  }

  async deleteBookmarkByUserAndContent(
    userId: string,
    doId: string,
    response: Response
  ): Promise<void> {
    try {
      const bookmark = await this.bookmarkRepository.findOne({
        where: { userId: userId, doId: doId },
      });

      if (!bookmark) {
        APIResponse.error(
          response,
          APIID.BOOKMARK_DELETE,
          "Bookmark not found for the specified user and content",
          "NotFoundException",
          404
        );
        return;
      }

      const deletedBookmarkId = bookmark.id;
      await this.bookmarkRepository.remove(bookmark);

      APIResponse.success(
        response,
        APIID.BOOKMARK_DELETE,
        {
          deletedBookmarkId: deletedBookmarkId,
          userId: userId,
          doId: doId
        },
        200,
        "Bookmark removed successfully"
      );
    } catch (error) {
      LoggerUtil.error("Error deleting bookmark by user and content", error);
      APIResponse.error(
        response,
        APIID.BOOKMARK_DELETE,
        "Internal server error occurred",
        "InternalServerError",
        500
      );
    }
  }

  async getBookmarkById(bookmarkId: string, response: Response): Promise<void> {
    try {
      const bookmark = await this.bookmarkRepository.findOne({
        where: { id: bookmarkId },
      });

      if (!bookmark) {
        APIResponse.error(
          response,
          APIID.BOOKMARK_GET,
          API_RESPONSES.BOOKMARK_NOT_FOUND,
          "NotFoundException",
          404
        );
        return;
      }

      APIResponse.success(
        response,
        APIID.BOOKMARK_GET,
        bookmark,
        200,
        API_RESPONSES.BOOKMARK_GET_SUCCESSFULLY
      );
    } catch (error) {
      LoggerUtil.error("Error getting bookmark", error);
      APIResponse.error(
        response,
        APIID.BOOKMARK_GET,
        API_RESPONSES.INTERNAL_SERVER_ERROR,
        "InternalServerError",
        500
      );
    }
  }

  async searchBookmarks(
    request: Request,
    bookmarkSearchDto: BookmarkSearchDto,
    response: Response
  ): Promise<void> {
    try {
      const queryBuilder = this.bookmarkRepository.createQueryBuilder("bookmark");

      if (bookmarkSearchDto.userId) {
        queryBuilder.andWhere("bookmark.userId = :userId", {
          userId: bookmarkSearchDto.userId,
        });
      }

      if (bookmarkSearchDto.doid) {
        queryBuilder.andWhere("bookmark.doid = :doid", {
          doid: bookmarkSearchDto.doid,
        });
      }

      const bookmarks = await queryBuilder.getMany();

      APIResponse.success(
        response,
        APIID.BOOKMARK_SEARCH,
        bookmarks,
        200,
        API_RESPONSES.BOOKMARK_SEARCH_SUCCESSFULLY
      );
    } catch (error) {
      LoggerUtil.error("Error searching bookmarks", error);
      APIResponse.error(
        response,
        APIID.BOOKMARK_SEARCH,
        API_RESPONSES.INTERNAL_SERVER_ERROR,
        "InternalServerError",
        500
      );
    }
  }

  async getAllBookmarks(
    userId: string,
    response: Response
  ): Promise<void> {
    try {
      const bookmarks = await this.bookmarkRepository.find({
        where: { userId: userId },
        order: { createdAt: 'DESC' },
        select: ['id', 'userId', 'doId', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy']
      });

      APIResponse.success(
        response,
        APIID.BOOKMARK_GET,
        {
          bookmarks: bookmarks,
          totalCount: bookmarks.length
        },
        200,
        "User's bookmarked content retrieved successfully"
      );
    } catch (error) {
      LoggerUtil.error("Error getting all bookmarks", error);
      APIResponse.error(
        response,
        APIID.BOOKMARK_GET,
        "Internal server error occurred",
        "InternalServerError",
        500
      );
    }
  }

  async checkBookmark(
    userId: string,
    doId: string,
    response: Response
  ): Promise<void> {
    try {
      const bookmark = await this.bookmarkRepository.findOne({
        where: { userId: userId, doId: doId }
      });

      const isBookmarked = !!bookmark;

      APIResponse.success(
        response,
        APIID.BOOKMARK_GET,
        {
          isBookmarked: isBookmarked
        },
        200,
        "Bookmark status checked successfully"
      );
    } catch (error) {
      LoggerUtil.error("Error checking bookmark", error);
      APIResponse.error(
        response,
        APIID.BOOKMARK_GET,
        "Internal server error occurred",
        "InternalServerError",
        500
      );
    }
  }
} 