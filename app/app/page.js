"use client";
import { useState } from "react";

const SAMPLE_STUDENT = {
  name: "Mai",
  grade: "Grade 11",
  interests: "Documentary filmmaking, education equity, community storytelling, social media for social good",
  skills: "Video editing (Premiere Pro), photography, bilingual Vietnamese/English, graphic design (Canva)",
  growthGoals: "I want to learn how nonprofits actually measure their impact — not just count volunteer hours. I want to develop real impact storytelling skills that can help organizations get funding, and understand what education access looks like for families in District 8 beyond what I read in class.",
};

const SAMPLE_PARTNER = {
  orgName: "Saigon Children's Charity",
  mission: "Providing education access and support to disadvantaged children and families in Ho Chi Minh City through scholarships, school infrastructure, and community programs. Founded in 1992, SCC has supported over 40,000 students.",
  needs: "We need help documenting the impact of our clean water and scholarship programs in District 8 — short video stories for donors, simple data collection from families we serve, and translated materials (Vietnamese to English) for our international supporters and grant applications.",
  availability: "Weekday afternoons, 8 weeks during semester. Students work directly with our programs team.",
};

const P = {
  bg: "#FFFBF5", card: "#FFFFFF", accent: "#2D6A4F", accentLight: "#D8F3DC",
  accentMid: "#52B788", warm: "#E76F51", warmLight: "#FDDEC0", cream: "#F4EAE0",
  text: "#1B1B1B", textMid: "#4A4A4A", textLight: "#7A7A7A",
  mastery: "#264653", masteryBg: "#E8F0F2",
  identity: "#2A6F4B", identityBg: "#E8F5E9",
  creativity: "#9C4A1A", creativityBg: "#FFF3E0",
  border: "#E8E0D8", co: "#5E4FA2", coBg: "#F3F0FF", coLight: "#E8E4F8",
};
const serif = "'Georgia', serif";
const sans = "'Segoe UI', system-ui, sans-serif";

function Input({ value, onChange, placeholder, style }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      style={{
        width: "100%", padding: "12px 16px", borderRadius: "10px",
        border: `1.5px solid ${focused ? P.accent : P.border}`,
        fontSize: "16px", fontFamily: sans, color: P.text, background: "#fff",
        outline: "none", boxSizing: "border-box",
        boxShadow: focused ? `0 0 0 3px ${P.accent}18` : "none",
        transition: "border-color 0.15s", ...style,
      }}
      value={value} onChange={onChange} placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea rows={rows || 4}
      style={{
        width: "100%", padding: "12px 16px", borderRadius: "10px",
        border: `1.5px solid ${focused ? P.accent : P.border}`,
        fontSize: "16px", fontFamily: sans, color: P.text, background: "#fff",
        outline: "none", boxSizing: "border-box", minHeight: "110px",
        resize: "vertical", lineHeight: 1.6,
        boxShadow: focused ? `0 0 0 3px ${P.accent}18` : "none",
        transition: "border-color 0.15s",
      }}
      value={value} onChange={onChange} placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    />
  );
}

function CoTextarea({ value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea rows={3}
      style={{
        width: "100%", padding: "12px 16px", borderRadius: "10px",
        border: `1.5px solid ${focused ? P.co : P.co + "30"}`,
        fontSize: "16px", fontFamily: sans, color: P.text, background: "#fff",
        outline: "none", boxSizing: "border-box", minHeight: "90px",
        resize: "vertical", lineHeight: 1.6,
        boxShadow: focused ? `0 0 0 3px ${P.co}15` : "none",
        transition: "border-color 0.15s",
      }}
      value={value} onChange={onChange} placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    />
  );
}

