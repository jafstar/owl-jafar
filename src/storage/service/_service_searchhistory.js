import { BaseService } from "./_base";

export class SearchHistoryService extends BaseService {
  constructor() {
    super();
    this.tableName = "SearchHistory";
  }

  getData() {
    return this.connection.select({
      from: this.tableName,
      distinct: true,
    });
  }

  addData(data) {
    return this.connection.insert({
      into: this.tableName,
      values: [data],
      return: true, // since id is autoincrement field and we need id,
      // so we are making return true which will return the whole data inserted.
    });
  }

  getDataById(id) {
    return this.connection.select({
      from: this.tableName,
      where: {
        id: id,
      },
    });
  }

  removeData(id) {
    return this.connection.remove({
      from: this.tableName,
      where: {
        id: id,
      },
    });
  }

  updateDataById(id, updateData) {
    return this.connection.update({
      in: this.tableName,
      set: updateData,
      where: {
        id: id,
      },
    });
  }
}
