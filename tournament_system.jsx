import { useEffect, useState } from "react";
import { Badge, GameTag, Modal, FormGroup, inputStyle } from "./tournament_system.ui.jsx";
import {
  GAMES,
  ROLES,
  RANKS,
  FORMATS,
  TEAM_SIZES,
  LOOKING_OPTIONS,
  initialTournaments,
  initialLFT,
  colors,
  rankScore,
  parseLookingCount,
  getAllRoles,
} from "./tournament_system.data.jsx";

const pageTitles = {
  home: "Home",
  tournaments: "Tournaments",
  findteam: "Find Teammates",
  admin: "Admin",
};

const normalizePage = value => (value && pageTitles[value] ? value : "home");

export default function App() {
  const [page, setPage] = useState(() => normalizePage(window.location.hash.replace(/^#/, "")));
  const [tournaments, setTournaments] = useState(initialTournaments);
  const [lftPosts, setLftPosts] = useState(initialLFT);
  const [filterGame, setFilterGame] = useState("All");
  const [lftFilter, setLftFilter] = useState("All");
  const [lftSearch, setLftSearch] = useState("");
  const [lftRoleFilter, setLftRoleFilter] = useState("All roles");
  const [lftRankFilter, setLftRankFilter] = useState("All ranks");

  // Modals
  const [registerModal, setRegisterModal] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [lftModal, setLftModal] = useState(false);
  const [detailModal, setDetailModal] = useState(null);

  // Forms
  const [regForm, setRegForm] = useState({ teamName: "", captain: "", gameId: "", players: "", rank: "Gold" });
  const [newTournament, setNewTournament] = useState({ name: "", game: "CS2", format: "Single Elimination", teamSize: "5v5", entryType: "free", entryFee: 0, prize: 0, maxTeams: 8, date: "", minRank: "Unranked" });
  const [lftForm, setLftForm] = useState({ player: "", game: "CS2", role: "Entry Fragger", rank: "Gold", looking: "Full team (5v5)", desc: "", contact: "" });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const syncPage = () => setPage(normalizePage(window.location.hash.replace(/^#/, "")));
    syncPage();
    window.addEventListener("hashchange", syncPage);
    return () => window.removeEventListener("hashchange", syncPage);
  }, []);

  const navigatePage = nextPage => {
    const normalized = normalizePage(nextPage);
    if (window.location.hash !== `#${normalized}`) {
      window.location.hash = normalized;
    }
    setPage(normalized);
  };

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRegister = () => {
    if (!regForm.teamName || !regForm.captain || !regForm.gameId) return notify("Please fill all required fields.", "error");
    setTournaments(ts => ts.map(t => t.id === registerModal.id ? { ...t, teams: [...t.teams, { ...regForm, id: Date.now() }] } : t));
    setRegisterModal(null);
    setRegForm({ teamName: "", captain: "", gameId: "", players: "", rank: "Gold" });
    notify("Team registered successfully!");
  };

  const handleCreateTournament = () => {
    if (!newTournament.name || !newTournament.date) return notify("Name and date are required.", "error");
    setTournaments(ts => [...ts, { ...newTournament, id: Date.now(), teams: [], status: "open" }]);
    setCreateModal(false);
    setNewTournament({ name: "", game: "CS2", format: "Single Elimination", teamSize: "5v5", entryType: "free", entryFee: 0, prize: 0, maxTeams: 8, date: "", minRank: "Unranked" });
    notify("Tournament created!");
  };

  const handlePostLFT = () => {
    if (!lftForm.player || !lftForm.contact || !lftForm.desc) return notify("Please fill all required fields.", "error");
    setLftPosts(ps => [{ ...lftForm, id: Date.now() }, ...ps]);
    setLftModal(false);
    setLftForm({ player: "", game: "CS2", role: "Entry Fragger", rank: "Gold", looking: "Full team (5v5)", desc: "", contact: "" });
    notify("Your LFT post is live!");
  };

  const filtered = filterGame === "All" ? tournaments : tournaments.filter(t => t.game === filterGame);
  const filteredLFT = lftPosts.filter(p => {
    const matchesGame = lftFilter === "All" || p.game === lftFilter;
    const matchesRole = lftRoleFilter === "All roles" || p.role === lftRoleFilter;
    const matchesRank = lftRankFilter === "All ranks" || p.rank === lftRankFilter;
    const haystack = [p.player, p.game, p.role, p.rank, p.looking, p.desc, p.contact].join(" ").toLowerCase();
    const matchesSearch = !lftSearch.trim() || haystack.includes(lftSearch.trim().toLowerCase());
    return matchesGame && matchesRole && matchesRank && matchesSearch;
  });

  const rankedLftSuggestions = [...filteredLFT]
    .map(post => ({
      ...post,
      score: [
        post.game === lftForm.game ? 5 : 0,
        post.role === lftForm.role ? 4 : 0,
        Math.max(0, 4 - Math.abs((rankScore[post.rank] ?? 0) - (rankScore[lftForm.rank] ?? 0))),
        parseLookingCount(post.looking) > 0 ? 2 : 0,
        lftForm.desc && post.desc.toLowerCase().includes(lftForm.game.toLowerCase()) ? 1 : 0,
      ].reduce((sum, value) => sum + value, 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const openTeamSlots = tournaments.reduce((sum, tournament) => sum + Math.max(0, tournament.maxTeams - tournament.teams.length), 0);

  const tabs = [
    { key: "home", label: "Home", icon: "ti-home" },
    { key: "tournaments", label: "Tournaments", icon: "ti-trophy" },
    { key: "findteam", label: "Find Teammates", icon: "ti-users" },
    { key: "admin", label: "Admin", icon: "ti-settings" },
  ];

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", minHeight: "100vh", background: "var(--color-background-tertiary)" }}>
      <h2 className="sr-only">Internet Café Tournament Registration System</h2>

      {/* Header */}
      <div style={{ background: "var(--color-background-primary)", borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "0 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "1rem 0 0" }}>
          <i className="ti ti-device-gamepad-2" style={{ fontSize: 22, color: "#E85D4A" }} aria-hidden="true"></i>
          <span style={{ fontWeight: 500, fontSize: 17 }}>CyberArena</span>
          <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginLeft: 4 }}>Internet Café Tournament System</span>
        </div>
        <div style={{ display: "flex", gap: 0, marginTop: 12 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => navigatePage(t.key)} style={{
              background: "none", border: "none", cursor: "pointer", padding: "8px 16px 10px", fontSize: 14, fontWeight: 500,
              color: page === t.key ? "#E85D4A" : "var(--color-text-secondary)",
              borderBottom: page === t.key ? "2px solid #E85D4A" : "2px solid transparent",
              display: "flex", alignItems: "center", gap: 6, transition: "color 0.15s"
            }}>
              <i className={`ti ${t.icon}`} style={{ fontSize: 15 }} aria-hidden="true"></i>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div style={{
          position: "fixed", top: 16, right: 16, zIndex: 2000,
          background: notification.type === "error" ? "var(--color-background-danger)" : "var(--color-background-success)",
          color: notification.type === "error" ? "var(--color-text-danger)" : "var(--color-text-success)",
          padding: "10px 18px", borderRadius: 10, fontSize: 14, fontWeight: 500,
          border: `0.5px solid ${notification.type === "error" ? "var(--color-border-danger)" : "var(--color-border-success)"}`,
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
        }}>
          {notification.msg}
        </div>
      )}

      <div style={{ padding: "1.5rem" }}>
        {page === "home" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: "1rem" }}>
              {[
                { title: "Turnuva kayıtları", text: "Takımlar turnuvalara başvurabilir, açık slotları anında görebilir." },
                { title: "Takım arkadaşı bulma", text: "Oyuncular rol, rank ve oyun bazında eşleşme önerileri alır." },
                { title: "Kafe yönetimi", text: "Yöneticiler turnuva açabilir, kapatabilir ve kayıtları izleyebilir." },
              ].map(card => (
                <div key={card.title} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 16, padding: "1.1rem 1.2rem" }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{card.title}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-text-secondary)" }}>{card.text}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {[
                { label: "Active tournaments", value: tournaments.length, note: "Canlı kayıtlı turnuva" },
                { label: "Open team slots", value: openTeamSlots, note: "Kayıt bekleyen boş yer" },
                { label: "LFT posts", value: lftPosts.length, note: "Takım arayan oyuncular" },
              ].map(card => (
                <div key={card.label} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem 1.1rem" }}>
                  <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 6 }}>{card.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 600, lineHeight: 1 }}>{card.value}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 6 }}>{card.note}</div>
                </div>
              ))}
            </div>
          </>
        )}
        {page !== "admin" && page !== "home" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: "1rem" }}>
            {[
              { label: "Active tournaments", value: tournaments.length, note: `${filtered.length} visible in current filter` },
              { label: "Open team slots", value: openTeamSlots, note: "Across all listed tournaments" },
              { label: "LFT posts", value: lftPosts.length, note: "Players searching for teams" },
            ].map(card => (
              <div key={card.label} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem 1.1rem" }}>
                <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 6 }}>{card.label}</div>
                <div style={{ fontSize: 24, fontWeight: 600, lineHeight: 1 }}>{card.value}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 6 }}>{card.note}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── TOURNAMENTS TAB ── */}
        {page === "tournaments" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["All", ...GAMES].map(g => (
                  <button key={g} onClick={() => setFilterGame(g)} style={{
                    padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: filterGame === g ? 500 : 400,
                    background: filterGame === g ? "#E85D4A" : "var(--color-background-primary)",
                    color: filterGame === g ? "#fff" : "var(--color-text-secondary)",
                    border: `0.5px solid ${filterGame === g ? "#E85D4A" : "var(--color-border-secondary)"}`,
                    transition: "all 0.15s"
                  }}>{g}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
              {filtered.map(t => (
                <div key={t.id} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>{t.name}</div>
                      <GameTag game={t.game} />
                    </div>
                    <Badge color={t.status === "open" ? "var(--color-background-success)" : "var(--color-background-secondary)"} textColor={t.status === "open" ? "var(--color-text-success)" : "var(--color-text-secondary)"}>
                      {t.status === "open" ? "Open" : "Closed"}
                    </Badge>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {[
                      { icon: "ti-tournament", label: t.format },
                      { icon: "ti-users", label: t.teamSize },
                      { icon: "ti-calendar", label: t.date },
                      { icon: "ti-shield-star", label: t.minRank + "+ rank" },
                    ].map(({ icon, label }) => (
                      <div key={icon} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--color-text-secondary)" }}>
                        <i className={`ti ${icon}`} style={{ fontSize: 13 }} aria-hidden="true"></i>
                        {label}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                      <i className="ti ti-users" style={{ fontSize: 13 }} aria-hidden="true"></i>{" "}
                      {t.teams.length}/{t.maxTeams} teams
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: t.entryType === "paid" ? "#E85D4A" : "var(--color-text-success)" }}>
                      {t.entryType === "paid" ? `₺${t.entryFee} entry • ₺${t.prize} prize` : "Free entry"}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <button onClick={() => setDetailModal(t)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "none", border: "0.5px solid var(--color-border-secondary)", color: "var(--color-text-primary)" }}>
                      View details
                    </button>
                    <button
                      onClick={() => t.teams.length < t.maxTeams && t.status === "open" ? setRegisterModal(t) : null}
                      disabled={t.teams.length >= t.maxTeams || t.status !== "open"}
                      style={{ flex: 2, padding: "7px 0", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: t.teams.length >= t.maxTeams ? "not-allowed" : "pointer", background: t.teams.length >= t.maxTeams ? "var(--color-background-secondary)" : "#E85D4A", color: t.teams.length >= t.maxTeams ? "var(--color-text-secondary)" : "#fff", border: "none", opacity: t.status !== "open" ? 0.5 : 1 }}>
                      {t.teams.length >= t.maxTeams ? "Full" : "Register Team"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── FIND TEAMMATES TAB ── */}
        {page === "findteam" && (
          <>
            <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <i className="ti ti-user-search" style={{ fontSize: 20, color: "#E85D4A" }} aria-hidden="true"></i>
                <div>
                  <div style={{ fontWeight: 500 }}>Looking for Teammates (LFT)</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Post your profile or browse to find the perfect squad</div>
                </div>
              </div>
              <button onClick={() => setLftModal(true)} style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", background: "#E85D4A", color: "#fff", border: "none" }}>
                <i className="ti ti-plus" style={{ fontSize: 14, marginRight: 5 }} aria-hidden="true"></i>
                Post LFT Ad
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10, marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>Search</label>
                <input
                  style={inputStyle}
                  value={lftSearch}
                  onChange={e => setLftSearch(e.target.value)}
                  placeholder="Player, role, rank, contact..."
                />
              </div>
              <FormGroup label="Role filter">
                <select style={inputStyle} value={lftRoleFilter} onChange={e => setLftRoleFilter(e.target.value)}>
                  <option>All roles</option>
                  {getAllRoles().map(role => <option key={role}>{role}</option>)}
                </select>
              </FormGroup>
              <FormGroup label="Rank filter">
                <select style={inputStyle} value={lftRankFilter} onChange={e => setLftRankFilter(e.target.value)}>
                  <option>All ranks</option>
                  {RANKS.map(rank => <option key={rank}>{rank}</option>)}
                </select>
              </FormGroup>
              <div style={{ display: "flex", alignItems: "end" }}>
                <button
                  onClick={() => {
                    setLftSearch("");
                    setLftRoleFilter("All roles");
                    setLftRankFilter("All ranks");
                    setLftFilter("All");
                  }}
                  style={{ width: "100%", padding: "8px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "none", border: "0.5px solid var(--color-border-secondary)", color: "var(--color-text-primary)" }}
                >
                  Clear filters
                </button>
              </div>
            </div>

            {lftForm.player && (
              <div style={{ background: "linear-gradient(135deg, rgba(232,93,74,0.12), rgba(200,155,60,0.10))", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Suggested teammates for {lftForm.player || "your profile"}</div>
                    <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Highest matches are scored by game, role and rank proximity.</div>
                  </div>
                  <Badge color="var(--color-background-info)" textColor="var(--color-text-info)">{rankedLftSuggestions.length} suggestions</Badge>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                  {rankedLftSuggestions.length === 0 ? (
                    <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>No matches found with the current filters.</div>
                  ) : rankedLftSuggestions.map(match => (
                    <div key={match.id} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{match.player}</div>
                          <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{match.role} · {match.rank}</div>
                        </div>
                        <Badge color="var(--color-background-success)" textColor="var(--color-text-success)">{match.score} match</Badge>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                        <GameTag game={match.game} />
                        <Badge>{match.looking}</Badge>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.45, marginBottom: 8 }}>{match.desc}</div>
                      <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", background: "var(--color-background-secondary)", borderRadius: 8, padding: "8px 10px" }}>{match.contact}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1rem" }}>
              {["All", ...GAMES].map(g => (
                <button key={g} onClick={() => setLftFilter(g)} style={{
                  padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: lftFilter === g ? 500 : 400,
                  background: lftFilter === g ? "#E85D4A" : "var(--color-background-primary)",
                  color: lftFilter === g ? "#fff" : "var(--color-text-secondary)",
                  border: `0.5px solid ${lftFilter === g ? "#E85D4A" : "var(--color-border-secondary)"}`,
                  transition: "all 0.15s"
                }}>{g}</button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 12 }}>
              {filteredLFT.map(p => (
                <div key={p.id} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem 1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: (colors[p.game] || "#888") + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: colors[p.game] || "#888" }}>
                      {p.player.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 15 }}>{p.player}</div>
                      <GameTag game={p.game} />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    <Badge><i className="ti ti-sword" style={{ fontSize: 11, marginRight: 3 }} aria-hidden="true"></i>{p.role}</Badge>
                    <Badge><i className="ti ti-medal" style={{ fontSize: 11, marginRight: 3 }} aria-hidden="true"></i>{p.rank}</Badge>
                    <Badge color="var(--color-background-info)" textColor="var(--color-text-info)">
                      <i className="ti ti-users" style={{ fontSize: 11, marginRight: 3 }} aria-hidden="true"></i>{p.looking}
                    </Badge>
                  </div>

                  <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 10px", lineHeight: 1.5 }}>{p.desc}</p>

                  <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", display: "flex", alignItems: "center", gap: 4, padding: "8px 10px", background: "var(--color-background-secondary)", borderRadius: 8 }}>
                    <i className="ti ti-brand-discord" style={{ fontSize: 13 }} aria-hidden="true"></i>
                    {p.contact}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── ADMIN TAB ── */}
        {page === "admin" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontWeight: 500 }}>Tournament Management</h3>
              <button onClick={() => setCreateModal(true)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", background: "#E85D4A", color: "#fff", border: "none", display: "flex", alignItems: "center", gap: 6 }}>
                <i className="ti ti-plus" style={{ fontSize: 14 }} aria-hidden="true"></i>
                Create Tournament
              </button>
            </div>

            <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden" }}>
              {tournaments.map((t, i) => (
                <div key={t.id} style={{ padding: "1rem 1.25rem", borderBottom: i < tournaments.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{t.name}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                        <GameTag game={t.game} />
                        <Badge>{t.format}</Badge>
                        <Badge color="var(--color-background-info)" textColor="var(--color-text-info)">{t.teams.length}/{t.maxTeams} teams</Badge>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setDetailModal(t)} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: "none", border: "0.5px solid var(--color-border-secondary)", color: "var(--color-text-primary)" }}>
                      <i className="ti ti-eye" style={{ fontSize: 13 }} aria-hidden="true"></i>{" "}Teams
                    </button>
                    <button
                      onClick={() => setTournaments(ts => ts.map(x => x.id === t.id ? { ...x, status: x.status === "open" ? "closed" : "open" } : x))}
                      style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: t.status === "open" ? "var(--color-background-danger)" : "var(--color-background-success)", color: t.status === "open" ? "var(--color-text-danger)" : "var(--color-text-success)", border: "none" }}>
                      {t.status === "open" ? "Close" : "Reopen"}
                    </button>
                    <button onClick={() => setTournaments(ts => ts.filter(x => x.id !== t.id))} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: "none", border: "0.5px solid var(--color-border-danger)", color: "var(--color-text-danger)" }}>
                      <i className="ti ti-trash" style={{ fontSize: 13 }} aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── REGISTER MODAL ── */}
      <Modal open={!!registerModal} onClose={() => setRegisterModal(null)} title={`Register for ${registerModal?.name}`}>
        <FormGroup label="Team name *">
          <input style={inputStyle} value={regForm.teamName} onChange={e => setRegForm(f => ({ ...f, teamName: e.target.value }))} placeholder="e.g. Phoenix Squad" />
        </FormGroup>
        <FormGroup label="Captain username *">
          <input style={inputStyle} value={regForm.captain} onChange={e => setRegForm(f => ({ ...f, captain: e.target.value }))} placeholder="Your in-game name" />
        </FormGroup>
        <FormGroup label="Game ID / Profile link *">
          <input style={inputStyle} value={regForm.gameId} onChange={e => setRegForm(f => ({ ...f, gameId: e.target.value }))} placeholder="Steam ID, Riot ID, etc." />
        </FormGroup>
        <FormGroup label="Player rank">
          <select style={inputStyle} value={regForm.rank} onChange={e => setRegForm(f => ({ ...f, rank: e.target.value }))}>
            {RANKS.map(r => <option key={r}>{r}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Teammates (comma-separated usernames)">
          <input style={inputStyle} value={regForm.players} onChange={e => setRegForm(f => ({ ...f, players: e.target.value }))} placeholder="player2, player3, ..." />
        </FormGroup>
        {registerModal?.entryType === "paid" && (
          <div style={{ padding: "10px 14px", background: "var(--color-background-warning)", borderRadius: 8, marginBottom: "1rem", fontSize: 13, color: "var(--color-text-warning)" }}>
            <i className="ti ti-coin" style={{ fontSize: 14, marginRight: 6 }} aria-hidden="true"></i>
            Entry fee: <strong>₺{registerModal.entryFee}</strong> — pay at the front desk before the tournament starts.
          </div>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={() => setRegisterModal(null)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "none", border: "0.5px solid var(--color-border-secondary)", color: "var(--color-text-primary)" }}>Cancel</button>
          <button onClick={handleRegister} style={{ padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", background: "#E85D4A", color: "#fff", border: "none" }}>Confirm Registration</button>
        </div>
      </Modal>

      {/* ── DETAIL MODAL ── */}
      <Modal open={!!detailModal} onClose={() => setDetailModal(null)} title={detailModal?.name}>
        {detailModal && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: "1rem" }}>
              {[
                ["Game", detailModal.game], ["Format", detailModal.format],
                ["Team size", detailModal.teamSize], ["Date", detailModal.date],
                ["Min rank", detailModal.minRank], ["Max teams", detailModal.maxTeams],
                ["Entry", detailModal.entryType === "paid" ? `₺${detailModal.entryFee}` : "Free"],
                ["Prize pool", detailModal.entryType === "paid" ? `₺${detailModal.prize}` : "—"],
              ].map(([k, v]) => (
                <div key={k} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>Registered teams ({detailModal.teams.length})</div>
            {detailModal.teams.length === 0 ? (
              <div style={{ color: "var(--color-text-tertiary)", fontSize: 13 }}>No teams registered yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {detailModal.teams.map((team, i) => (
                  <div key={team.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#E85D4A22", color: "#E85D4A", fontSize: 11, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{team.teamName}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{team.captain} · {team.rank}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Modal>

      {/* ── CREATE TOURNAMENT MODAL ── */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create tournament">
        <FormGroup label="Tournament name *">
          <input style={inputStyle} value={newTournament.name} onChange={e => setNewTournament(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Monthly CS2 Cup" />
        </FormGroup>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <FormGroup label="Game">
            <select style={inputStyle} value={newTournament.game} onChange={e => setNewTournament(f => ({ ...f, game: e.target.value }))}>
              {GAMES.map(g => <option key={g}>{g}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Format">
            <select style={inputStyle} value={newTournament.format} onChange={e => setNewTournament(f => ({ ...f, format: e.target.value }))}>
              {FORMATS.map(f => <option key={f}>{f}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Team size">
            <select style={inputStyle} value={newTournament.teamSize} onChange={e => setNewTournament(f => ({ ...f, teamSize: e.target.value }))}>
              {TEAM_SIZES.map(s => <option key={s}>{s}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Max teams">
            <input type="number" style={inputStyle} value={newTournament.maxTeams} onChange={e => setNewTournament(f => ({ ...f, maxTeams: +e.target.value }))} min={2} max={128} />
          </FormGroup>
          <FormGroup label="Entry type">
            <select style={inputStyle} value={newTournament.entryType} onChange={e => setNewTournament(f => ({ ...f, entryType: e.target.value }))}>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </FormGroup>
          <FormGroup label="Min rank">
            <select style={inputStyle} value={newTournament.minRank} onChange={e => setNewTournament(f => ({ ...f, minRank: e.target.value }))}>
              {RANKS.map(r => <option key={r}>{r}</option>)}
            </select>
          </FormGroup>
          {newTournament.entryType === "paid" && <>
            <FormGroup label="Entry fee (₺)">
              <input type="number" style={inputStyle} value={newTournament.entryFee} onChange={e => setNewTournament(f => ({ ...f, entryFee: +e.target.value }))} min={0} />
            </FormGroup>
            <FormGroup label="Prize pool (₺)">
              <input type="number" style={inputStyle} value={newTournament.prize} onChange={e => setNewTournament(f => ({ ...f, prize: +e.target.value }))} min={0} />
            </FormGroup>
          </>}
        </div>
        <FormGroup label="Date *">
          <input type="date" style={inputStyle} value={newTournament.date} onChange={e => setNewTournament(f => ({ ...f, date: e.target.value }))} />
        </FormGroup>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={() => setCreateModal(false)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "none", border: "0.5px solid var(--color-border-secondary)", color: "var(--color-text-primary)" }}>Cancel</button>
          <button onClick={handleCreateTournament} style={{ padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", background: "#E85D4A", color: "#fff", border: "none" }}>Create</button>
        </div>
      </Modal>

      {/* ── LFT POST MODAL ── */}
      <Modal open={lftModal} onClose={() => setLftModal(false)} title="Post a Looking for Teammates ad">
        <FormGroup label="Your username *">
          <input style={inputStyle} value={lftForm.player} onChange={e => setLftForm(f => ({ ...f, player: e.target.value }))} placeholder="Your in-game name" />
        </FormGroup>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <FormGroup label="Game">
            <select style={inputStyle} value={lftForm.game} onChange={e => setLftForm(f => ({ ...f, game: e.target.value, role: ROLES[e.target.value]?.[0] || "Any" }))}>
              {GAMES.map(g => <option key={g}>{g}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Your role">
            <select style={inputStyle} value={lftForm.role} onChange={e => setLftForm(f => ({ ...f, role: e.target.value }))}>
              {(ROLES[lftForm.game] || ["Any"]).map(r => <option key={r}>{r}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Your rank">
            <select style={inputStyle} value={lftForm.rank} onChange={e => setLftForm(f => ({ ...f, rank: e.target.value }))}>
              {RANKS.map(r => <option key={r}>{r}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Looking for">
            <select style={inputStyle} value={lftForm.looking} onChange={e => setLftForm(f => ({ ...f, looking: e.target.value }))}>
                {LOOKING_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </FormGroup>
        </div>
        <FormGroup label="About you *">
          <textarea style={{ ...inputStyle, minHeight: 72, resize: "vertical" }} value={lftForm.desc} onChange={e => setLftForm(f => ({ ...f, desc: e.target.value }))} placeholder="Tell others about your playstyle, hours, goals..." />
        </FormGroup>
        <FormGroup label="Contact info *">
          <input style={inputStyle} value={lftForm.contact} onChange={e => setLftForm(f => ({ ...f, contact: e.target.value }))} placeholder="Discord: username#0000" />
        </FormGroup>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={() => setLftModal(false)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "none", border: "0.5px solid var(--color-border-secondary)", color: "var(--color-text-primary)" }}>Cancel</button>
          <button onClick={handlePostLFT} style={{ padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", background: "#E85D4A", color: "#fff", border: "none" }}>Post Ad</button>
        </div>
      </Modal>
    </div>
  );
}
