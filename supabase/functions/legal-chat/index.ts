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
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Calling Lovable AI Gateway for legal chat...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `You are AdhikarAI, an expert legal advisor specializing in Indian MSME (Micro, Small, and Medium Enterprise) compliance and legal matters. You provide clear, actionable, and comprehensive legal guidance.

CORE EXPERTISE:
- Indian MSME laws, compliance requirements, and registration processes
- GST, income tax, and tax compliance for small businesses
- Labor laws, employee rights, and workplace regulations
- Business registration, licensing, and permits
- Contract law, agreements, and legal documentation
- Intellectual property rights and protection
- Environmental and safety compliance
- Financial regulations and funding options

RESPONSE GUIDELINES:
- Provide detailed, well-structured responses with clear headings
- Break down complex legal concepts into simple, actionable steps
- Reference specific Indian laws, acts, and regulations when relevant
- Include practical examples and real-world scenarios
- Highlight deadlines, penalties, and compliance timelines
- Suggest when to consult a licensed attorney for complex matters
- Use bullet points and numbered lists for clarity
- Provide actionable next steps at the end of each response

FORMATTING:
- Use clear headings (##) for major sections
- Use bullet points for lists
- Highlight important information
- Keep paragraphs concise and focused
- Include relevant timelines and deadlines
- Add practical examples when helpful

Always be professional, empathetic, and thorough. Your goal is to empower MSMEs with knowledge while maintaining legal accuracy.` 
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in legal-chat function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
