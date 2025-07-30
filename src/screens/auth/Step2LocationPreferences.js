import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { width } from '../../utils/constent';
import { apiRequest } from '../../utils/api';

const servicesList = [
  'False Ceiling',
  'Modular Kitchen',
  'Painting',
  'Electrical',
  'Furniture',
  'Lighting',
  'Wardrobe',
  'Wallpaper',
  'Plumbing',
  '3D Design'
];

const Step2LocationPreferences = ({ navigation, route }) => {
  const { user } = route.params;
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);

  const handlePincodeBlur = async () => {
    // Optional: Replace with actual API call if needed
    try {
      const res = await apiRequest('GET', `customer/get-city?pincode=${pincode}`);
      if (res?.city) setCity(res.city);
    } catch (err) {
      setCity('');
    }
  };

  const toggleService = (service) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleSubmit = () => {
    // if (!pincode || !city) {
    //   alert('Please enter a valid pincode and city.');
    //   return;
    // }
    // if (selectedServices.length === 0) {
    //   alert('Please select at least one service.');
    //   return;
    // }

    const finalPayload = {
      ...user,
      pincode,
      city,
      services: selectedServices
    };

    // API call here or pass to next screen
    navigation.replace('DashboardScreen', { user: finalPayload });
  };

  return (
    <LinearGradient colors={['#000000', '#000000', '#000000']} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.heading}>Tell Us About Your Space</Text>
          <Text style={styles.subheading}>We’ll personalize recommendations for you.</Text>

          <TextInput
            style={styles.input}
            placeholder="Pincode"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            maxLength={6}
            value={pincode}
            onChangeText={(text) => {
              setPincode(text);
              setCity('');
            }}
            onBlur={handlePincodeBlur}
          />

          <TextInput
            style={[styles.input, { backgroundColor: '#1C2833AA' }]}
            placeholder="City (auto-filled)"
            placeholderTextColor="#aaa"
            value={city}
            editable={false}
          />

          <Text style={styles.label}>Choose Services You're Interested In:</Text>
          <View style={styles.tagsContainer}>
            {servicesList.map(service => (
              <TouchableOpacity
                key={service}
                style={[
                  styles.tag,
                  selectedServices.includes(service) && styles.tagSelected
                ]}
                onPress={() => toggleService(service)}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedServices.includes(service) && styles.tagTextSelected
                  ]}
                >
                  {service}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Finish & Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1C2833',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1C2833',
    margin: 5,
  },
  tagSelected: {
    backgroundColor: '#00E676',
  },
  tagText: {
    color: '#ccc',
    fontSize: 14,
  },
  tagTextSelected: {
    color: '#000',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#00E676',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Step2LocationPreferences;
