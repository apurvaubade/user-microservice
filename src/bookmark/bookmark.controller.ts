import {
  Controller,
  Post,
  Body,
  Param,
  SerializeOptions,
  Req,
  Headers,
  Res,
  Patch,
  UseGuards,
  Delete,
  ParseUUIDPipe,
  UseFilters,
  Query,
  Get,
} from "@nestjs/common";

import {
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBasicAuth,
  ApiHeader,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
  ApiQuery,
} from "@nestjs/swagger";

import { BookmarkAdapter } from "./bookmarkadapter";
import { BookmarkCreateDto } from "./dto/bookmark-create.dto";
import { BookmarkUpdateDto } from "./dto/bookmark-update.dto";
import { BookmarkDeleteDto } from "./dto/bookmark-delete.dto";
import { BookmarkSearchDto } from "./dto/bookmark-search.dto";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";
import { Request, Response } from "express";
import { AllExceptionsFilter } from "src/common/filters/exception.filter";
import { APIID } from "src/common/utils/api-id.config";
import { API_RESPONSES } from "@utils/response.messages";
import { LoggerUtil } from "src/common/logger/LoggerUtil";
import { GetUserId } from "src/common/decorators/getUserId.decorator";
import APIResponse from "src/common/responses/response";

@ApiTags("Bookmark")
@Controller('bookmark')
@UseGuards(JwtAuthGuard)
export class BookmarkController {
  constructor(private bookmarkAdapter: BookmarkAdapter) {}
//get all bookmarks
  @UseFilters(new AllExceptionsFilter(APIID.BOOKMARK_GET))
  @Get("/read")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: API_RESPONSES.BOOKMARK_GET_SUCCESSFULLY })
  @ApiBadRequestResponse({ description: API_RESPONSES.BAD_REQUEST })
  @ApiInternalServerErrorResponse({
    description: API_RESPONSES.INTERNAL_SERVER_ERROR,
  })
  @SerializeOptions({ strategy: "excludeAll" })
  @ApiHeader({ name: "Authorization", description: "JWT token required" })
  public async getAllBookmarks(
    @Headers() headers,
    @Query() bookmarkSearchDto: BookmarkSearchDto,
    @Req() request: Request,
    @Res() response: Response
  ) {
    if (!bookmarkSearchDto.userId) {
      APIResponse.error(
        response,
        APIID.BOOKMARK_GET,
        "User ID is required",
        "BadRequestException",
        400
      );
      return;
    }

    const adapter = this.bookmarkAdapter.buildBookmarkAdapter();
    await adapter.getAllBookmarks(bookmarkSearchDto.userId, response);
  }

  //create bookmark
  @UseFilters(new AllExceptionsFilter(APIID.BOOKMARK_CREATE))
  @Post("create")
  @ApiCreatedResponse({ description: API_RESPONSES.BOOKMARK_CREATED_SUCCESSFULLY })
  @ApiOkResponse({ description: "Bookmark already exists" })
  @ApiBadRequestResponse({ description: API_RESPONSES.BAD_REQUEST })
  @ApiInternalServerErrorResponse({
    description: API_RESPONSES.INTERNAL_SERVER_ERROR,
  })
  @SerializeOptions({ strategy: "excludeAll" })
  @ApiHeader({ name: "Authorization", description: "JWT token (optional for testing)" })
  public async createBookmark(
    @Headers() headers,
    @Req() request: Request,
    @Body() bookmarkCreateDto: BookmarkCreateDto,
    @Res() response: Response
  ) {

    // Set createdBy to userId if not provided (for testing without JWT)
    if (!bookmarkCreateDto.createdBy) {
      bookmarkCreateDto.createdBy = bookmarkCreateDto.userId;
    }

    // Validate that userId and doId are different
    if (bookmarkCreateDto.userId === bookmarkCreateDto.doId) {
      APIResponse.error(
        response,
        APIID.BOOKMARK_CREATE,
        "User ID and Content ID cannot be the same",
        "BadRequestException",
        400
      );
      return;
    }

    const adapter = this.bookmarkAdapter.buildBookmarkAdapter();
    await adapter.createBookmark(request, bookmarkCreateDto, response);
  }

  //update bookmark
  @UseFilters(new AllExceptionsFilter(APIID.BOOKMARK_UPDATE))
  @Patch("update/:bookmarkId")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: API_RESPONSES.BOOKMARK_UPDATED_SUCCESSFULLY })
  @ApiNotFoundResponse({ description: API_RESPONSES.BOOKMARK_NOT_FOUND })
  @ApiBadRequestResponse({ description: API_RESPONSES.BAD_REQUEST })
  @ApiInternalServerErrorResponse({
    description: API_RESPONSES.INTERNAL_SERVER_ERROR,
  })
  @SerializeOptions({ strategy: "excludeAll" })
  @ApiHeader({ name: "tenantid" })
  public async updateBookmark(
    @Headers() headers,
    @Param("bookmarkId", ParseUUIDPipe) bookmarkId: string,
    @GetUserId("loginUserId", ParseUUIDPipe) loginUserId: string,
    @Body() bookmarkUpdateDto: BookmarkUpdateDto,
    @Res() response: Response
  ) {
    const tenantId = headers["tenantid"];
    if (!tenantId) {
      LoggerUtil.warn(
        `${API_RESPONSES.BAD_REQUEST}`,
        `Error: Missing tenantId in request headers for bookmark update`
      );
      APIResponse.error(
        response,
        APIID.BOOKMARK_UPDATE,
        "Missing tenantId in request headers",
        "BadRequestException",
        400
      );
      return;
    }

    bookmarkUpdateDto.updatedBy = loginUserId;
    const adapter = this.bookmarkAdapter.buildBookmarkAdapter();
    await adapter.updateBookmark(bookmarkId, bookmarkUpdateDto, response);
  }

  //delete bookmark
  @UseFilters(new AllExceptionsFilter(APIID.BOOKMARK_DELETE))
  @Delete("/delete")
  @ApiOkResponse({ description: API_RESPONSES.BOOKMARK_DELETED_SUCCESSFULLY })
  @ApiBadRequestResponse({ 
    description: "Invalid request parameters",
    schema: {
      type: "object",
      properties: {
        error: { type: "string", example: "User ID and Content ID (doId) are required" }
      }
    }
  })
  @ApiNotFoundResponse({ description: API_RESPONSES.BOOKMARK_NOT_FOUND })
  @ApiInternalServerErrorResponse({
    description: API_RESPONSES.INTERNAL_SERVER_ERROR,
  })
  @SerializeOptions({ strategy: "excludeAll" })
  @ApiHeader({ name: "Authorization", description: "JWT token (optional for testing)" })
  public async deleteBookmark(
    @Headers() headers,
    @Body() bookmarkDeleteDto: BookmarkDeleteDto,
    @Req() request: Request,
    @Res() response: Response
  ) {

    const adapter = this.bookmarkAdapter.buildBookmarkAdapter();
    await adapter.deleteBookmarkByUserAndContent(bookmarkDeleteDto.userId, bookmarkDeleteDto.doId, response);
  }

} 