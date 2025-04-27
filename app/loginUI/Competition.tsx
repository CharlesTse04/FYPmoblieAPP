import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { cong } from '../src/cong'; // Ensure Firebase config is correct
import Login from '../getData/loginId'; // Ensure path is correct

type Competition = {
  id: string;
  competitionDate: string;
  competitionTime: string;
  endDate: string;
  participants: number;
  price: number;
  prizes?: string[];
  startDate: string;
};

const CompetitionScreen = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const loginData = await Login(); // Await the Promise
      const userId = loginData.id; // Get user ID

      const db = getDatabase(cong);
      const competitionsRef = ref(db, 'competitions');

      const snapshot = await get(competitionsRef);
      if (!snapshot.exists()) {
        setError('目前沒有任何比賽');
        setLoading(false);
        return;
      }

      const data: Record<string, Omit<Competition, 'id'>> = snapshot.val();
      const competitionsArray: Competition[] = [];

      // Fetch competitions and check if user is a contestant
      for (const key of Object.keys(data)) {
        const contestantRef = ref(db, `competitions/${key}/contestant/${userId}`);
        const contestantSnapshot = await get(contestantRef);

        if (contestantSnapshot.exists()) {
          competitionsArray.push({
            id: key,
            ...data[key],
          });
        }
      }

      // Sort competitions by start date
      const sortedCompetitions = competitionsArray.sort((a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      setCompetitions(sortedCompetitions);
    } catch (error) {
      setError('資料取得失敗: ' + (error instanceof Error ? error.message : '未知錯誤'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCompetitions().then(() => setRefreshing(false));
  };

  const getCompetitionStatus = (endDate: string) => {
    const currentDate = new Date();
    const endDateObj = new Date(endDate);
    return currentDate > endDateObj ? '比賽結束' : '進行中';
  };

  const renderItem = ({ item }: { item: Competition }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{item.id.replace('COMPETITION_', '比賽 ')}</Text>
        <Text style={[
          styles.status,
          getCompetitionStatus(item.endDate) === '比賽結束' ? styles.ended : styles.ongoing
        ]}>
          {getCompetitionStatus(item.endDate)}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>比賽日期:</Text>
        <Text style={styles.value}>{item.competitionDate}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>時間:</Text>
        <Text style={styles.value}>{item.competitionTime}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>參賽人數:</Text>
        <Text style={styles.value}>{item.participants}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>報名費:</Text>
        <Text style={styles.value}>${item.price.toLocaleString()}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>報名期間:</Text>
        <Text style={styles.value}>{item.startDate} ~ {item.endDate}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={competitions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>目前沒有任何比賽資訊</Text>
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  ongoing: {
    backgroundColor: '#e6f4ff',
    color: '#1890ff',
  },
  ended: {
    backgroundColor: '#fff1f0',
    color: '#ff4d4f',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
    width: 80,
    marginRight: 8,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default CompetitionScreen;