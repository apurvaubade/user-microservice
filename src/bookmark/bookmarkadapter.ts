import { Injectable } from "@nestjs/common";
import { IBookmarkServicelocator } from "src/adapters/bookmarkservicelocator";
// import { PostgresBookmarkService } from "src/adapters/postgres/bookmark-adapter";
import { PostgresBookmarkService } from "src/adapters/postgres/bookmark-adapter";
@Injectable()
export class BookmarkAdapter {
  constructor(private postgresProvider: PostgresBookmarkService) {}
  
  buildBookmarkAdapter(): IBookmarkServicelocator {
    let adapter: IBookmarkServicelocator;

    switch (process.env.ADAPTERSOURCE) {
      case "postgres":
        adapter = this.postgresProvider;
        break;
      default:
        adapter = this.postgresProvider;
    }
    return adapter;
  }
} 