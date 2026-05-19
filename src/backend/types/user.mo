import Time "mo:core/Time";

module {
  /// Aggregated statistics for one spot (identified by spotId text key).
  public type SpotStat = {
    attempts : Nat;
    mistakes : Nat;
  };

  /// ICM context for tournament pressure calculations.
  /// Used when mode = "icm". All fields optional except the core three.
  public type IcmContext = {
    stacks           : [Float];  // stack sizes of all players in BB
    payouts          : [Float];  // payout structure, e.g. [50.0, 30.0, 20.0]
    playersRemaining : Nat;      // total players remaining in the tournament
    heroIndex        : ?Nat;     // index of hero in stacks array (default 0)
    stage            : ?Text;    // "bubble" | "near_bubble" | "final_table" | "heads_up" | "custom"
    payoutType       : ?Text;    // "percentage" | "chips"
  };

  /// Summary of a single completed training session (last 100 kept per user).
  /// mode is optional for backward compatibility with pre-migration snapshots
  /// (old sessions will have mode = null, new sessions carry ?"nash" or ?"icm").
  public type SessionSummary = {
    completedAt     : Time.Time;
    scenario        : Text;
    stackRange      : Text;      // e.g. "15-25bb"
    mode            : ?Text;     // ?"nash" | ?"icm"
    handsPlayed     : Nat;
    correctCount    : Nat;
    acceptableCount : Nat;
    mistakeCount    : Nat;
  };

  /// Input payload sent by the frontend at the end of a session.
  /// spotResults is an array of (spotId, verdict) pairs where verdict is
  /// one of "correct" | "acceptable" | "mistake".
  /// mode is optional for forward compatibility; frontend should always send ?"nash" or ?"icm".
  public type SessionData = {
    completedAt     : Time.Time;
    scenario        : Text;
    stackRange      : Text;
    mode            : ?Text;          // ?"nash" | ?"icm"
    icmContext      : ?IcmContext;    // present only when mode = ?"icm"
    handsPlayed     : Nat;
    correctCount    : Nat;
    acceptableCount : Nat;
    mistakeCount    : Nat;
    spotResults     : [(Text, Text)]; // (spotId, verdict)
  };

  /// Full persisted profile for one Internet-Identity principal.
  /// sessions is capped at the 100 most-recent entries (enforced in lib).
  public type UserProfile = {
    principal       : Principal;
    createdAt       : Time.Time;
    totalHands      : Nat;
    totalSessions   : Nat;
    correctCount    : Nat;
    acceptableCount : Nat;
    mistakeCount    : Nat;
    isPremium       : Bool;
    sessions        : [SessionSummary];   // max 100, newest first
    spotStats       : [(Text, SpotStat)]; // (spotId, SpotStat)
  };
};
