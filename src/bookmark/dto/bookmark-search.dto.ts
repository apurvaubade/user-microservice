import { Expose } from "class-transformer";
import {
  IsOptional,
  IsUUID,
  Matches,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class BookmarkSearchDto {
  @ApiPropertyOptional({
    type: String,
    description: "User ID to search bookmarks for",
  })
  @Expose()
  @IsOptional()
  @IsUUID(undefined, { message: "User ID must be a valid UUID" })
  userId?: string;

  @ApiPropertyOptional({
    type: String,
    description: "Document ID to search bookmarks for",
    example: "do_2143394843223982081867"
  })
  @Expose()
  @IsOptional()
  @Matches(/^do_\d+$/, { message: "Content ID must start with 'do_' followed by numbers" })
  doid?: string;

  constructor(partial: Partial<BookmarkSearchDto>) {
    Object.assign(this, partial);
  }
} 