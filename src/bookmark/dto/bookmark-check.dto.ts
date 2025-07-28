import { Expose } from "class-transformer";
import {
  IsNotEmpty,
  IsUUID,
  Matches,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class BookmarkCheckDto {
  @ApiProperty({
    type: String,
    description: "User ID to check bookmark status",
    example: "123e4567-e89b-12d3-a456-426614174000"
  })
  @Expose()
  @IsNotEmpty({ message: "User ID is required" })
  @IsUUID(undefined, { message: "User ID must be a valid UUID" })
  userId: string;

  @ApiProperty({
    type: String,
    description: "Content/Document ID to check if bookmarked",
    example: "do_2143394843223982081867"
  })
  @Expose()
  @IsNotEmpty({ message: "Content ID (doId) is required" })
  @Matches(/^do_\d+$/, { message: "Content ID must start with 'do_' followed by numbers" })
  doId: string;

  constructor(partial: Partial<BookmarkCheckDto>) {
    Object.assign(this, partial);
  }
} 