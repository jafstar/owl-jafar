export class SearchHistory {
  id;
  stock;

  constructor(id, stock) {
    this.id = id == null ? 0 : id;
    this.stock = stock == null ? "" : stock;
  }
}
