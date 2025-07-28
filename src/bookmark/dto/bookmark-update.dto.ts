import { Expose } from "class-transformer";
import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  Matches,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class BookmarkUpdateDto {
  @ApiPropertyOptional({
    type: String,
    description: "Document ID for the bookmark",
    example: "do_2143394843223982081867"
  })
  @Expose()
  @IsOptional()
  @Matches(/^do_\d+$/, { message: "Content ID must start with 'do_' followed by numbers" })
  doId?: string;

  @Expose()
  updatedBy: string;

  constructor(partial: Partial<BookmarkUpdateDto>) {
    Object.assign(this, partial);
  }
} 