import type {
  Fixture,
  Prediction,
  SavedPrediction,
  Subscription,
  Team,
  User,
} from "@/lib/api/types";

/**
 * Canned data for demo mode. Kickoffs are generated relative to today so the
 * board always looks current no matter when the preview is opened.
 */

function at(hour: number, minute = 0, dayOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const team = (id: number, name: string, league: string): Team => ({
  id,
  name,
  sport: "Football",
  league,
});

const EPL = "Premier League";
const LIGA = "LaLiga";
const UCL = "Champions League";

function prediction(
  id: number,
  fixtureId: number,
  market: string,
  tier: Prediction["confidence_tier"],
  score: number,
  unlocked: boolean,
  rationale: string,
): Prediction {
  return {
    id,
    fixture_id: fixtureId,
    market,
    confidence_tier: tier,
    confidence_score: score,
    unlocked: unlocked ? "1" : "0",
    scoring_version: "demo-1.4.2",
    ...(unlocked
      ? { rationale_text: rationale, share_token: `demo${id}` }
      : {}),
  };
}

export const DEMO_FIXTURES: Fixture[] = [
  {
    id: 1,
    competition: EPL,
    kickoff_at: at(12, 30),
    status: "Live",
    home_team: team(1, "Arsenal", EPL),
    away_team: team(2, "Tottenham Hotspur", EPL),
    prediction: prediction(
      101, 1, "Arsenal to win", "High", 84, true,
      "Arsenal have won seven of their last eight at this ground and name an unchanged front three. Spurs have conceded first in five straight away matches and rotate ahead of midweek European football.",
    ),
  },
  {
    id: 2,
    competition: EPL,
    kickoff_at: at(16, 0),
    status: "Scheduled",
    home_team: team(3, "Brighton", EPL),
    away_team: team(4, "Aston Villa", EPL),
    prediction: prediction(102, 2, "Over 2.5 goals", "Medium", 61, false, ""),
  },
  {
    id: 3,
    competition: EPL,
    kickoff_at: at(18, 30),
    status: "Scheduled",
    home_team: team(5, "Manchester City", EPL),
    away_team: team(6, "Everton", EPL),
    prediction: prediction(103, 3, "Man City -1.5 handicap", "High", 79, false, ""),
  },
  {
    id: 4,
    competition: EPL,
    kickoff_at: at(10, 0),
    status: "Finished",
    home_team: team(7, "Newcastle United", EPL),
    away_team: team(8, "Fulham", EPL),
    prediction: prediction(
      104, 4, "Both teams to score", "Low", 38, true,
      "Neither side has scored more than once in their last four meetings, and both managers have signalled a cautious approach with key defenders returning.",
    ),
  },
  {
    id: 5,
    competition: LIGA,
    kickoff_at: at(20, 0),
    status: "Scheduled",
    home_team: team(9, "Real Betis", LIGA),
    away_team: team(10, "Sevilla", LIGA),
    prediction: prediction(105, 5, "Draw", "Medium", 55, false, ""),
  },
  {
    id: 6,
    competition: LIGA,
    kickoff_at: at(21, 30),
    status: "Scheduled",
    home_team: team(11, "Girona", LIGA),
    away_team: team(12, "Real Sociedad", LIGA),
    prediction: prediction(106, 6, "Girona to win", "Low", 44, false, ""),
  },
  {
    id: 7,
    competition: UCL,
    kickoff_at: at(20, 0, 1),
    status: "Scheduled",
    home_team: team(13, "Bayern Munich", "Bundesliga"),
    away_team: team(14, "Inter Milan", "Serie A"),
    prediction: prediction(107, 7, "Bayern to win", "High", 72, false, ""),
  },
];

export const DEMO_USER: User = {
  id: 1,
  name: "Demo Account",
  email: "demo@predictx.app",
  role: "Fan",
  subscribed: false,
  created_at: at(9, 0, -30),
};

export const DEMO_SAVED: SavedPrediction[] = [
  {
    id: 1,
    saved_at: at(9),
    prediction: DEMO_FIXTURES[0].prediction!,
    fixture: DEMO_FIXTURES[0],
  },
];

export const DEMO_SUBSCRIPTIONS: Subscription[] = [];
