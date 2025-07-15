import { action } from "./_generated/server";
import { v } from "convex/values";

const openai = {
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
};

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
    const { productName, category, price, language = "en", additionalInfo, quantity } = args;

    // Enhanced prompts for different languages with detailed, customized descriptions
    const prompts = {
      ta: `நீங்கள் ஒரு தமிழ் தயாரிப்பு விளக்க நிபுணர். "${productName}" என்ற தயாரிப்புக்கு மிகவும் விரிவான, கவர்ச்சிகரமான மற்றும் தனித்துவமான விளக்கம் எழுதுங்கள்.

தயாரிப்பு: ${productName}
${category ? `வகை: ${category}` : ''}
${price ? `விலை: ₹${price}` : ''}
${quantity ? `அளவு: ${quantity}` : ''}
${additionalInfo ? `கூடுதல் தகவல்: ${additionalInfo}` : ''}

விளக்கத்தில் இவை இருக்க வேண்டும்:
1. தயாரிப்பின் தனித்துவமான அம்சங்கள்
2. பயன்பாடுகள் மற்றும் நன்மைகள்
3. தரம் மற்றும் நம்பகத்தன்மை
4. வாடிக்கையாளர்களுக்கு ஏன் இது சிறந்த தேர்வு
5. உணர்ச்சிபூர்வமான இணைப்பு

150-200 வார்த்தைகளில் எழுதுங்கள். மிகவும் விரிவான மற்றும் கவர்ச்சிகரமான விளக்கம் கொடுங்கள்.`,

      en: `You are an expert product description writer specializing in Indian market products. Create a highly detailed, engaging, and unique description for "${productName}".

Product: ${productName}
${category ? `Category: ${category}` : ''}
${price ? `Price: ₹${price}` : ''}
${quantity ? `Quantity: ${quantity}` : ''}
${additionalInfo ? `Additional Info: ${additionalInfo}` : ''}

The description should include:
1. Unique selling points and standout features
2. Practical uses and benefits for Indian consumers
3. Quality assurance and reliability factors
4. Why this is the best choice for customers
5. Emotional connection and lifestyle benefits
6. Value proposition considering the price point

Write 150-200 words. Make it compelling, detailed, and market-specific. Avoid generic descriptions.`,

      hi: `आप एक हिंदी उत्पाद विवरण विशेषज्ञ हैं। "${productName}" के लिए एक अत्यधिक विस्तृत, आकर्षक और अनूठा विवरण लिखें।

उत्पाद: ${productName}
${category ? `श्रेणी: ${category}` : ''}
${price ? `कीमत: ₹${price}` : ''}
${quantity ? `मात्रा: ${quantity}` : ''}
${additionalInfo ? `अतिरिक्त जानकारी: ${additionalInfo}` : ''}

विवरण में ये होना चाहिए:
1. उत्पाद की विशेष विशेषताएं
2. उपयोग और लाभ
3. गुणवत्ता और विश्वसनीयता
4. ग्राहकों के लिए यह क्यों सबसे अच्छा विकल्प है
5. भावनात्मक जुड़ाव

150-200 शब्दों में लिखें। बहुत विस्तृत और आकर्षक विवरण दें।`
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
              role: "system",
              content: "You are an expert product description writer who creates compelling, detailed, and market-specific product descriptions."
            },
            {
              role: "user",
              content: prompts[language as keyof typeof prompts] || prompts.en
            }
          ],
          max_tokens: 300,
          temperature: 0.8,
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error("Failed to generate description:", error);
      
      // Enhanced fallback descriptions
      const fallbacks = {
        ta: `${productName} - இது ஒரு உயர்தர ${category || 'தயாரிப்பு'} ஆகும். சிறந்த தரம், நம்பகமான செயல்பாடு மற்றும் போட்டியான விலையில் கிடைக்கிறது. தினசரி பயன்பாட்டிற்கு ஏற்றது மற்றும் நீண்ட காலம் நீடிக்கும். ${price ? `₹${price} என்ற நியாயமான விலையில்` : ''} உங்கள் தேவைகளை பூர்த்தி செய்யும் சிறந்த தேர்வு.`,
        en: `${productName} - A premium quality ${category || 'product'} designed for the Indian market. Features excellent build quality, reliable performance, and competitive pricing. Perfect for daily use with long-lasting durability. ${price ? `Priced at ₹${price}` : ''} this represents excellent value for money and meets all your requirements.`,
        hi: `${productName} - एक उच्च गुणवत्ता वाला ${category || 'उत्पाद'} जो भारतीय बाजार के लिए डिज़ाइन किया गया है। बेहतरीन निर्माण गुणवत्ता, विश्वसनीय प्रदर्शन और प्रतिस्पर्धी मूल्य निर्धारण। ${price ? `₹${price} की कीमत पर` : ''} यह पैसे की उत्कृष्ट वैल्यू प्रदान करता है।`
      };
      
      return fallbacks[language as keyof typeof fallbacks] || fallbacks.en;
    }
  },
});

