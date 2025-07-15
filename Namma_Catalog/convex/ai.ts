"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

// Generate product description using AI
export const generateDescription = action({
  args: {
    productName: v.string(),
    category: v.optional(v.string()),
    price: v.optional(v.number()),
    language: v.optional(v.string()),
    additionalInfo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const language = args.language === "ta" ? "Tamil" : "English";
    const categoryInfo = args.category ? ` in the ${args.category} category` : "";
    const priceInfo = args.price ? ` priced at ₹${args.price}` : "";
    const additionalContext = args.additionalInfo ? ` Additional context: ${args.additionalInfo}` : "";

    const prompt = `Generate a compelling, professional product description in ${language} for "${args.productName}"${categoryInfo}${priceInfo}.${additionalContext}

Requirements:
- Write in ${language}
- Keep it concise but engaging (2-3 sentences)
- Highlight key features and benefits
- Use persuasive language that would appeal to customers
- Make it suitable for e-commerce listings
- If Tamil is requested, use proper Tamil script

Product: ${args.productName}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [
          {
            role: "system",
            content: `You are an expert e-commerce copywriter who creates compelling product descriptions. You can write in both English and Tamil. Always respond in the requested language.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      return response.choices[0].message.content || "Unable to generate description";
    } catch (error) {
      console.error("AI description generation failed:", error);
      return `High-quality ${args.productName}${categoryInfo}${priceInfo}. Perfect for your needs with excellent value and reliability.`;
    }
  },
});

// Generate category suggestions
export const suggestCategory = action({
  args: {
    productName: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const prompt = `Based on the product name "${args.productName}"${args.description ? ` and description "${args.description}"` : ""}, suggest the most appropriate category from these common e-commerce categories:

Electronics, Clothing & Fashion, Home & Garden, Sports & Outdoors, Books & Media, Health & Beauty, Toys & Games, Automotive, Food & Beverages, Office Supplies, Jewelry & Accessories, Pet Supplies, Baby & Kids, Tools & Hardware, Art & Crafts

Respond with just the category name, nothing else.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [
          {
            role: "system",
            content: "You are a product categorization expert. Always respond with just the category name.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 20,
        temperature: 0.3,
      });

      return response.choices[0].message.content?.trim() || "General";
    } catch (error) {
      console.error("Category suggestion failed:", error);
      return "General";
    }
  },
});

// Generate tags for product
export const generateTags = action({
  args: {
    productName: v.string(),
    description: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const prompt = `Generate 3-5 relevant tags for this product:
Name: ${args.productName}
Description: ${args.description}
Category: ${args.category}

Return only the tags separated by commas, no other text.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [
          {
            role: "system",
            content: "You are a product tagging expert. Generate relevant, searchable tags.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 50,
        temperature: 0.5,
      });

      const tagsString = response.choices[0].message.content?.trim() || "";
      return tagsString.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
    } catch (error) {
      console.error("Tag generation failed:", error);
      return [args.category.toLowerCase(), "quality", "affordable"];
    }
  },
});

// Process voice transcription
export const transcribeAudio = action({
  args: {
    audioUrl: v.string(),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Note: In a real implementation, you would use Whisper API or similar
      // For now, we'll simulate transcription
      return {
        transcription: "Sample transcription - implement Whisper API integration here",
        language: args.language || "en",
        confidence: 0.95,
      };
    } catch (error) {
      console.error("Audio transcription failed:", error);
      throw new Error("Failed to transcribe audio");
    }
  },
});

// Extract text from image (OCR)
export const extractTextFromImage = action({
  args: {
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Note: In a real implementation, you would use Google Vision API or similar
      // For now, we'll simulate OCR
      return {
        extractedText: "Sample extracted text - implement Vision API integration here",
        confidence: 0.90,
        detectedLanguage: "en",
      };
    } catch (error) {
      console.error("OCR failed:", error);
      throw new Error("Failed to extract text from image");
    }
  },
});
