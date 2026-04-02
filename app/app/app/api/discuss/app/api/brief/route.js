import { NextResponse } from "next/server";

const SYSTEM = `You are Gateway's Project Co-Design facilitator. A student and community partner have shared profiles AND collaboratively answered discussion prompts. Use ALL context — profiles and their negotiated answers — to generate a project brief reflecting their actual decisions.

Output ONLY valid JSON (no markdown, no backticks, no preamble):
{
  "projectTitle": "A compelling specific project name",
  "summary": "2-3 sentence overview of what the student will do and why it matters",
  "whyThisMatch": "1-2 sentences on why this pairing works — what each brings that the other needs",
  "milestones": [
    {"week": "Week 1-2", "task": "specific task", "output": "tangible deliverable"},
    {"week": "Week 3-4", "task": "specific task", "output": "tangible deliverable"},
    {"week": "Week 5-6", "task": "specific task", "output": "tangible deliverable"},
    {"week": "Week 7-8", "task": "specific task", "output": "tangible deliverable"}
  ],
  "mastery": {
    "skill": "The specific transferable skill developed",
    "how": "How project activities build this progressively",
    "evidence": "Artifact or demonstration showing growth"
  },
  "identity": {
    "shift": "How the student's sense of self and purpose may evolve",
    "how": "Which project moments create this shift",
    "evidence": "Reflection or narrative capturing this"
  },
  "creativity": {
    "challenge": "The real novel problem the student solves",
    "how": "Where the student has agency to design their own approach",
    "evidence": "Original work the student produces"
  },
  "partnerValue": "2-3 sentences on concrete value the partner receives"
}`;

export async function POST(request) {
  try {
    const { student, partner, prompts, responses } = await request.json();

    const codesignContext = prompts
      .map((p, i) => `Discussion: ${p.title}\nQuestion: ${p.question}\nJoint answer: ${responses[i]}`)
      .join("\n\n");

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
Availability: ${partner.availability}

CO-DESIGN RESPONSES:
${codesignContext}

Generate a project brief reflecting their negotiated decisions.`;

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
