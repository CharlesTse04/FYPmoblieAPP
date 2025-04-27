// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AntDesign from '@expo/vector-icons/AntDesign';


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '主頁',
          tabBarIcon: ({ color }) => <IconSymbol name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="userInterface"
        options={{
          title: '用戶',
          tabBarIcon: ({ color }) => <AntDesign name="user" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ShoppingCart"
        options={{
          title: '購物車',
          tabBarIcon: ({ color }) => <AntDesign name="shoppingcart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Competition"
        options={{
          title: '比賽',
          tabBarIcon: ({ color }) => <AntDesign name="Trophy" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}