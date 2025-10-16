class APIFunctionality {
  constructor(query, queryStr) {
    this.query = query; // Mongoose query object, e.g., Product.find()
    this.queryStr = queryStr; // req.query from the request
    this.filterQuery = {}; // Plain filter object for counting
    this.currentPage = 1; // Will store the actual current page after clamping
  }

  // 1️⃣ Search by keyword
  search() {
    if (this.queryStr.keyword) {
      const keywordFilter = {
        name: { $regex: this.queryStr.keyword, $options: "i" }, // case-insensitive search
      };
      this.filterQuery = { ...this.filterQuery, ...keywordFilter };
    }
    return this; // Allows chaining
  }

  // 2️⃣ Filter by remaining fields (e.g., category)
  filter() {
    const queryCopy = { ...this.queryStr };

    // Fields to remove from filter object
    const removeFields = ["keyword", "page", "limit"];
    removeFields.forEach((field) => delete queryCopy[field]);

    // Merge into filterQuery
    this.filterQuery = { ...this.filterQuery, ...queryCopy };

    // Apply filters to query
    this.query = this.query.find(this.filterQuery);

    return this; // Allows chaining
  }

  // 3️⃣ Pagination with page-clamping
  paginate(resultPerPage = 10, totalProducts = null) {
    let page = Number(this.queryStr.page) || 1;
    const limit = Number(resultPerPage) || 10;

    // Calculate total pages if totalProducts is provided
    const totalPages = totalProducts ? Math.ceil(totalProducts / limit) : null;

    // Clamp page to totalPages
    if (totalPages && page > totalPages) page = totalPages;
    if (page < 1) page = 1; // optional: prevent page < 1

    const skip = limit * (page - 1);

    // Apply limit and skip
    this.query = this.query.limit(limit).skip(skip);

    // Save currentPage for meta
    this.currentPage = page;

    return this; // Allows chaining
  }
}

export default APIFunctionality;
