class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "q"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering (supports price[gte]=100)
    // In a real Mongo DB, we would stringify and replace gte, gt, lte, lt
    // For in-memory, we handle specific logic in the controller
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      // Logic would be here for DB. For array, we handle in controller
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    // Return pagination data for manual slicing
    return { page, limit, skip };
  }
}

module.exports = APIFeatures;
