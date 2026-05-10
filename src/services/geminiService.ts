import { GoogleGenAI, Type } from '@google/genai';
import type { Parameter, ParamType } from '../types';

const SCHEMA_GENERATION_PROMPT = `You are an expert JSON Schema designer for AI structured outputs (Gemini & OpenAI).

Given a plain-English description, generate a JSON schema as a list of parameters.

Rules:
- Each parameter must have a clear, concise key (snake_case)
- Write detailed descriptions that help AI models understand the field's purpose
- Choose the most appropriate type: string, number, integer, boolean, object, array
- Mark fields as required if they are essential
- Add enum options (comma-separated) for fields with a fixed set of values
- For arrays, specify the item type
- For objects, include nested children parameters
- Set nullable: true only for optional fields that might be null
- Suggest minimum/maximum for numeric fields where appropriate

Return ONLY valid JSON matching the schema below. No markdown, no explanation.`;

export interface GeneratedParam {
  key: string;
  description: string;
  type: ParamType;
  required: boolean;
  nullable?: boolean;
  enumOptions?: string;
  itemType?: ParamType;
  minimum?: number;
  maximum?: number;
  children?: GeneratedParam[];
}

export interface GenerationResult {
  schemaName: string;
  parameters: GeneratedParam[];
}

function mapToParameters(items: GeneratedParam[], depth = 0): Parameter[] {
  return items.map(item => ({
    id: crypto.randomUUID(),
    key: item.key || '',
    description: item.description || '',
    type: item.type || 'string',
    required: item.required ?? false,
    nullable: item.nullable,
    enumOptions: item.enumOptions,
    itemType: item.itemType,
    minimum: item.minimum,
    maximum: item.maximum,
    children: item.children && item.children.length > 0
      ? mapToParameters(item.children, depth + 1)
      : [],
    showAdvanced: !!(item.enumOptions || item.minimum !== undefined || item.maximum !== undefined),
  }));
}

export async function generateSchemaFromDescription(
  description: string,
  apiKey: string,
  onChunk?: (text: string) => void
): Promise<{ schemaName: string; parameters: Parameter[] }> {
  const ai = new GoogleGenAI({ apiKey });

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      schemaName: { type: Type.STRING },
      parameters: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            key: { type: Type.STRING },
            description: { type: Type.STRING },
            type: { type: Type.STRING },
            required: { type: Type.BOOLEAN },
            nullable: { type: Type.BOOLEAN },
            enumOptions: { type: Type.STRING },
            itemType: { type: Type.STRING },
            minimum: { type: Type.NUMBER },
            maximum: { type: Type.NUMBER },
            children: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING },
                  required: { type: Type.BOOLEAN },
                  nullable: { type: Type.BOOLEAN },
                  enumOptions: { type: Type.STRING },
                  itemType: { type: Type.STRING },
                  minimum: { type: Type.NUMBER },
                  maximum: { type: Type.NUMBER },
                },
              },
            },
          },
          required: ['key', 'description', 'type', 'required'],
        },
      },
    },
    required: ['schemaName', 'parameters'],
  };

  const config = {
    responseMimeType: 'application/json',
    responseSchema,
    systemInstruction: SCHEMA_GENERATION_PROMPT,
  };

  const contents = [
    {
      role: 'user' as const,
      parts: [{ text: description }],
    },
  ];

  let fullText = '';

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    config,
    contents,
  });

  fullText = response.text || '';
  // for await (const chunk of response) {
  //   if (chunk.text) {
  //     fullText += chunk.text;
  //     onChunk?.(fullText);
  //   }
  // }

  console.log('AI Response:', fullText);
  const parsed: GenerationResult = JSON.parse(fullText);
  return {
    schemaName: parsed.schemaName,
    parameters: mapToParameters(parsed.parameters),
  };
}
