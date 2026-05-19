import Map       "mo:core/Map";
import Types     "./types/user";
import UserApi   "./mixins/user-api";


actor {
  // Stable user profile store: Principal → UserProfile
  let profiles = Map.empty<Principal, Types.UserProfile>();

  // Expose user_canister public API
  include UserApi(profiles);
};

