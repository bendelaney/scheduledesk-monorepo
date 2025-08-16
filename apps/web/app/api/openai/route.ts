import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { inputText, today, additionalRules } = await request.json();
    
    // const mockResponse = [
    //   {
    //     teamMember: "Ben Delaney",
    //     eventType: "Personal Appointment",
    //     startDate: today,
    //     endDate: today,
    //     allDay: false,
    //     startTime: "09:00:00",
    //     endTime: "10:00:00"
    //   }
    // ];

    // return NextResponse.json({ events: mockResponse });
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Real OpenAI API call - uncomment when ready to use
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-2024-07-18',
        messages: [
          {
            role: 'system',
            content: `You are a scheduling assistant.
Given natural language input from a user, extract structured event data for a team availability calendar.
Return a JSON object. The expected structure of this object is exactly as follows:

[
  {
    teamMember: string (FirstName LastName, e.g. "Krystn Parmley"),
    eventType: one of ["Ends Early", "Starts Late", "Personal Appointment", "Not Working", "On Vacation"],
    startDate: string in ISO 8601 format (e.g. "2025-04-02T00:00:00Z"),
    endDate: string in ISO 8601 format (e.g. "2025-04-02T00:00:00Z"),
    allDay: boolean (true if the event lasts all day, false otherwise),
    startTime: string in "HH:mm:ss" format,
    endTime: string in "HH:mm:ss" format,
    recurrence: one of ["Every Week", "Every Other Week", "Every Month"],
    monthlyRecurrence: {
      type: one of ["Exact Date", "Week & Day"],
      monthlyWeek: one of ["First", "Second", "Third", "Fourth", "Last"],
      monthlyDayOfWeek: one of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    }
  }
]

- Today's date is ${today}. Use this date to resolve phrases like "next Tuesday" or "3 days from now" into full ISO dates including year, month, and day.
- Do NOT wrap the output in markdown code blocks (e.g. do not use \`\`\`json or \`\`\`).
- Always return an array of objects, even if there is only one event.
- Only include fields that are explicitly mentioned or clearly implied in the message.
- Do NOT infer or guess ANY field values that are not clearly referenced or indicated in the prompt.

Event type rules:
- If you infer that "Not Working" is the event type, set the allDay field to true. 
- If you infer that "Ends Early" is the event type, AND a specific time is mentioned, then include the "endTime" field, but do not include the "startTime field. 
- If you infer that "Ends Early" is the event type, AND a specific time is NOT mentioned, then do not include any time fields and set the "allDay" field to true.
- If you infer that "Starts Late" is the event type, include the "startTime" field, but do not include the endTime field. 
- If you infer that "Personal Appointment" is the event type, include both the "startTime" and "endTime" fields.
- If you infer that "Personal Appointment" is the event type, AND a time is mentioned but a DURATION is NOT mentioned, assume the event lasts 1 hour and include a startTime and endTime.

Recurrence rules:
- If "Every Week" is mentioned, include it as the "recurrence" field, and DO NOT include the "monthlyRecurrence" field.
- DO NOT EVER include the "recurrence" field unless recurrence is explicitly specified (e.g., "every..." "every other..." or "each..."), otherwise omit the "monthlyRecurrence" field and its child fields entirely.
- DO NOT EVER include the "monthlyRecurrence" field or its child fields ('monthlyWeek' and 'monthlyDayOfWeek') if MONTHLY recurrence is explicitly specified (e.g., "Every Month" or "each month"), otherwise omit the "monthlyRecurrence" field and its child fields entirely.
- DO NOT EVER include the monthlyWeek and monthlyDayOfWeek fields if "Week & Day" recurrence is inferred (by the use of the words "First", "Second", "Third", "Fourth", "Last" ALONG WITH a corresponding day name like "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"). 
- ONLY include the monthlyWeek and monthlyDayOfWeek fields if the message clearly describes a specific week and day (e.g. "first Monday", "third Friday").
- If "Every Other Week" is mentioned, include it as the "recurrence" field, and DO NOT include the "monthlyRecurrence" field.

Date rules:
- If you infer a date at all, you MUST resolve and include the full date in YYYY-MM-DD format (e.g., "2025-04-03") even if the original message does not include it explicitly.
- For startDate and endDate, use format "YYYY-MM-DD" without time components.
- IF the startDate and endDate would be the same date, DO NOT include the endDate field.

Time rules:
- DO NOT include either the startTime or endTime fields unless the message explicitly mentions times.
- Time fields should be separate from date fields. Store times in the format "HH:mm:ss" (24-hour format).

Additional rules:
${additionalRules}`
          },
          {
            role: 'user',
            content: inputText
          }
        ],
        temperature: 0.2
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API request failed: ${response.status}`);
    }

    const result = await response.json();
    const resultText = result.choices[0].message.content;
    
    try {
      const events = JSON.parse(resultText);
      return NextResponse.json({ events });
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', resultText);
      throw new Error('Invalid JSON response from OpenAI');
    }
  } catch (error) {
    console.error('Error in OpenAI API route:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}