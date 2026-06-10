import { useState, useEffect } from "react";

const C = {
  bg: "#071c15", surface: "#0e2a20", surface2: "#123629", border: "rgba(226,184,91,.22)",
  accent: "#e2b85b", accent2: "#f5efe7", green: "#22c87a", orange: "#f59e42",
  red: "#f25f5f", text: "#f5efe7", muted: "#b8aa88", white: "#ffffff",
};

// Change these usernames/passwords before hosting publicly.
// For GitHub Pages this is still frontend-only, so do not use highly sensitive passwords here.
const USERS = [
{
id: "Ragul",
name: "VGM Admin",
password: "Ragul@2002",
role: "admin"
},
{
id: "Esha",
name: "VGM Admin 2",
password: "Esha123",
role: "admin"
},
{
id: "Roja",
name: "Sales Handler 1",
password: "Roja123",
role: "handler"
},
{
id: "Dhanush",
name: "Sales Handler 2",
password: "Dhanush123",
role: "handler"
}
];


const SOURCES   = ["Meta Ads","Google Ads","Website","Referral","Walk-in","WhatsApp","Direct Call","Other"];
const STATUSES  = ["new","contacted","followup","closed_won","DROP"];
const STATUS_LABELS = { new:"New", contacted:"Contacted", followup:"Follow-up Pending", closed_won:"Won", Drop:"Drop" };
const STATUS_COLORS = {
  new:        { bg:"rgba(79,142,247,.15)", color:C.accent },
  contacted:  { bg:"rgba(124,92,252,.15)", color:C.accent2 },
  followup:   { bg:"rgba(245,158,66,.15)", color:C.orange },
  closed_won: { bg:"rgba(34,200,122,.15)", color:C.green },
  Drop:       { bg:"rgba(242,95,95,.15)",  color:C.red },
};

function uid() { return "l_" + Math.random().toString(36).substr(2,9); }
function today() { return new Date().toISOString().split("T")[0]; }

const DEMO_LEADS = [
  { id:uid(), name:"Suresh Kumar",    phone:"+91 98765 43210", email:"", source:"Meta Ads", status:"new",        property:"Acharapakkam Plot", budget:"₹2L Entry",  assignedTo:"",         followupDate:"",      notes:"Asked about DTCP & RERA approved plots.",            createdAt:new Date().toISOString() },
  { id:uid(), name:"Meena R",         phone:"+91 91234 56789", email:"", source:"WhatsApp", status:"followup",   property:"1200 sq.ft Plot",   budget:"₹9.99L",     assignedTo:"handler1", followupDate:today(), notes:"Interested in 30 months no-cost payment plan.", createdAt:new Date().toISOString() },
  { id:uid(), name:"Rahul S",         phone:"+91 99887 65432", email:"rahul@mail.com", source:"Referral", status:"contacted", property:"Thozhupedu Plot", budget:"₹10L", assignedTo:"handler2", followupDate:"", notes:"Need site visit near Alam International School.", createdAt:new Date().toISOString() },
  { id:uid(), name:"Kavitha P",       phone:"+91 88001 22334", email:"", source:"Walk-in", status:"new",        property:"Corner Plot",       budget:"₹12L",       assignedTo:"handler3", followupDate:"",      notes:"Family decision pending.", createdAt:new Date().toISOString() },
  { id:uid(), name:"Deepak V",        phone:"+91 90031 11223", email:"", source:"Direct Call", status:"closed_won", property:"Plot", budget:"₹2L Paid", assignedTo:"handler4", followupDate:"", notes:"Booking collected and plot blocked.", createdAt:new Date().toISOString() },
];

// ── Shared UI pieces ──────────────────────────────────────────────
function StatusPill({ status }) {
  const sc = STATUS_COLORS[status] || { bg:"#333", color:"#aaa" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px",
      borderRadius:20, fontSize:11, fontWeight:700, background:sc.bg, color:sc.color, whiteSpace:"nowrap" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:sc.color, display:"inline-block" }} />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function SourceTag({ source }) {
  return <span style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:5,
    padding:"2px 8px", fontSize:11, color:C.muted }}>{source}</span>;
}

