import React from 'react'
import { View, Text, StyleSheet, Dimensions, Image, Pressable } from "react-native"
import { useNavigation } from '@react-navigation/native'
import FastImage from 'react-native-fast-image'

export const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 1)
export const SLIDER_WIDTH = Dimensions.get('window').width

const CarouselCardItem = ({ item, index, size, radius, height, press }) => {
  const navigation = useNavigation()
  return (
    <View style={{ width: SLIDER_WIDTH - size, height: height }} key={index}>
        {console.log(item)}
      
      {/* <Pressable onPress={() => {
        press()
        // navigation.navigate("/imagezoom")
        }} >
        <FastImage key={index}
          source={{ uri: item }}
          style={[styles.image, { width: SLIDER_WIDTH - size, borderRadius: radius ? 10 : 0, height: height,   }]}
        />
      </Pressable> */}
      {/* <Text style={styles.header}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text> */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    borderRadius: 20,
  },
  
})

export default CarouselCardItem