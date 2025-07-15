import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const generateProductDescription = action({
  args: {
    productName: v.string(),
    category: v.optional(v.string()),
    price: v.optional(v.number()),
    basicInfo: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const prompt = `Generate a compelling product description for an e-commerce catalog.

Product Name: ${args.productName}
Category: ${args.category || "General"}
Price: ${args.price ? `₹${args.price}` : "Not specified"}
Additional Info: ${args.basicInfo || "None"}

Requirements:
- Write in a mix of English and Tamil (Tanglish) that appeals to Indian customers
- Keep it concise but engaging (2-3 sentences)
- Highlight key benefits and features
- Make it suitable for small business/local shop context
- Include relevant keywords for searchability

Generate ONLY the description text, no additional formatting or labels.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      });

      return response.choices[0].message.content?.trim() || "";
    } catch (error) {
      console.error("AI description generation failed:", error);
      return `High-quality ${args.productName} available at competitive prices. Perfect for your needs with excellent value for money.`;
    }
  },
});

export const categorizeProduct = action({
  args: {
    productName: v.string(),
    description: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const categories = [
      "Electronics", "Clothing", "Food & Beverages", "Home & Kitchen",
      "Beauty & Personal Care", "Books & Stationery", "Sports & Fitness",
      "Toys & Games", "Automotive", "Health & Medicine", "Jewelry",
      "Mobile & Accessories", "Groceries", "Footwear", "Bags & Luggage"
    ];

    const prompt = `Categorize this product into one of the following categories: ${categories.join(", ")}

Product Name: ${args.productName}
Description: ${args.description || "No description"}

Return ONLY the category name from the list above that best fits this product. If uncertain, choose the closest match.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 20,
        temperature: 0.3,
      });

      const category = response.choices[0].message.content?.trim() || "";
      return categories.includes(category) ? category : "General";
    } catch (error) {
      console.error("AI categorization failed:", error);
      return "General";
    }
  },
});

export const generateTags = action({
  args: {
    productName: v.string(),
    description: v.string(),
    category: v.string(),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const prompt = `Generate 3-5 relevant tags for this product that would help with search and discovery.

Product: ${args.productName}
Category: ${args.category}
Description: ${args.description}

Requirements:
- Mix of English and Tamil keywords
- Include brand, material, color, size, or other relevant attributes
- Keep tags short (1-2 words each)
- Make them searchable and relevant for Indian customers

Return only the tags separated by commas, no additional text.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 50,
        temperature: 0.5,
      });

      const tagsText = response.choices[0].message.content?.trim() || "";
      return tagsText.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
    } catch (error) {
      console.error("AI tag generation failed:", error);
      return [args.category.toLowerCase(), "quality", "affordable"];
    }
  },
});

export const extractProductInfo = action({
  args: {
    text: v.string(),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const prompt = `Extract product information from this text (could be from OCR, voice transcription, or manual input):

Text: "${args.text}"

Extract and return a JSON object with these fields:
- name: Product name (string)
- price: Price in rupees (number, extract only the numeric value)
- description: Any descriptive text (string)
- category: Likely category (string)

If any field cannot be determined, use null. Return only valid JSON.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.3,
      });

      const result = response.choices[0].message.content?.trim() || "{}";
      return JSON.parse(result);
    } catch (error) {
      console.error("AI extraction failed:", error);
      return {
        name: null,
        price: null,
        description: args.text,
        category: null,
      };
    }
  },
});

export const suggestOptimalPrice = action({
  args: {
    productName: v.string(),
    category: v.string(),
    currentPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Simulate market research with AI-generated suggestions
    const prompt = `Suggest an optimal price range for this product in the Indian market:

Product: ${args.productName}
Category: ${args.category}
Current Price: ${args.currentPrice ? `₹${args.currentPrice}` : "Not set"}

Consider:
- Indian market pricing
- Small business/local shop context
- Competitive pricing
- Profit margins for retailers

Return a JSON object with:
- suggestedPrice: Single recommended price (number)
- priceRange: {min: number, max: number}
- reasoning: Brief explanation (string)

Return only valid JSON.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.5,
      });

      const result = response.choices[0].message.content?.trim() || "{}";
      return JSON.parse(result);
    } catch (error) {
      console.error("AI price suggestion failed:", error);
      return {
        suggestedPrice: args.currentPrice || 100,
        priceRange: { min: 50, max: 500 },
        reasoning: "Based on general market trends",
      };
    }
  },
});
