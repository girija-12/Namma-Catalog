import { action } from "./_generated/server";
import { v } from "convex/values";

const openai = {
  baseURL: "https://api.openai.com/v1",
  apiKey: "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"
};

export const suggestCategory = action({
  args: { productName: v.string() },
  handler: async (ctx, { productName }) => {
    const prompt = `You are a helpful assistant that suggests the best product category for the given product name. Provide only one category name that fits best.

Product Name: "${productName}"

Category:`;
console.log("API KEY:", openai.apiKey);
    try {
      const response = await fetch(`${openai.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openai.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-nano",
          messages: [
            {
              role: "system",
              content: "You are an expert product categorization assistant for the Indian market.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 20,
          temperature: 0.3,
        }),
      });

      const rawText = await response.text();
      console.log("OpenAI raw response:", rawText);

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response from OpenAI: ${rawText}`);
      }

      const category = data.choices?.[0]?.message?.content?.trim();

      if (!category) {
        throw new Error("No category returned from OpenAI.");
      }

      return category;
    } catch (error) {
      console.error("Failed to generate category:", error);
      return "General";
    }
  },
});

export const generateDescription = action({
  args: {
    productName: v.string(),
    category: v.optional(v.string()),
    price: v.optional(v.number()),
    language: v.optional(v.string()),
    additionalInfo: v.optional(v.string()),
    quantity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const {
      productName,
      category,
      price,
      language = "en",
      additionalInfo,
      quantity,
    } = args;

    const prompt = {
      en: `You are a creative product marketing expert writing for the Indian market.
Generate a unique, emotionally engaging, and highly detailed product description in 150-200 words.

Product Details:
- Name: ${productName}
${category ? `- Category: ${category}` : ""}
${price ? `- Price: ₹${price}` : ""}
${quantity ? `- Quantity: ${quantity}` : ""}
${additionalInfo ? `- Voice Description: ${additionalInfo}` : ""}

Instructions:
- Use the voice input to understand the user's perspective and emotional tone.
- Highlight key features, benefits, use cases, and value.
- Make the description feel personalized and story-driven.
- Ensure it's compelling and fits well with the product's category.
- Avoid repeating generic lines.
`,

      ta: `நீங்கள் இந்திய சந்தைக்கான ஒரு திறமையான தயாரிப்பு விளக்கம் எழுதும் நிபுணர்.

தயாரிப்புக்கான தனிப்பட்ட, உணர்ச்சிபூர்வமான மற்றும் விரிவான விளக்கத்தை 150-200 வார்த்தைகளில் உருவாக்கவும்.

தயாரிப்பு விவரங்கள்:
- பெயர்: ${productName}
${category ? `- வகை: ${category}` : ""}
${price ? `- விலை: ₹${price}` : ""}
${quantity ? `- அளவு: ${quantity}` : ""}
${additionalInfo ? `- குரல் விளக்கம்: ${additionalInfo}` : ""}

விளக்கத்தில்:
- தயாரிப்பின் முக்கிய அம்சங்கள் மற்றும் பயன்கள்
- பயனுள்ள பயன்பாடுகள்
- வாடிக்கையாளர்களுக்கான மதிப்பு
- உணர்ச்சி மற்றும் அனுபவங்கள்
- புது பார்வையுடன் எழுதவும், பொதுவான வார்த்தைகளை தவிர்க்கவும்.
`,

      hi: `आप भारतीय बाज़ार के लिए लिखने वाले एक रचनात्मक उत्पाद विवरण विशेषज्ञ हैं।

"${productName}" के लिए एक अनोखा, भावनात्मक रूप से जुड़ाव वाला और विस्तृत विवरण 150-200 शब्दों में तैयार करें।

उत्पाद विवरण:
- नाम: ${productName}
${category ? `- श्रेणी: ${category}` : ""}
${price ? `- कीमत: ₹${price}` : ""}
${quantity ? `- मात्रा: ${quantity}` : ""}
${additionalInfo ? `- वॉइस विवरण: ${additionalInfo}` : ""}

निर्देश:
- मुख्य विशेषताएं और उपयोग के तरीके बताएं
- उपभोक्ताओं को जोड़ने वाला टोन रखें
- उत्पाद को श्रेणी से मेल खाते हुए प्रस्तुत करें
- सामान्य या दोहराए गए शब्दों से बचें
`,
    };

    const fallbackPrompt = {
      en: `Write a short but unique and market-friendly product description.

Product: ${productName}
${category ? `Category: ${category}` : ""}

It should:
- Highlight key features or use cases
- Sound engaging and relevant for Indian customers
- Be around 80-120 words
- Avoid generic fluff`,

      ta: `இந்த தயாரிப்பு: "${productName}" பற்றிய சுருக்கமான, ஆனால் தனித்துவமான விளக்கத்தை எழுதுங்கள்.

${category ? `வகை: ${category}` : ""}

- முக்கிய அம்சங்கள் மற்றும் பயன்பாடுகளை குறிப்பிட்டு எழுதவும்
- இந்திய வாடிக்கையாளர்களுக்கு பொருத்தமானதாக இருக்க வேண்டும்
- சுமார் 80-120 வார்த்தைகளாக இருக்கலாம்
- பொதுவான மற்றும் அழுக்கான வரிகளை தவிர்க்கவும்`,

      hi: `"${productName}" उत्पाद के लिए एक छोटा लेकिन अनूठा और प्रभावी विवरण लिखिए।

${category ? `श्रेणी: ${category}` : ""}

इसमें:
- मुख्य विशेषताएं और उपयोग शामिल हों
- भारतीय ग्राहकों के लिए प्रासंगिक और आकर्षक हो
- लगभग 80-120 शब्दों में हो
- सामान्य और घिसे-पिटे शब्दों से बचें`,
    };

    const callOpenAI = async (promptText: string) => {
      const response = await fetch(`${openai.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openai.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-nano",
          messages: [
            {
              role: "system",
              content: `You are an expert Indian-market product description writer.`,
            },
            {
              role: "user",
              content: promptText,
            },
          ],
          max_tokens: 300,
          temperature: 0.85,
        }),
      });

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim();
    };

    try {
      const mainPrompt = prompt[language as keyof typeof prompt] || prompt.en;
      const content = await callOpenAI(mainPrompt);
      if (content) return content;

      throw new Error("Primary generation failed, falling back");
    } catch (error) {
      console.error("Primary generation failed:", error);

      try {
        const fallback = fallbackPrompt[language as keyof typeof fallbackPrompt] || fallbackPrompt.en;
        const fallbackContent = await callOpenAI(fallback);
        return fallbackContent || `A high-quality ${category || 'product'} designed to meet your everyday needs. Reliable, efficient, and perfect for Indian customers.`;
      } catch (fallbackError) {
        console.error("Fallback generation failed:", fallbackError);
        return `A high-quality ${category || 'product'} designed to meet your everyday needs. Reliable, efficient, and perfect for Indian customers.`;
      }
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
    const { productName, description, category, language = "en" } = args;

    const prompts = {
      ta: `"${productName}" தயாரிப்புக்கு தேடல் மற்றும் வகைப்படுத்தலுக்காக 8-10 தமிழ் குறிச்சொற்களை உருவாக்கவும்.

தயாரிப்பு: ${productName}
வகை: ${category}
விளக்கம்: ${description}

குறிச்சொற்கள் இவற்றை உள்ளடக்க வேண்டும்:
- முக்கிய அம்சங்கள்
- பயன்பாட்டு நோக்கம்
- இலக்கு வாடிக்கையாளர்கள்
- தரம் மற்றும் பிராண்ட் குறிப்புகள்

கமாவால் பிரிக்கப்பட்ட பட்டியலாக மட்டும் கொடுங்கள்:`,

      en: `Generate 8-10 relevant English tags for the product "${productName}" for search and categorization.

Product: ${productName}
Category: ${category}
Description: ${description}

Tags should include:
- Key features and attributes
- Use cases and applications
- Target audience
- Quality and brand indicators
- Market-specific terms

Provide only a comma-separated list:`,

      hi: `"${productName}" उत्पाद के लिए खोज और वर्गीकरण के लिए 8-10 हिंदी टैग बनाएं।

उत्पाद: ${productName}
श्रेणी: ${category}
विवरण: ${description}

टैग में ये शामिल होना चाहिए:
- मुख्य विशेषताएं
- उपयोग के मामले
- लक्षित ग्राहक
- गुणवत्ता संकेतक

केवल कॉमा से अलग की गई सूची दें:`
    };

    try {
      const response = await fetch(`${openai.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openai.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-nano",
          messages: [
            {
              role: "user",
              content: prompts[language as keyof typeof prompts] || prompts.en
            }
          ],
          max_tokens: 100,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const tagsString = data.choices[0].message.content.trim();
      return tagsString.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
    } catch (error) {
      console.error("Failed to generate tags:", error);

      // Enhanced fallback tags
      const fallbackTags = {
        ta: ['தரமான', 'நம்பகமான', 'மலிவு', 'சிறந்த', 'பயனுள்ள', 'நீடித்த', 'பிரபலமான', 'பரிந்துரைக்கப்பட்ட'],
        en: ['quality', 'reliable', 'affordable', 'best', 'useful', 'durable', 'popular', 'recommended', 'premium', 'value'],
        hi: ['गुणवत्ता', 'विश्वसनीय', 'किफायती', 'सर्वोत्तम', 'उपयोगी', 'टिकाऊ', 'लोकप्रिय', 'अनुशंसित']
      };

      return fallbackTags[language as keyof typeof fallbackTags] || fallbackTags.en;
    }
  },
});