function Btn({ children, onClick, variant="accent", style={} }) {
  const base = { border:"none", borderRadius:8, padding:"8px 16px", fontSize:13,
    fontWeight:600, cursor:"pointer", transition:"opacity .2s", ...style };
  const vars = {
    accent:  { background:C.accent,  color:"#fff" },
    outline: { background:"transparent", color:C.text, border:`1px solid ${C.border}` },
    danger:  { background:"transparent", color:C.red,  border:`1px solid ${C.red}` },
    small:   { background:C.surface2, color:C.text, border:`1px solid ${C.border}`, padding:"4px 10px", fontSize:12, borderRadius:6 },
  };
  return <button style={{ ...base, ...vars[variant] }} onClick={onClick}>{children}</button>;
}

function Input({ label, value, onChange, type="text", placeholder="", required=false }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:".06em", fontWeight:600, marginBottom:5 }}>{label}{required && " *"}</div>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8,
          padding:"9px 13px", color:C.text, fontSize:14, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:".06em", fontWeight:600, marginBottom:5 }}>{label}</div>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8,
          padding:"9px 13px", color:C.text, fontSize:14, outline:"none", cursor:"pointer", boxSizing:"border-box" }}>
        {options.map(o => typeof o === "string"
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Modal({ title, sub, onClose, children, footer }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.surface, border:`1px solid ${C.border}`,
        borderRadius:16, padding:28, width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto",
        boxShadow:"0 32px 80px rgba(0,0,0,.6)" }}>
        <div style={{ fontSize:22, fontWeight:700, color:C.white, marginBottom:4 }}>{title}</div>
        {sub && <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>{sub}</div>}
        {children}
        {footer && <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:20 }}>{footer}</div>}
      </div>
    </div>
  );
}

// ── Lead Form ─────────────────────────────────────────────────────
const BLANK = { name:"", phone:"", email:"", source:"Facebook Ads", status:"new",
  property:"", budget:"", assignedTo:"", followupDate:"", notes:"" };

function LeadForm({ initial={}, isAdmin, onSave, onCancel, title, sub }) {
  const [f, setF] = useState({ ...BLANK, ...initial });
  const set = k => v => setF(p => ({ ...p, [k]: v }));

  function handleSave() {
    if (!f.name.trim() || !f.phone.trim()) { alert("Name and phone are required."); return; }
    onSave(f);
  }

  return (
    <Modal title={title} sub={sub} onClose={onCancel}
      footer={<><Btn variant="outline" onClick={onCancel}>Cancel</Btn><Btn onClick={handleSave}>Save Lead</Btn></>}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <Input label="Full Name" value={f.name} onChange={set("name")} placeholder="Customer Name" required />
        <Input label="Phone" value={f.phone} onChange={set("phone")} placeholder="+91 9999 999999" required />
      </div>
      <Input label="Email" value={f.email} onChange={set("email")} placeholder="john@email.com" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <Select label="Lead Source" value={f.source} onChange={set("source")} options={SOURCES} />
        <Select label="Status" value={f.status} onChange={set("status")}
          options={STATUSES.map(s=>({ value:s, label:STATUS_LABELS[s] }))} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <Input label="Property Interest" value={f.property} onChange={set("property")} placeholder="Plot size / Location" />
        <Input label="Budget" value={f.budget} onChange={set("budget")} placeholder="₹2L Entry / ₹9.99L / Budget" />
      </div>
      {isAdmin && (
        <Select label="Assign To" value={f.assignedTo} onChange={set("assignedTo")}
          options={[{ value:"", label:"— Unassigned —" }, ...USERS.filter(u=>u.role==="handler").map(u=>({ value:u.id, label:u.name }))]} />
      )}
      <Input label="Follow-up Date" value={f.followupDate} onChange={set("followupDate")} type="date" />
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:".06em", fontWeight:600, marginBottom:5 }}>Notes</div>
        <textarea value={f.notes} onChange={e=>set("notes")(e.target.value)} placeholder="Call history, preferences, remarks…"
          style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8,
            padding:"9px 13px", color:C.text, fontSize:13, outline:"none", fontFamily:"inherit",
            resize:"vertical", minHeight:80, boxSizing:"border-box" }} />
      </div>
    </Modal>
  );
}

