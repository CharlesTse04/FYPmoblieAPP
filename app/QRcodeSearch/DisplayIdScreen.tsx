import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getDatabase, ref, update, onValue, off } from "firebase/database";
import { cong } from "../src/cong";
import LoginId from "../getData/loginId";

export default function DisplayIdScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [notSet, setNotSet] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [competitionData, setCompetitionData] = useState<any>(null);

  const handleAddPoints = async () => {
    try {
      const loginData = await LoginId();
      if (!loginData?.id) {
        throw new Error("用户未登录");
      }

      const db = getDatabase(cong);
      const userRef = ref(db, `competitions/${id}/contestant/${loginData.id}`);
      const currentFraction = competitionData?.fraction || 0;
      const newFraction = currentFraction + 1;

      await update(userRef, { fraction: newFraction });
    } catch (err) {
      return
    }
  };

  useEffect(() => {
    const db = getDatabase(cong);
    if (!id || typeof id !== "string" || id.includes('/')) {
      setNotSet(false);
      setLoading(false);
      Alert.alert("无效的二维码数据");
      return;
    }
    
    const userCompetitionRef = ref(db, `competitions/${id}/contestant`);

    const updateCompetitionStatus = async () => {
      try {
        setLoading(true);
        const loginData = await LoginId();
        if (!loginData?.id) {
          throw new Error("用户未登录");
        }

        const userCompetitionRef = ref(db, `competitions/${id}/contestant/${loginData.id}`);
        
        onValue(userCompetitionRef, (snapshot) => {
          if (!snapshot.exists()) {
            alert("找不到比赛记录");
            setNotSet(false);
            setLoading(false);
            return;
          }

          const competitionData = snapshot.val();
          setCompetitionData(competitionData);
          
          update(userCompetitionRef, { outgoing: true }).then(() => {
            setError(null);
            setLoading(false);
          });
        }, { onlyOnce: false });
      } catch (err) {

        setNotSet(false);
        setLoading(false);
        setError(err instanceof Error ? err.message : "未知错误");
      }
    };

    updateCompetitionStatus();
    
    return () => {
      Alert.alert("已退出比赛");
      off(userCompetitionRef);
      
    };
  }, [id]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "扫描结果",
          headerBackTitle: "返回",
          headerStyle: { backgroundColor: '#F5F5F5' },
          headerTitleStyle: { fontWeight: '700' }
        }}
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>数据更新中...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : notSet ? (
        <>
          <Text style={styles.title}>扫描结果详情</Text>
          <View style={styles.card}>
            <Text style={styles.label}>比赛ID</Text>
            <Text style={[styles.value, styles.highlight]}>{id}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>当前得分</Text>
            <Text style={[styles.value, styles.success]}>{competitionData?.fraction || 0} 分</Text>
          </View>
          <View style={styles.card}>
          <Text style={styles.label}>座位号</Text>
          <Text style={styles.value}>
            {competitionData?.seat || "无座位号"}
          </Text>
        </View>
          <View style={styles.successContainer}>
            <MaterialIcons name="check-circle" size={24} color="#28A745" />
            <Text style={styles.successText}>状态更新成功！</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleAddPoints} disabled={loading}>
            <Text style={styles.buttonText}>+ 加分</Text>
          </TouchableOpacity>
          <Text style={styles.label}>加分说明</Text>
          <Text style={styles.value}>点击按钮为当前比赛加1分</Text>
        </>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ 没有扫描到有效的ID</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 32,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2D3A4B',
  },
  highlight: {
    color: '#007AFF',
  },
  success: {
    color: '#28A745',
  },
  loadingContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  successContainer: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    color: '#28A745',
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  errorText: {
    color: '#DC3545',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});