export default function Home() {
  const [step, setStep] = useState("student");
  const [student, setStudent] = useState({ name: "", grade: "", interests: "", skills: "", growthGoals: "" });
  const [partner, setPartner] = useState({ orgName: "", mission: "", needs: "", availability: "" });
  const [prompts, setPrompts] = useState(null);
  const [responses, setResponses] = useState(["", "", ""]);
  const [brief, setBrief] = useState(null);
  const [error, setError] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState("");

  const spin = (msgs) => {
    let i = 0; setLoadingMsg(msgs[0]);
    return setInterval(() => { i = (i + 1) % msgs.length; setLoadingMsg(msgs[i]); }, 2200);
  };

  const goDiscussion = async () => {
    setStep("loading"); setError(null);
    const iv = spin(["Reading both profiles...", "Finding tensions and opportunities...", "Crafting discussion prompts..."]);
    try {
      const res = await fetch("/api/discuss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student, partner }),
      });
      const data = await res.json();
      clearInterval(iv);
      if (data.error) throw new Error(data.error);
      setPrompts(data.prompts); setResponses(data.prompts.map(() => "")); setStep("codesign");
    } catch (e) { clearInterval(iv); setError("Error: " + e.message); setStep("partner"); }
  };

  const goBrief = async () => {
    setStep("loading"); setError(null);
    const iv = spin(["Reading your co-design decisions...", "Mapping to deeper learning competencies...", "Drafting your project brief..."]);
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student, partner, prompts, responses }),
      });
      const data = await res.json();
      clearInterval(iv);
      if (data.error) throw new Error(data.error);
      setBrief(data); setStep("brief");
    } catch (e) { clearInterval(iv); setError("Error: " + e.message); setStep("codesign"); }
  };

  const Header = () => (
    <div style={{ background: P.accent, color: "#fff", padding: "22px 24px 18px" }}>
      <div style={{ fontFamily: serif, fontSize: "24px", fontWeight: 600 }}>Gateway Co-Design</div>
      <div style={{ fontSize: "13px", opacity: 0.8, marginTop: "3px" }}>Student + Partner → AI-scaffolded project brief</div>
    </div>
  );

  const stepNames = ["Student", "Partner", "Co-Design", "Brief"];
  const stepIdx = { student: 0, partner: 1, codesign: 2, loading: 2, brief: 3 };
  const Nav = () => (
    <div style={{ display: "flex", gap: "6px", margin: "18px 0 22px", flexWrap: "wrap" }}>
      {stepNames.map((n, i) => {
        const cur = stepIdx[step] ?? 0;
        return (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: cur === i ? 700 : 500,
              background: cur === i ? (i === 2 ? P.coLight : P.accentLight) : cur > i ? P.accentLight : "#f5f0ea",
              color: cur === i ? (i === 2 ? P.co : P.accent) : cur > i ? P.accentMid : P.textLight,
            }}>{n}</div>
            {i < 3 && <div style={{ width: "12px", height: "1.5px", background: P.border }} />}
          </div>
        );
      })}
    </div>
  );

  const Card = ({ children, style: s }) => (
    <div style={{ background: P.card, borderRadius: "14px", border: `1px solid ${P.border}`, padding: "24px", boxShadow: "0 1px 8px rgba(0,0,0,0.04)", ...s }}>{children}</div>
  );
  const Lbl = ({ children }) => (
    <div style={{ fontSize: "12px", fontWeight: 700, color: P.textMid, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{children}</div>
  );
  const gap = { marginBottom: "18px" };
  const Btn = ({ children, onClick, disabled, bg, color: c, border: b }) => (
    <button onClick={onClick} disabled={disabled} style={{
      background: bg || P.accent, color: c || "#fff", border: b || "none", borderRadius: "10px",
      padding: "12px 22px", fontSize: "14px", fontWeight: 600, fontFamily: sans,
      cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.4 : 1,
    }}>{children}</button>
  );
  const BtnOut = ({ children, onClick }) => (
    <button onClick={onClick} style={{
      background: "transparent", color: P.accent, border: `1.5px solid ${P.accent}`,
      borderRadius: "10px", padding: "9px 16px", fontSize: "13px", fontWeight: 600, fontFamily: sans, cursor: "pointer",
    }}>{children}</button>
  );
  const wrap = { maxWidth: "720px", margin: "0 auto", padding: "0 20px 32px", fontFamily: sans, color: P.text };
  const Err = () => error ? <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "12px 16px", borderRadius: "8px", fontSize: "14px", marginBottom: "14px" }}>{error}</div> : null;
  const upS = (k) => (e) => setStudent({ ...student, [k]: e.target.value });
  const upP = (k) => (e) => setPartner({ ...partner, [k]: e.target.value });

  if (step === "student") return (
    <div style={{ background: P.bg, minHeight: "100vh" }}>
      <Header /><div style={wrap}><Nav />
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: serif, fontSize: "20px", fontWeight: 600 }}>Student Profile</div>
              <div style={{ fontSize: "13px", color: P.textLight, marginTop: "2px" }}>Share your interests and what you want to grow in through service learning.</div>
            </div>
            <BtnOut onClick={() => setStudent({ ...SAMPLE_STUDENT })}>Fill Sample</BtnOut>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px" }}>
            <div><Lbl>Name</Lbl><Input value={student.name} onChange={upS("name")} placeholder="Your first name" /></div>
            <div><Lbl>Grade</Lbl><Input value={student.grade} onChange={upS("grade")} placeholder="e.g. Grade 11" /></div>
          </div>
          <div style={gap}><Lbl>What causes or topics do you care about?</Lbl><Textarea value={student.interests} onChange={upS("interests")} placeholder="e.g. education equity, environment, animal welfare, public health, arts & culture, technology for good..." /></div>
          <div style={gap}><Lbl>What skills can you contribute?</Lbl><Textarea value={student.skills} onChange={upS("skills")} placeholder="e.g. video editing, coding, bilingual Vietnamese/English, graphic design, data analysis, public speaking..." /></div>
          <div style={gap}><Lbl>What do you want to learn or develop through this experience?</Lbl><Textarea value={student.growthGoals} onChange={upS("growthGoals")} rows={5} placeholder="Think about skills, perspectives, or experiences you can't get in a classroom. What would make this more than just logging hours?" /></div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Btn onClick={() => setStep("partner")} disabled={!student.name || !student.growthGoals}>Next: Partner Profile →</Btn>
          </div>
        </Card>
      </div>
    </div>
  );

  if (step === "partner") return (
    <div style={{ background: P.bg, minHeight: "100vh" }}>
      <Header /><div style={wrap}><Nav />
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: serif, fontSize: "20px", fontWeight: 600 }}>Community Partner Profile</div>
              <div style={{ fontSize: "13px", color: P.textLight, marginTop: "2px" }}>Share your organization's mission and how a student could help.</div>
            </div>
            <BtnOut onClick={() => setPartner({ ...SAMPLE_PARTNER })}>Fill Sample</BtnOut>
          </div>
          <div style={gap}><Lbl>Organization Name</Lbl><Input value={partner.orgName} onChange={upP("orgName")} placeholder="e.g. Saigon Children's Charity, GreenViet, KOTO..." /></div>
          <div style={gap}><Lbl>Mission</Lbl><Textarea value={partner.mission} onChange={upP("mission")} placeholder="What does your organization do and who does it serve?" /></div>
          <div style={gap}><Lbl>How could a student contribute?</Lbl><Textarea value={partner.needs} onChange={upP("needs")} rows={5} placeholder="What specific projects, tasks, or challenges could a student help with? The more concrete, the better the match." /></div>
          <div style={gap}><Lbl>Availability & Duration</Lbl><Input value={partner.availability} onChange={upP("availability")} placeholder="e.g. Weekday afternoons, 8 weeks during semester" /></div>
          <Err />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Btn onClick={() => setStep("student")} bg="transparent" color={P.textMid} border={`1.5px solid ${P.border}`}>← Back</Btn>
            <Btn onClick={goDiscussion} disabled={!partner.orgName || !partner.needs} bg={P.co}>Next: Co-Design Together →</Btn>
          </div>
        </Card>
      </div>
    </div>
  );

  if (step === "loading") return (
    <div style={{ background: P.bg, minHeight: "100vh" }}>
      <Header />
      <div style={{ ...wrap, textAlign: "center", paddingTop: "80px" }}>
        <div style={{ display: "inline-block", width: "40px", height: "40px", border: `3px solid ${P.border}`, borderTopColor: P.co, borderRadius: "50%", animation: "gw 0.8s linear infinite" }} />
        <div style={{ fontFamily: serif, fontSize: "18px", fontWeight: 600, marginTop: "20px", color: P.co }}>{loadingMsg}</div>
        <div style={{ fontSize: "13px", color: P.textLight, marginTop: "6px" }}>The AI is reading both profiles to scaffold your conversation.</div>
        <style>{`@keyframes gw{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (step === "codesign" && prompts) return (
    <div style={{ background: P.bg, minHeight: "100vh" }}>
      <Header /><div style={wrap}><Nav />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
          <div style={{ background: P.accentLight, borderRadius: "10px", padding: "14px 16px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: P.accent, marginBottom: "3px" }}>Student</div>
            <div style={{ fontFamily: serif, fontSize: "15px", fontWeight: 600 }}>{student.name}, {student.grade}</div>
            <div style={{ fontSize: "12px", color: P.textMid, marginTop: "4px", lineHeight: 1.5 }}>{student.growthGoals.length > 120 ? student.growthGoals.slice(0, 120) + "…" : student.growthGoals}</div>
          </div>
          <div style={{ background: P.cream, borderRadius: "10px", padding: "14px 16px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: P.warm, marginBottom: "3px" }}>Partner</div>
            <div style={{ fontFamily: serif, fontSize: "15px", fontWeight: 600 }}>{partner.orgName}</div>
            <div style={{ fontSize: "12px", color: P.textMid, marginTop: "4px", lineHeight: 1.5 }}>{partner.needs.length > 120 ? partner.needs.slice(0, 120) + "…" : partner.needs}</div>
          </div>
        </div>
        <Card style={{ borderLeft: `4px solid ${P.co}`, marginBottom: "18px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: P.co, marginBottom: "3px" }}>◈ Co-Design Session</div>
          <div style={{ fontFamily: serif, fontSize: "19px", fontWeight: 600, marginBottom: "5px" }}>Discuss these together</div>
          <div style={{ fontSize: "14px", color: P.textMid, lineHeight: 1.6 }}>
            The AI found {prompts.length} key tensions between your profiles. Sit together, talk through each one, and write your joint answer. Your decisions shape the project brief.
          </div>
        </Card>
        {prompts.map((p, i) => (
          <Card key={i} style={{ marginBottom: "14px", background: i === 0 ? P.coBg : P.card, border: `1px solid ${i === 0 ? P.co + "20" : P.border}` }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: P.co, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Discussion {i + 1}: {p.title}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
              <div style={{ background: P.accentLight + "90", borderRadius: "8px", padding: "10px 12px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: P.accent, textTransform: "uppercase", marginBottom: "2px" }}>Student's side</div>
                <div style={{ fontSize: "13px", color: P.textMid, lineHeight: 1.5 }}>{p.studentSide}</div>
              </div>
              <div style={{ background: P.warmLight + "90", borderRadius: "8px", padding: "10px 12px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: P.warm, textTransform: "uppercase", marginBottom: "2px" }}>Partner's side</div>
                <div style={{ fontSize: "13px", color: P.textMid, lineHeight: 1.5 }}>{p.partnerSide}</div>
              </div>
            </div>
            <div style={{ fontFamily: serif, fontSize: "15px", fontWeight: 600, color: P.text, marginBottom: "10px", lineHeight: 1.5 }}>{p.question}</div>
            <CoTextarea value={responses[i]} onChange={e => { const r = [...responses]; r[i] = e.target.value; setResponses(r); }} placeholder="Write your joint answer — what did you decide together?" />
          </Card>
        ))}
        <Err />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", paddingBottom: "20px" }}>
          <Btn onClick={() => setStep("partner")} bg="transparent" color={P.textMid} border={`1.5px solid ${P.border}`}>← Back</Btn>
          <Btn onClick={goBrief} disabled={responses.some(r => !r.trim())} bg={P.warm}>✦ Generate Project Brief</Btn>
        </div>
      </div>
    </div>
  );

  if (step === "brief" && brief) {
    const C = ({ title, color, bg, icon, data, f }) => (
      <div style={{ background: bg, borderRadius: "12px", padding: "16px 18px", border: `1.5px solid ${color}15` }}>
        <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color, marginBottom: "2px" }}>{icon} {title}</div>
        <div style={{ fontFamily: serif, fontSize: "15px", fontWeight: 600, color, marginBottom: "8px" }}>{data[f[0]]}</div>
        <div style={{ fontSize: "13px", color: P.textMid, lineHeight: 1.6, marginBottom: "8px" }}>{data[f[1]]}</div>
        <div style={{ fontSize: "12px", color: P.textLight, fontStyle: "italic", borderTop: `1px solid ${color}12`, paddingTop: "8px" }}>
          <strong style={{ fontStyle: "normal", color }}>Evidence:</strong> {data[f[2]]}
        </div>
      </div>
    );
    return (
      <div style={{ background: P.bg, minHeight: "100vh" }}>
        <div style={{ background: P.accent, color: "#fff", padding: "22px 24px 18px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.65, marginBottom: "3px" }}>Co-Designed Project Brief</div>
          <div style={{ fontFamily: serif, fontSize: "22px", fontWeight: 600 }}>{brief.projectTitle}</div>
          <div style={{ fontSize: "13px", opacity: 0.8, marginTop: "3px" }}>{student.name} × {partner.orgName}</div>
        </div>
        <div style={wrap}><Nav />
          <Card style={{ marginBottom: "16px", borderLeft: `4px solid ${P.accentMid}` }}>
            <div style={{ fontFamily: serif, fontSize: "17px", fontWeight: 600, color: P.accent, marginBottom: "5px" }}>Project Overview</div>
            <p style={{ fontSize: "14px", lineHeight: 1.7, color: P.textMid, margin: 0 }}>{brief.summary}</p>
          </Card>
          <div style={{ background: P.warmLight, borderRadius: "12px", padding: "14px 18px", marginBottom: "16px", border: `1px solid ${P.warm}20` }}>
            <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: P.warm, marginBottom: "3px" }}>✦ Why This Pairing Works</div>
            <div style={{ fontSize: "13px", color: P.textMid, lineHeight: 1.6 }}>{brief.whyThisMatch}</div>
          </div>
          <Card style={{ marginBottom: "16px" }}>
            <div style={{ fontFamily: serif, fontSize: "17px", fontWeight: 600, color: P.accent, marginBottom: "10px" }}>Project Milestones</div>
            {brief.milestones?.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", marginBottom: i < brief.milestones.length - 1 ? "12px" : 0, paddingBottom: i < brief.milestones.length - 1 ? "12px" : 0, borderBottom: i < brief.milestones.length - 1 ? `1px solid ${P.border}` : "none" }}>
                <div style={{ minWidth: "64px", fontSize: "11px", fontWeight: 700, color: P.accent }}>{m.week}</div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: P.text }}>{m.task}</div>
                  <div style={{ fontSize: "12px", color: P.textLight, marginTop: "2px" }}>→ {m.output}</div>
                </div>
              </div>
            ))}
          </Card>
          <div style={{ fontFamily: serif, fontSize: "17px", fontWeight: 600, marginBottom: "10px" }}>Deeper Learning Competencies</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
            <C title="Mastery" color={P.mastery} bg={P.masteryBg} icon="◆" data={brief.mastery} f={["skill", "how", "evidence"]} />
            <C title="Identity" color={P.identity} bg={P.identityBg} icon="◈" data={brief.identity} f={["shift", "how", "evidence"]} />
            <C title="Creativity" color={P.creativity} bg={P.creativityBg} icon="✦" data={brief.creativity} f={["challenge", "how", "evidence"]} />
          </div>
          <div style={{ background: P.cream, borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", border: `1px solid ${P.border}` }}>
            <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: P.accent, marginBottom: "3px" }}>Value to {partner.orgName}</div>
            <div style={{ fontSize: "13px", color: P.textMid, lineHeight: 1.6 }}>{brief.partnerValue}</div>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", paddingBottom: "28px" }}>
            <Btn onClick={() => { setBrief(null); setPrompts(null); setStep("student"); }} bg="transparent" color={P.textMid} border={`1.5px solid ${P.border}`}>Start Over</Btn>
            <Btn onClick={goBrief}>✦ Regenerate</Btn>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
