import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiRequest } from "../../utils/api";

const HelpFAQList = ({ route, navigation }) => {
  const { categoryId, categoryTitle } = route.params;
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchFaqs();
  }, [categoryId]);

  const fetchFaqs = async () => {
    try {
      const response = await apiRequest("GET", `faqs/category/${categoryId}`);
      setFaqs(response?.data || []);
    } catch (err) {
      console.error("Failed to fetch FAQs:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔹 Header */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.header}>{categoryTitle}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 30 }} />
        ) : faqs.length === 0 ? (
          <Text style={styles.emptyText}>No FAQs found in this category.</Text>
        ) : (
          faqs.map((item) => (
            <View key={item.id} style={styles.faqCard}>
              <TouchableOpacity
                style={styles.faqItem}
                onPress={() => toggleExpand(item.id)}
              >
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <MaterialCommunityIcons
                  name={expandedId === item.id ? "chevron-up" : "chevron-down"}
                  size={22}
                />
              </TouchableOpacity>
              {expandedId === item.id && (
                <View style={styles.faqAnswerContainer}>
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpFAQList;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7fb" },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    color: "#333",
    marginRight: 24,
  },
  content: { padding: 20 },
  faqCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  faqItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  faqAnswerContainer: {
    backgroundColor: "#eef5ff",
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#555",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#999",
  },
});
