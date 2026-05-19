import Map       "mo:core/Map";
import Text      "mo:core/Text";
import Principal "mo:core/Principal";
import Array     "mo:core/Array";
import Types   "../types/user";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

module {
  public type UserProfile    = Types.UserProfile;
  public type SessionData    = Types.SessionData;
  public type SessionSummary = Types.SessionSummary;
  public type SpotStat       = Types.SpotStat;

  /// Returns the profile for `who`, or null when none exists yet.
  public func getProfile(
    profiles : Map.Map<Principal, UserProfile>,
    who      : Principal
  ) : ?UserProfile {
    profiles.get(who)
  };

  /// Creates a blank profile for `who` if one does not already exist.
  /// Idempotent — safe to call on every login.
  public func ensureProfile(
    profiles : Map.Map<Principal, UserProfile>,
    who      : Principal
  ) : () {
    if (profiles.containsKey(who)) return;
    let now = Time.now();
    let blank : UserProfile = {
      principal       = who;
      createdAt       = now;
      totalHands      = 0;
      totalSessions   = 0;
      correctCount    = 0;
      acceptableCount = 0;
      mistakeCount    = 0;
      isPremium       = false;
      sessions        = [];
      spotStats       = [];
    };
    profiles.add(who, blank);
  };

  /// Merges a completed session into the existing profile for `who`.
  /// Updates aggregate counters, spot stats, and appends a SessionSummary.
  /// Caps the sessions list at 100 entries (oldest are dropped first).
  public func saveSession(
    profiles : Map.Map<Principal, UserProfile>,
    who      : Principal,
    data     : SessionData
  ) : () {
    // Validate mode before any state mutation.
    let mode : ?Text = data.mode;
    switch (mode) {
      case (?m) {
        if (m != "nash" and m != "icm") {
          Runtime.trap("saveSession: invalid mode '" # m # "' — expected 'nash' or 'icm'");
        };
      };
      case null {}; // null is accepted for backward-compat with old clients
    };
    ensureProfile(profiles, who);
    let profile = switch (profiles.get(who)) {
      case (?p) { p };
      case null { Runtime.trap("profile must exist") };
    };

    // Build updated spot-stats map from the stored array.
    let spotMap = Map.fromArray<Text, SpotStat>(profile.spotStats);
    // Process each new spot result.
    for ((spotId, verdict) in data.spotResults.values()) {
      let current = switch (spotMap.get(spotId)) {
        case (?s) { s };
        case null { { attempts = 0; mistakes = 0 } };
      };
      let isMistake = verdict == "mistake";
      spotMap.add(spotId, {
        attempts = current.attempts + 1;
        mistakes = if (isMistake) { current.mistakes + 1 } else { current.mistakes };
      });
    };

    // Build new sessions list: prepend new summary, cap at 100.
    let newSummary : SessionSummary = {
      completedAt     = data.completedAt;
      scenario        = data.scenario;
      stackRange      = data.stackRange;
      mode            = data.mode;     // ?Text — already optional
      handsPlayed     = data.handsPlayed;
      correctCount    = data.correctCount;
      acceptableCount = data.acceptableCount;
      mistakeCount    = data.mistakeCount;
    };
    let prevSessions = profile.sessions;
    // Keep at most 99 of the previous sessions, then prepend the new one.
    let keepCount : Nat = if (prevSessions.size() >= 100) { 99 } else { prevSessions.size() };
    let trimmed = prevSessions.sliceToArray(0, keepCount);
    let updatedSessions = [newSummary].concat(trimmed);

    let updated : UserProfile = {
      profile with
      totalHands      = profile.totalHands      + data.handsPlayed;
      totalSessions   = profile.totalSessions   + 1;
      correctCount    = profile.correctCount    + data.correctCount;
      acceptableCount = profile.acceptableCount + data.acceptableCount;
      mistakeCount    = profile.mistakeCount    + data.mistakeCount;
      sessions        = updatedSessions;
      spotStats       = spotMap.toArray();
    };
    profiles.add(who, updated);
  };
};