export const suggestCategory = action({
  args: {
    productName: v.string(),
    description: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { productName, description, language = "en" } = args;

    // Enhanced category mapping with more specific categories
    const categoryMappings = {
      ta: {
        'உடை மற்றும் ஃபேஷன்': ['சட்டை', 'பேன்ட்', 'ட்ரெஸ்', 'ஜாக்கெட்', 'ஷூ', 'பேக்', 'ஜீன்ஸ்', 'டாப்', 'பாவாடை', 'சேலை', 'குர்தா', 'லெகிங்ஸ்', 'பிளவுஸ்'],
        'எலெக்ட்ரானிக்ஸ் மற்றும் கேஜெட்ஸ்': ['போன்', 'லேப்டாப்', 'டேப்லெட்', 'ஹெட்போன்', 'சார்ஜர்', 'கேபிள்', 'மொபைல்', 'கம்ப்யூட்டர்', 'ஸ்பீக்கர்', 'வாட்ச்', 'கேமரா'],
        'உணவு மற்றும் பானங்கள்': ['அரிசி', 'கோதுமை', 'பருப்பு', 'மாவு', 'எண்ணெய்', 'சீனி', 'உப்பு', 'டீ', 'காபி', 'மசாலா', 'காய்கறி', 'பழம்'],
        'வீட்டு உபயோகப் பொருட்கள்': ['ஃபர்னிச்சர்', 'அலங்காரம்', 'செடி', 'கருவி', 'சுத்தம்', 'நாற்காலி', 'மேசை', 'விளக்கு', 'கர்ட்டன்', 'பாத்திரம்'],
        'ஆரோக்கியம் மற்றும் அழகு': ['மருந்து', 'க்ரீம்', 'ஷாம்பு', 'சோப்', 'வைட்டமின்', 'லோஷன்', 'பர்ஃப்யூம்', 'மேக்கப்', 'ஹேர் ஆயில்'],
        'விளையாட்டு மற்றும் ஃபிட்னெஸ்': ['பந்து', 'பேட்', 'ராக்கெட்', 'ஷூஸ்', 'உபகரணம்', 'ஃபிட்னெஸ்', 'ஜிம்', 'யோகா', 'டம்பெல்'],
        'புத்தகங்கள் மற்றும் ஸ்டேஷனரி': ['புத்தகம்', 'பத்திரிகை', 'நாவல்', 'பாடப்புத்தகம்', 'பேனா', 'பென்சில்', 'நோட்புக்'],
        'பொம்மைகள் மற்றும் விளையாட்டுகள்': ['பொம்மை', 'விளையாட்டு', 'புஸ்ஸல்', 'டால்', 'கார்', 'போர்ட் கேம்', 'வீடியோ கேம்'],
        'வாகன பாகங்கள்': ['கார்', 'பைக்', 'மோட்டார் சைக்கிள்', 'டயர்', 'என்ஜின்', 'பாகங்கள்', 'ஆக்சஸரிஸ்']
      },
      en: {
        'Clothing & Fashion': ['shirt', 'pant', 'dress', 'jacket', 'shoes', 'bag', 'jeans', 'top', 'skirt', 'saree', 'kurta', 'leggings', 'blouse', 'ethnic wear'],
        'Electronics & Gadgets': ['phone', 'laptop', 'tablet', 'headphone', 'charger', 'cable', 'mobile', 'computer', 'speaker', 'watch', 'camera', 'smartphone'],
        'Food & Beverages': ['rice', 'wheat', 'dal', 'flour', 'oil', 'sugar', 'salt', 'tea', 'coffee', 'spice', 'masala', 'vegetable', 'fruit', 'grocery'],
        'Home & Kitchen': ['furniture', 'decoration', 'plant', 'tool', 'cleaning', 'chair', 'table', 'lamp', 'curtain', 'utensil', 'appliance'],
        'Health & Beauty': ['medicine', 'cream', 'shampoo', 'soap', 'vitamin', 'lotion', 'perfume', 'makeup', 'skincare', 'hair oil'],
        'Sports & Fitness': ['ball', 'bat', 'racket', 'shoes', 'equipment', 'fitness', 'gym', 'yoga', 'dumbbell', 'exercise'],
        'Books & Stationery': ['book', 'magazine', 'novel', 'textbook', 'pen', 'pencil', 'notebook', 'diary', 'stationery'],
        'Toys & Games': ['toy', 'game', 'puzzle', 'doll', 'car', 'board game', 'video game', 'educational toy'],
        'Automotive': ['car', 'bike', 'motorcycle', 'tire', 'engine', 'parts', 'accessories', 'vehicle']
      }
    };

    const currentMappings = categoryMappings[language as keyof typeof categoryMappings] || categoryMappings.en;
    const text = `${productName} ${description || ''}`.toLowerCase();

    // Find best matching category
    for (const [category, keywords] of Object.entries(currentMappings)) {
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          return category;
        }
      }
    }

    return language === 'ta' ? 'பொது' : 'General';
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
