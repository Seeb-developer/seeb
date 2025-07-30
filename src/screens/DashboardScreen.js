import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { width } from '../utils/constent';

const DashboardScreen = ({ navigation }) => {
  return (
    <LinearGradient colors={['#000000', '#000000']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Welcome to Seeb 👋</Text>
        <Text style={styles.subheading}>What would you like to do today?</Text>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('FloorPlan')}
          >
            <Icon name="floor-plan" size={28} color="#00E676" />
            <Text style={styles.cardText}>Create Floor Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('UploadRoom')}
          >
            <Icon name="image-plus" size={28} color="#00E676" />
            <Text style={styles.cardText}>Upload Room Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('QuoteRequest')}
          >
            <Icon name="currency-inr" size={28} color="#00E676" />
            <Text style={styles.cardText}>Request a Quote</Text>
          </TouchableOpacity>
        </View>

        {/* Featured */}
        <Text style={styles.sectionTitle}>Explore Designs</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Image source={require('../asset/interior.jpeg')} style={styles.featuredImage} />
          <Image source={require('../asset/interior.jpeg')} style={styles.featuredImage} />
          <Image source={require('../asset/interior.jpeg')} style={styles.featuredImage} />
        </ScrollView>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Support')}> 
          <Text style={styles.buttonText}>Need Help? Contact Support</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subheading: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 20,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: width / 2.4,
    backgroundColor: '#1C2833',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  cardText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  featuredImage: {
    width: width * 0.6,
    height: width * 0.4,
    borderRadius: 10,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#00E676',
    padding: 14,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000'
  }
});

export default DashboardScreen; 
