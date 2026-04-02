import { NextResponse } from "next/server";

const SYSTEM = `You are Gateway's Co-Design facilitator. A student and community partner have shared their profiles. Generate exactly 3 discussion prompts that help them negotiate and co-design their project together.

Each prompt should surface a SPECIFIC tension or opportunity between what the student wants to learn and what the partner needs — forcing them to think together about how to resolve it creatively.

Output ONLY valid JSON (no markdown, no backticks, no preamble):
{
  "prompts": [
    {
      "title": "Short label for the tension or opportunity",
      "studentSide": "What the student profile suggests about this",
      "partnerSide": "What the partner profile suggests about this",
      "question": "A specific question they should discuss together to resolve this"
    },
    {
      "title": "Short label",
      "studentSide": "...",
      "partnerSide": "...",
      "question": "..."
    },
    {
      "title": "Short label",
      "studentSide": "...",
      "partnerSide": "...",
      "question": "..."
    }
  ]
}`;

export async function POST(request) {
  try {
    const { student, partner } = await request.json();

    const userMsg = `STUDENT PROFILE:
Name: ${student.name}
Grade: ${student.grade}
Interests: ${student.interests}
Skills: ${student.skills}
Growth Goals: ${student.growthGoals}

COMMUNITY PARTNER PROFILE:
Organization: ${partner.orgName}
Mission: ${partner.mission}
Current Needs: ${partner.needs}
Availability: ${partner.availability}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: SYSTEM,
        messages: [{ role: "user", content: userMsg }],
      }),
    });

    const data = await res.json();
    const text = data.content?.map((c) => c.text || "").join("") || "";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
