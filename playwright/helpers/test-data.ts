export type TestProduct = {
  name: string;
  slug: string;
  searchQuery: string;
};

export const testData = {
  testProduct: {
    name: "Grey Hoodie",
    slug: "grey-hoodie",
    searchQuery: "Hoodie",
  } satisfies TestProduct,
  multiVariantTestProduct: {
    name: "White Plimsolls",
    slug: "white-plimsolls",
    searchQuery: "Plimsolls",
  } satisfies TestProduct,
};
