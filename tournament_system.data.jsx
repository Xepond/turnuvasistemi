export const GAMES = ["CS2", "Valorant", "League of Legends", "Dota 2", "PUBG", "Fortnite", "FIFA 25", "Tekken 8"];
export const ROLES = {
  "CS2": ["Entry Fragger", "AWPer", "Support", "IGL", "Lurker"],
  "Valorant": ["Duelist", "Controller", "Sentinel", "Initiator", "IGL"],
  "League of Legends": ["Top", "Jungle", "Mid", "Bot (ADC)", "Support"],
  "Dota 2": ["Carry", "Mid", "Offlane", "Soft Support", "Hard Support"],
  "PUBG": ["Fragger", "Support", "Scout", "IGL"],
  "Fortnite": ["Builder", "Fragger", "Support", "IGL"],
  "FIFA 25": ["Goalkeeper", "Defender", "Midfielder", "Forward"],
  "Tekken 8": ["Main"],
};
export const RANKS = ["Unranked", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster"];
export const FORMATS = ["Single Elimination", "Double Elimination", "Round Robin"];
export const TEAM_SIZES = ["1v1", "2v2", "3v3", "4v4", "5v5"];
export const LOOKING_OPTIONS = ["1 teammate", "2 teammates", "3 teammates", "4 teammates", "Full team (5v5)", "Need 3 more", "Duo partner"];

export const initialTournaments = [
  { id: 1, name: "CS2 Winter Championship", game: "CS2", format: "Single Elimination", teamSize: "5v5", entryType: "paid", entryFee: 50, prize: 500, maxTeams: 16, teams: [], status: "open", date: "2026-05-25", minRank: "Gold" },
  { id: 2, name: "Valorant City Cup", game: "Valorant", format: "Double Elimination", teamSize: "5v5", entryType: "free", entryFee: 0, prize: 0, maxTeams: 8, teams: [], status: "open", date: "2026-05-20", minRank: "Silver" },
  { id: 3, name: "LoL Solo Showdown", game: "League of Legends", format: "Round Robin", teamSize: "1v1", entryType: "free", entryFee: 0, prize: 0, maxTeams: 32, teams: [], status: "open", date: "2026-06-01", minRank: "Unranked" },
];

export const initialLFT = [
  { id: 1, player: "xBlazer99", game: "CS2", role: "AWPer", rank: "Diamond", looking: "Full team (5v5)", desc: "3000+ hours, IEM viewer, looking for serious team for weekly cups.", contact: "Discord: xBlazer#9901" },
  { id: 2, player: "NightOwl", game: "Valorant", role: "Duelist", rank: "Platinum", looking: "Need 3 more", desc: "Radiant player on smurf. Duo partner already found. Building a full squad.", contact: "Discord: NightOwl#0042" },
  { id: 3, player: "MidOrFeed", game: "League of Legends", role: "Mid", rank: "Gold", looking: "Need 4 more", desc: "Consistent laner, 58% WR on Azir. Looking for gold+ team.", contact: "Discord: MidOrFeed#2233" },
];

export const colors = {
  "CS2": "#E85D4A",
  "Valorant": "#FF4656",
  "League of Legends": "#C89B3C",
  "Dota 2": "#C23B22",
  "PUBG": "#F5A623",
  "Fortnite": "#00CCFF",
  "FIFA 25": "#00A86B",
  "Tekken 8": "#9B59B6",
};

export const rankScore = Object.fromEntries(RANKS.map((rank, index) => [rank, index]));

export const parseLookingCount = value => {
  if (value === "Duo partner") return 1;
  if (value === "Full team (5v5)") return 4;
  if (value === "Need 4 more") return 4;
  if (value === "Need 3 more") return 3;
  const match = value.match(/(\d+) teammate/);
  return match ? Number(match[1]) : 0;
};

export const getAllRoles = () => [...new Set(Object.values(ROLES).flat())];