// ── View Modal ────────────────────────────────────────────────────
function ViewModal({ lead, onClose, onEdit }) {
  const handler = USERS.find(u => u.id === lead.assignedTo);
  const fields = [
    ["Phone", lead.phone], ["Email", lead.email||"—"],
    ["Property", lead.property||"—"], ["Budget", lead.budget||"—"],
    ["Assigned To", handler?.name||"Unassigned"], ["Follow-up", lead.followupDate||"Not set"],
  ];
  return (
    <Modal title={lead.name} onClose={onClose}
      sub={<span style={{ display:"flex", alignItems:"center", gap:8 }}><StatusPill status={lead.status} /><SourceTag source={lead.source} /></span>}
      footer={<><Btn variant="outline" onClick={onClose}>Close</Btn><Btn onClick={onEdit}>Edit Lead</Btn></>}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
        {fields.map(([k,v]) => (
          <div key={k}>
            <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:".06em", marginBottom:3 }}>{k}</div>
            <div style={{ fontSize:14, color:C.text }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:14 }}>
        <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>Notes / Call History</div>
        <div style={{ fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap", color: lead.notes ? C.text : C.muted }}>
          {lead.notes || "No notes yet."}
        </div>
      </div>
      <div style={{ marginTop:10, fontSize:11, color:C.muted }}>Added {new Date(lead.createdAt).toLocaleString()}</div>
    </Modal>
  );
}

// ── Pages ─────────────────────────────────────────────────────────
function Dashboard({ leads, user, onAdd, onView }) {
  const mine = user.role === "handler" ? leads.filter(l=>l.assignedTo===user.id) : leads;
  const stats = [
    { label:"Total Leads", val:mine.length, color:C.white, sub:"All time" },
    { label:"New", val:mine.filter(l=>l.status==="new").length, color:C.accent, sub:"Awaiting contact" },
    { label:"Follow-up Pending", val:mine.filter(l=>l.status==="followup").length, color:C.orange, sub:"Need follow-up" },
    { label:"Closed Won", val:mine.filter(l=>l.status==="closed_won").length, color:C.green, sub:"Deals closed" },
  ];
  const recent = [...mine].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, color:C.white }}>Dashboard</div>
          <div style={{ fontSize:13, color:C.muted }}>Welcome back, {user.name}</div>
        </div>
        {user.role==="admin" && <Btn onClick={onAdd}>+ Add Lead</Btn>}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12, marginBottom:24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:16 }}>
            <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:26, fontWeight:700, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:12, color:C.muted }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:16, fontWeight:600, color:C.white, marginBottom:12 }}>Recent Leads</div>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
        {recent.length === 0
          ? <div style={{ textAlign:"center", padding:32, color:C.muted }}>No leads yet.</div>
          : recent.map(l => (
            <div key={l.id} onClick={()=>onView(l)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"12px 16px", borderBottom:`1px solid ${C.border}`, cursor:"pointer", gap:8 }}>
              <div>
                <div style={{ fontWeight:600, color:C.white, fontSize:14 }}>{l.name}</div>
                <div style={{ fontSize:12, color:C.muted }}>{l.phone}</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                <StatusPill status={l.status} />
                <SourceTag source={l.source} />
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

function AllLeads({ leads, user, onAdd, onEdit, onView, onDelete, onAssign, onStatusChange }) {
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fSource, setFSource] = useState("");
  const [fHandler, setFHandler] = useState("");

  let filtered = leads;
  if (search) filtered = filtered.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.phone.includes(search) || (l.email||"").toLowerCase().includes(search.toLowerCase()));
  if (fStatus)  filtered = filtered.filter(l => l.status === fStatus);
  if (fSource)  filtered = filtered.filter(l => l.source === fSource);
  if (fHandler) filtered = filtered.filter(l => l.assignedTo === fHandler);

  const isAdmin = user.role === "admin";
  const visibleLeads = isAdmin ? filtered : filtered.filter(l => l.assignedTo === user.id);

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, color:C.white }}>{isAdmin ? "All Leads" : "My Leads"}</div>
          <div style={{ fontSize:13, color:C.muted }}>{visibleLeads.length} leads</div>
        </div>
        {isAdmin && <Btn onClick={onAdd}>+ Add Lead</Btn>}
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, phone…"
          style={{ flex:"1 1 160px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8,
            padding:"8px 12px", color:C.text, fontSize:13, outline:"none" }} />
        <select value={fStatus} onChange={e=>setFStatus(e.target.value)}
          style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8,
            padding:"8px 10px", color:C.text, fontSize:13, outline:"none" }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s=><option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        {isAdmin && <>
          <select value={fSource} onChange={e=>setFSource(e.target.value)}
            style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8,
              padding:"8px 10px", color:C.text, fontSize:13, outline:"none" }}>
            <option value="">All Sources</option>
            {SOURCES.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <select value={fHandler} onChange={e=>setFHandler(e.target.value)}
            style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8,
              padding:"8px 10px", color:C.text, fontSize:13, outline:"none" }}>
            <option value="">All Handlers</option>
            {USERS.filter(u=>u.role==="handler").map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </>}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {visibleLeads.length === 0
          ? <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12,
              textAlign:"center", padding:40, color:C.muted }}>No leads match your filters.</div>
          : visibleLeads.map(l => {
            const handler = USERS.find(u=>u.id===l.assignedTo);
            return (
              <div key={l.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10, gap:8 }}>
                  <div>
                    <div style={{ fontWeight:700, color:C.white, fontSize:15 }}>{l.name}</div>
                    <div style={{ fontSize:13, color:C.muted }}>{l.phone} {l.email ? `· ${l.email}` : ""}</div>
                  </div>
                  <StatusPill status={l.status} />
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:10, fontSize:12, color:C.muted }}>
                  <SourceTag source={l.source} />
                  {l.property && <span>🏠 {l.property}</span>}
                  {l.budget && <span>💰 {l.budget}</span>}
                  {l.followupDate && <span style={{ color:C.orange }}>📅 {l.followupDate}</span>}
                  {handler && <span>👤 {handler.name}</span>}
                </div>
                {isAdmin && (
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>Assign to</div>
                    <select value={l.assignedTo} onChange={e=>onAssign(l.id, e.target.value)}
                      style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:6,
                        padding:"5px 10px", color:C.text, fontSize:12, outline:"none" }}>
                      <option value="">— Unassigned —</option>
                      {USERS.filter(u=>u.role==="handler").map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                )}
                {!isAdmin && (
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>Update Status</div>
                    <select value={l.status} onChange={e=>onStatusChange(l.id, e.target.value)}
                      style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:6,
                        padding:"5px 10px", color:C.text, fontSize:12, outline:"none" }}>
                      {STATUSES.map(s=><option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </div>
                )}
                <div style={{ display:"flex", gap:8 }}>
                  <Btn variant="small" onClick={()=>onView(l)}>View</Btn>
                  <Btn variant="small" onClick={()=>onEdit(l)}>Edit</Btn>
                  {isAdmin && <Btn variant="small" style={{ color:C.red, borderColor:C.red }} onClick={()=>onDelete(l.id)}>Delete</Btn>}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

