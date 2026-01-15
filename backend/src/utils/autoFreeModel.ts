// const rewriteRes = await openRouter.post("/chat/completions", {
//   model: "openrouter/auto",
//   max_tokens: 128,
//   extra_body: {
//     max_price: 0, //  free models only
//   },
//   messages: [
//     {
//       role: "system",
//       content: "Rewrite follow-up questions so they are fully self-contained.",
//     },
//     {
//       role: "user",
//       content: rewritePrompt,
//     },
//   ],
// });
