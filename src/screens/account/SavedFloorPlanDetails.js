import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../../component/header/NavBar';
import { API_URL } from '@env'; // Ensure you have your API URL set up
import ImageViewerModal from '../../component/imagezoom/ImageViewerModal';

const SavedFloorPlanDetails = ({ route }) => {
  const { planData } = route.params;
  const [imagePreviewModalVisible, setImagePreviewModalVisible] = React.useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState([]);
  const [index, setIndex] = React.useState(0);

  // fallback for local file path vs full URL
  const floorplanImage = planData.floorplan_image?.includes('http')
    ? planData.floorplan_image
    : `https://backend.seeb.in/${planData.floorplan_image}`;

  let finalroomImages = [];
  let elementGroups = [];

  try {
    const parsed = JSON.parse(planData.elements_json);

    finalroomImages = JSON.parse(planData.floor3d_image) || [];

    elementGroups = Object.entries(parsed)
      .filter(([key]) => key !== 'finalroom')
      .map(([title, urls]) => ({ title, urls }));
  } catch (err) {
    console.warn('Invalid elements_json format');
  }


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavBar title={`Saved Plan: ${planData.room_name}`} />
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{planData.room_name}</Text>
        <Text style={styles.meta}>
          Size: {planData.room_size} | Style: {planData.style_name || 'N/A'}
        </Text>
        <Text style={styles.meta}>
          Design Instructions: {planData.name || 'N/A'}
        </Text>
        <Text style={styles.date}>
          Created on: {moment(planData.created_at).format('MMM D, YYYY')}
        </Text>

        <Text style={styles.sectionTitle}>Floor Plan Image</Text>
        <Image
          source={{ uri: floorplanImage }}
          style={styles.floorImage}
          resizeMode="contain"
        />

        <Text style={styles.sectionTitle}>Generated 3D Designs</Text>
        <FlatList
          data={finalroomImages}
          horizontal
          keyExtractor={(item, index) => `img-${index}`}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => {
                setImagePreviewUrl(finalroomImages.map(img => API_URL + img));
                setImagePreviewModalVisible(true);
                setIndex(index);
              }}
            >
              <Image source={{ uri: API_URL + item }} style={styles.generatedImage} />
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
        <Text style={styles.sectionTitle}>Individual Elements</Text>
        {elementGroups.map((group, idx) => (
          <View key={idx} style={{ marginBottom: 20 }}>
            <Text style={styles.elementTitle}>{group.title}</Text>
            <FlatList
              horizontal
              data={group.urls}
              keyExtractor={(url, i) => `${group.title}-${i}`}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => {
                    setImagePreviewUrl(group.urls.map(url => API_URL + url));
                    setImagePreviewModalVisible(true);
                    setIndex(index);
                  }}
                >
                  <Image source={{ uri: API_URL + item }} style={styles.generatedImage} />
                </TouchableOpacity>
              )}
            />
          </View>
        ))}

      </ScrollView>
      <ImageViewerModal
        setIsViewerVisible={setImagePreviewModalVisible}
        isViewerVisible={imagePreviewModalVisible}
        images={imagePreviewUrl.map((url) => ({ url }))}
        index={index}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color:'#000',
  },
  meta: {
    fontSize: 14,
    marginTop: 4,
    color: '#555',
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#111',
  },
  floorImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: '#f3f3f3',
  },
  generatedImage: {
    width: 200,
    height: 140,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
});

export default SavedFloorPlanDetails;
