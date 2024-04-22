export const paginationFunciton = (page = 1, size = 1) => {
  const limit = size;
  const skip = (page - 1) * limit;
  return { limit, skip };
};
