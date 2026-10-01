import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { templateType, templateName, fields, language = 'english' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create a detailed prompt based on the template and fields
    const fieldsList = Object.entries(fields)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const languageMap: Record<string, string> = {
      'english': 'English',
      'hindi': 'Hindi',
      'tamil': 'Tamil',
      'telugu': 'Telugu',
      'marathi': 'Marathi',
      'gujarati': 'Gujarati',
      'kannada': 'Kannada',
      'bengali': 'Bengali',
      'malayalam': 'Malayalam',
      'punjabi': 'Punjabi'
    };

    const targetLanguage = languageMap[language] || 'English';

    const systemPrompt = `You are an expert Indian legal document drafter specializing in MSME documentation. 
You create comprehensive, legally sound documents that comply with Indian laws and regulations.
Your documents are professional, clear, and include all necessary legal clauses and provisions.
You are fluent in multiple Indian languages and can draft documents in ${targetLanguage}.`;

    const userPrompt = `Generate a complete ${templateName} document in ${targetLanguage} language with the following information:

${fieldsList}

Requirements:
1. Write the ENTIRE document in ${targetLanguage} language
2. Use proper legal language and format appropriate for Indian MSMEs
3. Include all standard clauses and provisions for this document type
4. Ensure compliance with Indian Contract Act, 1872 and other relevant laws
5. Add appropriate legal disclaimers and governing law clauses
6. Structure the document with proper sections, numbered clauses, and clear headings
7. Include signature blocks and witness sections where applicable
8. Make it comprehensive and professionally formatted
9. Use proper legal terminology but keep language clear and understandable
10. All headings, body text, clauses, and legal terms must be in ${targetLanguage}

Generate the complete document text in ${targetLanguage} now.`;

    console.log('Generating document with Lovable AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Document generated successfully');

    return new Response(
      JSON.stringify({ content: generatedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-document function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});