function Followups({ leads, user, onView, onMarkContacted }) {
  const fu = user.role === "admin"
    ? leads.filter(l=>l.status==="followup")
    : leads.filter(l=>l.status==="followup" && l.assignedTo===user.id);
  return (
    <div>
      <div style={{ fontSize:22, fontWeight:700, color:C.white, marginBottom:4 }}>Follow-ups Pending</div>
      <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>{fu.length} lead(s) awaiting follow-up</div>
      {fu.length === 0
        ? <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12,
            textAlign:"center", padding:48, color:C.muted, fontSize:16 }}>🎉 All caught up! No follow-ups pending.</div>
        : fu.map(l => {
          const handler = USERS.find(u=>u.id===l.assignedTo);
          return (
            <div key={l.id} style={{ background:C.surface, border:`1px solid rgba(245,158,66,.3)`,
              borderRadius:12, padding:16, marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, gap:8 }}>
                <div>
                  <div style={{ fontWeight:700, color:C.white, fontSize:15 }}>{l.name}</div>
                  <div style={{ fontSize:12, color:C.muted }}>{l.phone}</div>
                </div>
                {l.followupDate && <span style={{ color:C.orange, fontSize:13 }}>📅 {l.followupDate}</span>}
              </div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:10 }}>
                {l.property && <span>🏠 {l.property} · </span>}
                {l.budget && <span>💰 {l.budget}</span>}
                {user.role==="admin" && handler && <span> · 👤 {handler.name}</span>}
              </div>
              {l.notes && <div style={{ fontSize:13, color:C.muted, background:C.bg, borderRadius:8,
                padding:"10px 12px", marginBottom:10, lineHeight:1.6 }}>{l.notes}</div>}
              <div style={{ display:"flex", gap:8 }}>
                <Btn variant="small" onClick={()=>onView(l)}>View</Btn>
                <Btn variant="small" style={{ color:C.green, borderColor:C.green }} onClick={()=>onMarkContacted(l.id)}>✓ Mark Contacted</Btn>
              </div>
            </div>
          );
        })}
    </div>
  );
}

