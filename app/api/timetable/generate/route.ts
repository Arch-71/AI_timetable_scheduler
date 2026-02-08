import { NextRequest, NextResponse } from 'next/server';

const TIME_SLOTS = [
  '08:55-09:50',
  '09:50-10:45',
  '10:45-11:15',
  '11:15-12:10',
  '12:10-01:05',
  '01:05-02:00',
  '02:00-02:55',
  '02:55-03:50',
  '03:50-04:45'
];

function buildPrompt(semester: string) {
  const sections = semester === '1' ? ['I-A', 'I-B'] : ['II-A', 'II-B'];

  return `You are to generate a complete weekly timetable in JSON only (no extra text).
Output must be valid JSON following this schema:
{
  "version": { "name": string },
  "timetable": {
    "<SECTION> - <Day>": {
      "<HH:MM-HH:MM>": [ {"id": string, "course": {"name": string}, "faculty": {"name": string}, "room": {"name": string} } ]
    }
  }
}

Constraints:
- Use keys for days: Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday.
- Use the provided sections: ${sections.join(', ')} and create keys like "I-A - Monday".
- Use only time ranges that align to the TIME_SLOTS list or span consecutive class slots (breaks may be skipped).
- Keep the structure consistent; arrays may be empty for slots with no entries.
- Keep faculty names as short initials (e.g., "KPS"), room names short (e.g., "CA1", "Lab 1A").
- Keep output small but realistic (1-3 entries per day per section).

TIME_SLOTS: ${JSON.stringify(TIME_SLOTS)}

Generate timetables for sections: ${sections.join(', ')}.
Return only the JSON object, nothing else.`;
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY?.toString();
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing OpenAI API key (set OPENAI_API_KEY).' }, { status: 500 });
  }

  const url = new URL(request.url);
  const semester = url.searchParams.get('semester') || '1';

  const prompt = buildPrompt(semester);

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that outputs JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1500
      })
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: 'OpenAI request failed', detail: text }, { status: 500 });
    }

    const json = await resp.json();
    const content = json?.choices?.[0]?.message?.content;

    // Try to parse the model response as JSON. The model is instructed to return JSON only.
    try {
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse model output as JSON', raw: content }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected error', detail: String(err) }, { status: 500 });
  }
}
