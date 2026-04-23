import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { fetchAPI } from "@/lib/fetch";

const Page = () => {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const [role, setRole] = useState<string | null>(null);
  const [roleFetched, setRoleFetched] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !user?.id) return;

    fetchAPI(`/(api)/user/${user.id}`)
      .then(async (result) => {
        if (!result.found) {
          // User is in Clerk but not in DB (e.g. OAuth sign-up) — create them now
          try {
            await fetchAPI("/(api)/user", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name:
                  user.fullName ??
                  user.primaryEmailAddress?.emailAddress?.split("@")[0] ??
                  "User",
                email: user.primaryEmailAddress?.emailAddress ?? "",
                clerkId: user.id,
              }),
            });
          } catch (_) {
            // Non-critical — continue as rider
          }
        }
        setRole(result.role ?? "rider");
      })
      .catch(() => setRole("rider"))
      .finally(() => setRoleFetched(true));
  }, [isSignedIn, user?.id]);

  // Wait for Clerk to finish loading
  if (!authLoaded || !userLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F0E8", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#1a2e35" />
      </View>
    );
  }

  if (!isSignedIn) return <Redirect href="/(auth)/welcome" />;

  // Signed in — wait for role fetch before routing
  if (!roleFetched) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F0E8", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#1a2e35" />
      </View>
    );
  }

  if (role === "driver") return <Redirect href="/(root)/(driver)/dashboard" />;
  return <Redirect href="/(root)/(tabs)/home" />;
};

export default Page;
