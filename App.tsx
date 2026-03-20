import React, { useEffect, useState, createContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./src/services/firebase/firebase";
import { getUserDataFromFirestore } from "./src/services/firebase/profileUtils";
import { ProfileRefreshContext } from "./src/context/ProfileRefreshContext";

import AuthStackNavigator from "./src/navigation/AuthStackNavigator";
import AppStackNavigator from "./src/navigation/AppStackNavigator";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const refresh = () => setRefreshFlag((f) => !f);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        setProfileLoaded(false);
        try {
          const profile = await getUserDataFromFirestore(u.uid);
          if (profile?.role && profile?.isProfileCompleted) {
            setIsProfileComplete(true);
          } else {
            setIsProfileComplete(false);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          setIsProfileComplete(false);
        } finally {
          setProfileLoaded(true);
        }
      } else {
        setUser(null);
        setIsProfileComplete(false);
        setProfileLoaded(true);
      }
    });
    return unsubscribe;
  }, [refreshFlag]);

  if (!profileLoaded) return null;

  return (
    <ProfileRefreshContext.Provider value={refresh}>
      <NavigationContainer>
        {!user ? (
          <AuthStackNavigator />
        ) : (
          <AppStackNavigator isProfileComplete={isProfileComplete} />
        )}
      </NavigationContainer>
    </ProfileRefreshContext.Provider>
  );
};

export default App;
