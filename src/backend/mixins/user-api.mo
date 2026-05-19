import Map       "mo:core/Map";
import Principal "mo:core/Principal";
import Types     "../types/user";
import UserLib   "../lib/user";

mixin (profiles : Map.Map<Principal, Types.UserProfile>) {

  /// Creates a blank profile for the calling principal if one does not exist.
  public shared(msg) func ensureProfile() : async () {
    UserLib.ensureProfile(profiles, msg.caller);
  };

  /// Returns the full profile for the calling principal, or null if not found.
  public shared query(msg) func getProfile() : async ?Types.UserProfile {
    UserLib.getProfile(profiles, msg.caller);
  };

  /// Records the results of a completed training session for the calling
  /// principal. Should be called once per session, at the summary screen.
  public shared(msg) func saveSession(data : Types.SessionData) : async () {
    UserLib.saveSession(profiles, msg.caller, data);
  };

};