function Handlers({ leads }) {
  return (
    <div>
      <div style={{ fontSize:22, fontWeight:700, color:C.white, marginBottom:4 }}>Handlers</div>
      <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Your lead handling team</div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {USERS.filter(u=>u.role==="handler").map(u => {
          const myLeads = leads.filter(l=>l.assignedTo===u.id);
          return (
            <div key={u.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:18 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                <div style={{ width:44, height:44, borderRadius:"50%",
                  background:`linear-gradient(135deg,${C.accent},${C.accent2})`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontWeight:700, color:"#fff", fontSize:18 }}>{u.name[0]}</div>
                <div>
                  <div style={{ fontWeight:700, color:C.white, fontSize:16 }}>{u.name}</div>
                  <div style={{ fontSize:12, color:C.muted }}>@{u.id}</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:20, marginBottom:12 }}>
                {[
                  ["Assigned", myLeads.length, C.white],
                  ["Follow-ups", myLeads.filter(l=>l.status==="followup").length, C.orange],
                  ["Won", myLeads.filter(l=>l.status==="closed_won").length, C.green],
                ].map(([label, val, color]) => (
                  <div key={label}>
                    <div style={{ fontSize:22, fontWeight:700, color }}>{val}</div>
                    <div style={{ fontSize:11, color:C.muted }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:12, color:C.muted }}>
                Login: <code style={{ color:C.text }}>{u.id}</code> / <code style={{ color:C.text }}>{u.password}</code>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Settings({ onClear }) {
  return (
    <div>
      <div style={{ fontSize:22, fontWeight:700, color:C.white, marginBottom:4 }}>Settings</div>
      <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Credentials & integration</div>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:16 }}>
        <div style={{ fontWeight:600, color:C.white, marginBottom:8 }}>👤 Login Credentials</div>
        {USERS.map(u => (
          <div key={u.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0",
            borderBottom:`1px solid ${C.border}`, fontSize:13 }}>
            <span style={{ color:C.text }}>{u.name}</span>
            <span style={{ color:C.muted }}><code style={{ color:C.text }}>{u.id}</code> / <code style={{ color:C.text }}>{u.password}</code></span>
          </div>
        ))}
      </div>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
        <div style={{ fontWeight:600, color:C.white, marginBottom:8 }}>🗑️ Reset Data</div>
        <div style={{ fontSize:13, color:C.muted, marginBottom:12 }}>Clear all leads from the CRM.</div>
        <Btn variant="danger" onClick={onClear}>Clear All Leads</Btn>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [leads, setLeads] = useState(() => {
    try {
      const saved = localStorage.getItem("vgm_crm_leads");
      return saved ? JSON.parse(saved) : DEMO_LEADS;
    } catch {
      return DEMO_LEADS;
    }
  });
  const [modal, setModal] = useState(null); // null | { type, lead }
  const [loginU, setLoginU] = useState("");
  const [loginP, setLoginP] = useState("");
  const [loginErr, setLoginErr] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    localStorage.setItem("vgm_crm_leads", JSON.stringify(leads));
  }, [leads]);

  const followupCount = user
    ? (user.role==="admin" ? leads.filter(l=>l.status==="followup").length
        : leads.filter(l=>l.status==="followup" && l.assignedTo===user.id).length)
    : 0;

  function doLogin() {
    const u = USERS.find(x => x.id === loginU.trim() && x.password === loginP.trim());
    if (!u) { setLoginErr(true); return; }
    setUser(u);
    setPage("dashboard");
    setLoginErr(false);
  }

  function updateLeads(fn) { setLeads(prev => fn([...prev])); }

  function saveLead(data, editId) {
    updateLeads(ls => {
      if (editId) {
        const i = ls.findIndex(l=>l.id===editId);
        ls[i] = { ...ls[i], ...data };
      } else {
        ls.unshift({ ...data, id: uid(), createdAt: new Date().toISOString(),
          assignedTo: user.role==="admin" ? data.assignedTo : user.id });
      }
      return ls;
    });
    setModal(null);
  }

  function deleteLead(id) {
    if (!confirm("Delete this lead?")) return;
    updateLeads(ls => ls.filter(l=>l.id!==id));
  }

  function assignLead(id, handlerId) {
    updateLeads(ls => { const l=ls.find(x=>x.id===id); if(l) l.assignedTo=handlerId; return ls; });
  }

  function changeStatus(id, status) {
    updateLeads(ls => { const l=ls.find(x=>x.id===id); if(l) l.status=status; return ls; });
  }

  function markContacted(id) { changeStatus(id, "contacted"); }

  const NAV = [
    { key:"dashboard", icon:"📊", label:"Dashboard" },
    { key:"leads",     icon:"👥", label: user?.role==="admin" ? "All Leads" : "My Leads" },
    { key:"followups", icon:"⏰", label:"Follow-ups", badge: followupCount },
    ...(user?.role==="admin" ? [
      { key:"handlers", icon:"🧑‍💼", label:"Handlers" },
      { key:"settings", icon:"⚙️",  label:"Settings" },
    ] : []),
  ];

  // LOGIN SCREEN
  if (!user) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
        background:`radial-gradient(ellipse at 60% 30%, #123629 0%, ${C.bg} 70%)`, padding:16 }}>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16,
          padding:"40px 32px", width:"100%", maxWidth:360, boxShadow:"0 24px 64px rgba(0,0,0,.5)" }}>
          <div style={{ fontSize:28, fontWeight:800, color:C.white, marginBottom:4 }}>
            VGM<span style={{ color:C.accent }}> CRM</span>
          </div>
          <div style={{ fontSize:13, color:C.muted, marginBottom:28 }}>VGM Enterprises Lead Management</div>
          <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:".06em", fontWeight:600, marginBottom:5 }}>Username</div>
          <input value={loginU} onChange={e=>{setLoginU(e.target.value);setLoginErr(false);}}
            onKeyDown={e=>e.key==="Enter"&&doLogin()} placeholder="Enter username"
            style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8,
              padding:"10px 14px", color:C.text, fontSize:14, outline:"none", marginBottom:14, boxSizing:"border-box" }} />
          <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:".06em", fontWeight:600, marginBottom:5 }}>Password</div>
          <input type="password" value={loginP} onChange={e=>{setLoginP(e.target.value);setLoginErr(false);}}
            onKeyDown={e=>e.key==="Enter"&&doLogin()} placeholder="Enter password"
            style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8,
              padding:"10px 14px", color:C.text, fontSize:14, outline:"none", marginBottom:20, boxSizing:"border-box" }} />
          <button onClick={doLogin} style={{ width:"100%", background:C.accent, color:"#fff", border:"none",
            borderRadius:8, padding:12, fontSize:15, fontWeight:700, cursor:"pointer" }}>Sign In</button>
          {loginErr && <div style={{ color:C.red, fontSize:13, marginTop:10, textAlign:"center" }}>Invalid username or password.</div>}
          <div style={{ marginTop:20, padding:14, background:C.bg, borderRadius:8, fontSize:12, color:C.muted }}>
            <div style={{ marginBottom:6, color:C.text, fontWeight:600 }}>Demo credentials:</div>
            <div>Admin: <code style={{color:C.accent}}>admin</code> / <code style={{color:C.accent}}>vgmadmin123</code></div>
            <div>Handler: <code style={{color:C.accent2}}>handler1</code> / <code style={{color:C.accent2}}>handler1</code></div>
          </div>
        </div>
      </div>
    );
  }

  // APP
  const sharedProps = {
    leads, user,
    onView:  l => setModal({ type:"view", lead:l }),
    onEdit:  l => setModal({ type:"edit", lead:l }),
    onAdd:   () => setModal({ type:"add" }),
    onDelete: deleteLead,
    onAssign: assignLead,
    onStatusChange: changeStatus,
    onMarkContacted: markContacted,
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"system-ui,sans-serif" }}>
      {/* TOPBAR */}
      <div style={{ height:54, background:C.surface, borderBottom:`1px solid ${C.border}`,
        display:"flex", alignItems:"center", padding:"0 16px", gap:12, position:"sticky", top:0, zIndex:200 }}>
        <button onClick={()=>setMobileMenu(m=>!m)} style={{ background:"none", border:"none", color:C.text, fontSize:20, cursor:"pointer", padding:4 }}>☰</button>
        <div style={{ fontWeight:800, fontSize:18, color:C.white, flex:1 }}>VGM<span style={{color:C.accent}}> CRM</span></div>
        <div style={{ fontSize:13, color:C.muted }}>{user.name}</div>
        <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", padding:"2px 7px", borderRadius:4,
          background: user.role==="admin" ? "rgba(79,142,247,.18)" : "rgba(124,92,252,.18)",
          color: user.role==="admin" ? C.accent : C.accent2 }}>{user.role}</span>
        <button onClick={()=>setUser(null)} style={{ background:"none", border:`1px solid ${C.border}`,
          color:C.muted, borderRadius:7, padding:"4px 10px", cursor:"pointer", fontSize:12 }}>Out</button>
      </div>

      {/* BOTTOM NAV (mobile-first) */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:C.surface,
        borderTop:`1px solid ${C.border}`, display:"flex", zIndex:200, paddingBottom:"env(safe-area-inset-bottom)" }}>
        {NAV.map(n => (
          <button key={n.key} onClick={()=>{ setPage(n.key); setMobileMenu(false); }}
            style={{ flex:1, background:"none", border:"none", cursor:"pointer", padding:"10px 4px 8px",
              display:"flex", flexDirection:"column", alignItems:"center", gap:3,
              color: page===n.key ? C.accent : C.muted, borderTop: page===n.key ? `2px solid ${C.accent}` : "2px solid transparent" }}>
            <span style={{ fontSize:18, position:"relative" }}>
              {n.icon}
              {n.badge > 0 && <span style={{ position:"absolute", top:-4, right:-6, background:C.orange,
                color:"#fff", borderRadius:10, padding:"0 4px", fontSize:9, fontWeight:700 }}>{n.badge}</span>}
            </span>
            <span style={{ fontSize:9, fontWeight:600, textTransform:"uppercase", letterSpacing:".04em" }}>{n.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ flex:1, padding:"20px 16px 90px" }}>
        {page==="dashboard" && <Dashboard {...sharedProps} />}
        {page==="leads"     && <AllLeads  {...sharedProps} />}
        {page==="followups" && <Followups {...sharedProps} />}
        {page==="handlers"  && user.role==="admin" && <Handlers leads={leads} />}
        {page==="settings"  && user.role==="admin" && <Settings onClear={()=>{ if(confirm("Delete all leads?")) setLeads([]); }} />}
      </div>

      {/* MODALS */}
      {modal?.type==="add" && (
        <LeadForm title="Add New Lead" sub="Enter lead information below" isAdmin={user.role==="admin"}
          onSave={data=>saveLead(data, null)} onCancel={()=>setModal(null)} />
      )}
      {modal?.type==="edit" && (
        <LeadForm title="Edit Lead" sub={modal.lead.name} initial={modal.lead} isAdmin={user.role==="admin"}
          onSave={data=>saveLead(data, modal.lead.id)} onCancel={()=>setModal(null)} />
      )}
      {modal?.type==="view" && (
        <ViewModal lead={modal.lead} onClose={()=>setModal(null)}
          onEdit={()=>setModal({ type:"edit", lead:modal.lead })} />
      )}
    </div>
  );
}
