import React, { useState, useRef, useCallback } from "react";
import QRcodeSearch from "../QRcodeSearch/QRcodeSearch";
import AddCompetition from "../Competition/AddCompetition";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { DrawerLayout } from 'react-native-gesture-handler';

type NavItem = {
  id: string;
  title: string;
  page: string;
};

const Competition = () => {
  const [selectedPage, setSelectedPage] = useState("QRcodeSearch");
  const drawerRef = useRef<DrawerLayout>(null);

  const NAV_ITEMS: NavItem[] = [
    { id: '1', title: 'QR code', page: 'QRcodeSearch' },
    { id: '2', title: '參加比賽', page: 'Competition' },
  ];

  const handleNavPress = useCallback((page: string) => {
    setSelectedPage(page);
    drawerRef.current?.closeDrawer();
  }, []);

  const renderNavigationDrawer = () => (
    <View style={styles.drawerContainer}>
      <FlatList
        data={NAV_ITEMS}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.navItem,
              selectedPage === item.page && styles.activeItem
            ]}
            onPress={() => handleNavPress(item.page)}
          >
            <Text style={styles.navText}>{item.title}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );

  return (
    <DrawerLayout
      ref={drawerRef}
      drawerWidth={300}
      drawerPosition="right"
      renderNavigationView={renderNavigationDrawer}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => drawerRef.current?.openDrawer()}
        >
          <Text style={styles.menuButtonText}>☰ 開啟菜單</Text>
        </TouchableOpacity>

        {selectedPage === "QRcodeSearch" && <QRcodeSearch />}
        {selectedPage === "Competition" && <AddCompetition />}
      </View>
    </DrawerLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  drawerContainer: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  navItem: {
    padding: 16,
    backgroundColor: '#fff',
  },
  activeItem: {
    backgroundColor: '#e6f4ff',
  },
  navText: {
    fontSize: 16,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
  menuButton: {
    padding: 16,
    backgroundColor: '#007AFF',
  },
  menuButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default Competition;