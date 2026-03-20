import { useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../services/firebase/firebase";
import { getUserDataFromFirestore } from "../services/firebase";
import {
  colors,
  fontSizes,
  fontWeights,
  spacing,
  borderRadius,
  elevation,
} from "../theme";

import HomeScreen from "../screens/home/HomeScreen";
import ToDoScreen from "../screens/todos/ToDoScreen";
import TeachersStackNavigator from "./TeacherStackNavigator";
import NotesStackNavigator from "./NotesStackNavigator";

import CalendarStackNavigator from "./CalendarStackNavigator";
import ProfileScreen from "../screens/profile/ProfileScreen";
import ForumStackNavigator from "./ForumStackNavigator";

export type AppDrawerParamList = {
  Home: undefined;
  ToDo: undefined;
  TeachersStack: undefined;
  NotesStack: undefined;
  CalendarStack: undefined;
  Profile: undefined;
  ForumStack: undefined;
};

const Drawer = createDrawerNavigator<AppDrawerParamList>();

function CustomDrawerContent(props: any) {
  const [profile, setProfile] = useState<{
    name?: string;
    nickname?: string;
    profilePicture?: string;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      const uid = auth.currentUser?.uid;
      if (uid) {
        getUserDataFromFirestore(uid).then((data) => setProfile(data));
      }
    }, [])
  );

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.headerContainer}>
        <View style={styles.headerBackground} />
        <View style={styles.header}>
          {profile?.profilePicture ? (
            <Image
              source={{ uri: profile.profilePicture }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={colors.background} />
            </View>
          )}
          <Text style={styles.username}>
            {profile?.nickname ||
              profile?.name ||
              auth.currentUser?.email?.split("@")[0] ||
              "Kullanıcı"}
          </Text>
          <Text style={styles.email}>{auth.currentUser?.email || ""}</Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>AKADEMİK</Text>
      <DrawerItem
        label="Ana Sayfa"
        icon={({ color, size }) => (
          <Ionicons name="home-outline" size={size} color={color} />
        )}
        onPress={() => props.navigation.navigate("Home")}
        style={styles.drawerItem}
        activeTintColor={colors.primary}
        activeBackgroundColor={colors.primaryLight}
        inactiveTintColor={colors.textSecondary}
        focused={props.state.index === 0}
      />
      <DrawerItem
        label="Hocalar"
        icon={({ color, size }) => (
          <Ionicons name="glasses-outline" size={size} color={color} />
        )}
        onPress={() => props.navigation.navigate("TeachersStack")}
        style={styles.drawerItem}
        activeTintColor={colors.primary}
        activeBackgroundColor={colors.primaryLight}
        inactiveTintColor={colors.textSecondary}
        focused={props.state.routes[props.state.index].name === "TeachersStack"}
      />
      <DrawerItem
        label="Notlar"
        icon={({ color, size }) => (
          <Ionicons name="document-text-outline" size={size} color={color} />
        )}
        onPress={() => props.navigation.navigate("NotesStack")}
        style={styles.drawerItem}
        activeTintColor={colors.primary}
        activeBackgroundColor={colors.primaryLight}
        inactiveTintColor={colors.textSecondary}
        focused={props.state.routes[props.state.index].name === "NotesStack"}
      />
      <DrawerItem
        label="Takvim"
        icon={({ color, size }) => (
          <Ionicons name="calendar-outline" size={size} color={color} />
        )}
        onPress={() => props.navigation.navigate("CalendarStack")}
        style={styles.drawerItem}
        activeTintColor={colors.primary}
        activeBackgroundColor={colors.primaryLight}
        inactiveTintColor={colors.textSecondary}
        focused={props.state.routes[props.state.index].name === "CalendarStack"}
      />

      <Text style={styles.sectionHeader}>DİĞER</Text>
      <DrawerItem
        label="Forum"
        icon={({ color, size }) => (
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={size}
            color={color}
          />
        )}
        onPress={() => props.navigation.navigate("ForumStack")}
        style={styles.drawerItem}
        activeTintColor={colors.primary}
        activeBackgroundColor={colors.primaryLight}
        inactiveTintColor={colors.textSecondary}
        focused={props.state.routes[props.state.index].name === "ForumStack"}
      />
      <DrawerItem
        label="Yapılacaklar"
        icon={({ color, size }) => (
          <Ionicons
            name="checkmark-done-circle-outline"
            size={size}
            color={color}
          />
        )}
        onPress={() => props.navigation.navigate("ToDo")}
        style={styles.drawerItem}
        activeTintColor={colors.primary}
        activeBackgroundColor={colors.primaryLight}
        inactiveTintColor={colors.textSecondary}
        focused={props.state.routes[props.state.index].name === "ToDo"}
      />
      <DrawerItem
        label="Profil"
        icon={({ color, size }) => (
          <Ionicons name="person-outline" size={size} color={color} />
        )}
        onPress={() => props.navigation.navigate("Profile")}
        style={styles.drawerItem}
        activeTintColor={colors.primary}
        activeBackgroundColor={colors.primaryLight}
        inactiveTintColor={colors.textSecondary}
        focused={props.state.routes[props.state.index].name === "Profile"}
      />

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          Alert.alert(
            "Çıkış Yap",
            "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
            [
              { text: "İptal", style: "cancel" },
              {
                text: "Çıkış Yap",
                style: "destructive",
                onPress: () => {
                  auth
                    .signOut()
                    .catch(() => Alert.alert("Hata", "Çıkış yapılamadı"));
                },
              },
            ]
          );
        }}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.backgroundAlt,
          elevation: 0,
          shadowOpacity: 0.1,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: fontWeights.semiBold,
          fontSize: fontSizes.lg,
        },
        drawerActiveTintColor: colors.primary,
        drawerActiveBackgroundColor: colors.primaryLight,
        drawerInactiveTintColor: colors.textSecondary,
        drawerItemStyle: {
          borderRadius: borderRadius.md,
          marginHorizontal: spacing.xs,
        },
        drawerLabelStyle: {
          marginLeft: -spacing.sm,
          fontWeight: fontWeights.medium,
          fontSize: fontSizes.md,
        },
        drawerStyle: {
          width: 280,
          backgroundColor: colors.background,
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Ana Sayfa",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="ToDo"
        component={ToDoScreen}
        options={{
          title: "Yapılacaklar",
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="checkmark-done-circle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="TeachersStack"
        component={TeachersStackNavigator}
        options={{
          title: "Hocalar",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="NotesStack"
        component={NotesStackNavigator}
        options={{
          title: "Notlar",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="CalendarStack"
        component={CalendarStackNavigator}
        options={{
          title: "Takvim",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="ForumStack"
        component={ForumStackNavigator}
        options={{
          title: "Forum",
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profil",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
    zIndex: 0,
  },
  header: {
    padding: spacing.md,
    alignItems: "center",
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    zIndex: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.sm,
    borderWidth: 3,
    borderColor: colors.background,
    ...elevation.lg,
  },
  username: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.background,
    marginBottom: spacing.xxs,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sectionHeader: {
    marginLeft: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.secondary,
    letterSpacing: 1,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    borderWidth: 3,
    borderColor: colors.background,
    ...elevation.md,
  },
  email: {
    fontSize: fontSizes.sm,
    color: colors.background,
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  drawerItem: {
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
    alignSelf: "center",
  },
  logoutText: {
    marginLeft: spacing.sm,
    color: colors.error,
    fontWeight: fontWeights.semiBold,
    fontSize: fontSizes.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
    marginHorizontal: spacing.md,
  },
});
