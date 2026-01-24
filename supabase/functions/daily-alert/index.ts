import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// State-wise accident data for AI analysis
const statesData = [
  { state: "Maharashtra", accidents: 145, riskLevel: "high" },
  { state: "Tamil Nadu", accidents: 132, riskLevel: "high" },
  { state: "Uttar Pradesh", accidents: 128, riskLevel: "high" },
  { state: "Karnataka", accidents: 115, riskLevel: "medium" },
  { state: "Rajasthan", accidents: 108, riskLevel: "medium" },
  { state: "Gujarat", accidents: 98, riskLevel: "medium" },
  { state: "Madhya Pradesh", accidents: 94, riskLevel: "medium" },
  { state: "Andhra Pradesh", accidents: 89, riskLevel: "medium" },
  { state: "West Bengal", accidents: 85, riskLevel: "medium" },
  { state: "Kerala", accidents: 78, riskLevel: "low" },
  { state: "Telangana", accidents: 76, riskLevel: "low" },
  { state: "Punjab", accidents: 72, riskLevel: "low" },
  { state: "Bihar", accidents: 68, riskLevel: "low" },
  { state: "Haryana", accidents: 65, riskLevel: "low" },
  { state: "Odisha", accidents: 58, riskLevel: "low" },
  { state: "Delhi", accidents: 62, riskLevel: "low" },
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get current date info
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Add daily variation to accident data
    const dayVariation = now.getDay() * 0.05 + 0.9; // 0.9 to 1.2 multiplier
    const hourVariation = now.getHours() >= 8 && now.getHours() <= 10 || now.getHours() >= 17 && now.getHours() <= 19 ? 1.3 : 1.0;
    
    const todayData = statesData.map(s => ({
      ...s,
      accidents: Math.round(s.accidents * dayVariation * hourVariation * (0.9 + Math.random() * 0.2))
    }));

    const totalAccidents = todayData.reduce((sum, s) => sum + s.accidents, 0);
    const sortedStates = [...todayData].sort((a, b) => b.accidents - a.accidents);
    const top7States = sortedStates.slice(0, 7);
    const highRiskStates = todayData.filter(s => s.accidents > 100).map(s => s.state);

    const systemPrompt = `You are a traffic safety AI. Generate a SHORT, urgent 1-2 sentence alert for India.
Include: date, total accidents, top danger state. Keep it under 30 words. Be direct.`;

    const userPrompt = `Alert for ${dayOfWeek}, ${dateStr}: ${totalAccidents} total accidents predicted. #1 danger zone: ${top7States[0].state} (${top7States[0].accidents}). Peak hours: ${hourVariation > 1 ? 'Active' : 'Inactive'}.`;

    console.log("Calling AI gateway for daily alert generation...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 80,
      }),
    });

    const top7Fallback = `${top7States[0].state} leads with ${top7States[0].accidents} incidents`;

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded", 
          fallbackAlert: `⚠️ ${dayOfWeek}: ${totalAccidents} accidents predicted. ${top7Fallback}. Stay safe!`,
          top7States: top7States.map((s, i) => ({ rank: i + 1, state: s.state, accidents: s.accidents, isCritical: s.accidents > 100 }))
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Payment required", 
          fallbackAlert: `⚠️ ${dayOfWeek}: ${totalAccidents} accidents predicted. ${top7Fallback}. Stay safe!`,
          top7States: top7States.map((s, i) => ({ rank: i + 1, state: s.state, accidents: s.accidents, isCritical: s.accidents > 100 }))
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const alertMessage = data.choices?.[0]?.message?.content || 
      `⚠️ ${dayOfWeek}: ${totalAccidents} accidents predicted. ${top7Fallback}. Drive safely!`;

    console.log("Successfully generated alert:", alertMessage);

    return new Response(JSON.stringify({ 
      alert: alertMessage,
      date: dateStr,
      day: dayOfWeek,
      totalAccidents,
      top7States: top7States.map((s, i) => ({
        rank: i + 1,
        state: s.state,
        accidents: s.accidents,
        isCritical: s.accidents > 100
      })),
      highRiskStates,
      isPeakHour: hourVariation > 1,
      generatedAt: now.toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Daily alert error:", error);
    
    // Fallback alert
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    return new Response(JSON.stringify({ 
      alert: `⚠️ ${dayOfWeek}, ${dateStr}: Traffic Safety Alert - Stay vigilant on roads. Maharashtra, Tamil Nadu, and Uttar Pradesh show elevated accident risks today.`,
      error: error instanceof Error ? error.message : "Unknown error",
      date: dateStr,
      day: dayOfWeek
    }), {
      status: 200, // Return 200 with fallback instead of error
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
