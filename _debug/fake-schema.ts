export const fakeSchemaResponse = {
  data: {
    __schema: {
      types: [
        {
          name: "Query",
          fields: [
            {
              name: "user",
              type: { name: "User" },
              args: [
                {
                  name: "id",
                  type: { name: "ID!" },
                },
              ],
            },
            {
              name: "posts",
              type: { name: "[Post]" },
              args: [],
            },
          ],
        },
        {
          name: "User",
          fields: [
            {
              name: "id",
              type: { name: "ID!" },
            },
            {
              name: "name",
              type: { name: "String!" },
            },
            {
              name: "email",
              type: { name: "String" },
            },
          ],
        },
        {
          name: "Post",
          fields: [
            {
              name: "id",
              type: { name: "ID!" },
            },
            {
              name: "title",
              type: { name: "String!" },
            },
            {
              name: "content",
              type: { name: "String" },
            },
            {
              name: "author",
              type: { name: "User!" },
            },
          ],
        },
      ],
    },
  },
};
