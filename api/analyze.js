import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { components, roomSize, componentSpecs } = req.body;

    if (!components || components.length === 0) {
        return res.status(400).json({ error: 'No components provided' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const roomDescriptions = {
        SM: 'small (~100-200 sq ft)',
        MD: 'medium (~200-400 sq ft)',
        LG: 'large (~400+ sq ft)'
    };

    const prompt = `You are an expert audiophile and audio engineer analyzing a HiFi system configuration. Provide a detailed, opinionated sound signature analysis.

## Selected Components
${components.map(c => `- **${c.label}**: ${c.brand} ${c.model}${componentSpecs[`${c.brand} ${c.model}`] ? `\n  Specs: ${JSON.stringify(componentSpecs[`${c.brand} ${c.model}`])}` : ''}`).join('\n')}

## Room Size
${roomDescriptions[roomSize] || 'medium'} room

## Your Analysis Should Include:

1. **System Character** - What sonic signature will this combination produce? (warm, analytical, lush, punchy, etc.)

2. **Synergy Analysis** - How well do these specific components work together? Consider:
   - Impedance matching between components
   - Power requirements vs speaker sensitivity
   - Tonal balance across the chain

3. **Strengths** - What will this system excel at? (genres, listening styles, particular sonic qualities)

4. **Considerations** - Any potential issues, mismatches, or things to be aware of

5. **Room Fit** - How suitable is this system for the specified room size?

Write in an engaging, knowledgeable tone. Be specific about the sonic characteristics you'd expect. Keep the response focused and under 400 words. Use plain text, no markdown formatting.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ analysis: text });
    } catch (error) {
        console.error('Gemini API error:', error);
        res.status(500).json({ error: 'Failed to generate analysis' });
    }
}
