import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

const GITHUB_MODELS_BASE_URL = "https://models.github.ai/inference";

// const customFetch = async (url: RequestInfo | URL, init?: RequestInit) => {
//   const response = await fetch(url, init);
  
//   console.log("📊 TRẠNG THÁI RATE LIMIT:");
//   console.log("- Lượt gọi tối đa/phút:", response.headers.get("x-ratelimit-limit-requests") || "N/A");
//   console.log("- Lượt gọi CÒN LẠI:", response.headers.get("x-ratelimit-remaining-requests") || "N/A");
//   console.log("- Số Token CÒN LẠI:", response.headers.get("x-ratelimit-remaining-tokens") || "N/A");
//   console.log("-----------------------");
  
//   return response;
// };

export const llm = new ChatOpenAI({
  model: "openai/gpt-4o-mini",
  apiKey: process.env.GITHUB_TOKEN,
  configuration: {
    baseURL: GITHUB_MODELS_BASE_URL,
    // fetch: customFetch,
  },
});

export const embeddings = new OpenAIEmbeddings({
  model: "openai/text-embedding-3-large",
  apiKey: process.env.GITHUB_TOKEN,
  configuration: {
    baseURL: GITHUB_MODELS_BASE_URL,
    // fetch: customFetch,
  },
});
