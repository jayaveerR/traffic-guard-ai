import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// State-wise base accident data - will be dynamically modified based on date
const statesBaseData = [
  { state: "Maharashtra", baseAccidents: 145 },
  { state: "Tamil Nadu", baseAccidents: 132 },
  { state: "Uttar Pradesh", baseAccidents: 128 },
  { state: "Karnataka", baseAccidents: 115 },
  { state: "Rajasthan", baseAccidents: 108 },
  { state: "Gujarat", baseAccidents: 98 },
  { state: "Madhya Pradesh", baseAccidents: 94 },
  { state: "Andhra Pradesh", baseAccidents: 89 },
  { state: "West Bengal", baseAccidents: 85 },
  { state: "Kerala", baseAccidents: 78 },
  { state: "Telangana", baseAccidents: 76 },
  { state: "Punjab", baseAccidents: 72 },
  { state: "Bihar", baseAccidents: 68 },
  { state: "Haryana", baseAccidents: 65 },
  { state: "Odisha", baseAccidents: 58 },
  { state: "Delhi", baseAccidents: 62 },
  { state: "Jharkhand", baseAccidents: 55 },
  { state: "Chhattisgarh", baseAccidents: 52 },
  { state: "Assam", baseAccidents: 48 },
  { state: "Uttarakhand", baseAccidents: 42 },
];

// Generate a seeded random number based on date for consistent daily variation
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

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
    
    // Create a unique seed for each day (changes daily)
    const dateSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    
    // Peak hour detection (8-10 AM and 5-7 PM)
    const hourVariation = (now.getHours() >= 8 && now.getHours() <= 10) || 
                          (now.getHours() >= 17 && now.getHours() <= 19) ? 1.3 : 1.0;
    
    // Generate dynamic accident data that changes each day
    const todayData = statesBaseData.map((s, index) => {
      // Each state gets a unique but consistent random factor for today
      const stateSeed = dateSeed + index * 7;
      const dailyFactor = 0.5 + seededRandom(stateSeed) * 1.0; // 0.5 to 1.5 multiplier
      
      // Add day-of-week variation (weekends higher in some states)
      const weekendBoost = (now.getDay() === 0 || now.getDay() === 6) ? 
        (seededRandom(stateSeed + 1) > 0.5 ? 1.2 : 0.9) : 1.0;
      
      // Calculate today's accidents with all factors
      const accidents = Math.round(
        s.baseAccidents * dailyFactor * weekendBoost * hourVariation * 
        (0.95 + seededRandom(stateSeed + 2) * 0.1) // Small additional randomness
      );
      
      return { state: s.state, accidents };
    });

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
