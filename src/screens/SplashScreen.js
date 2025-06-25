import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={styles.gradient} />

      {/* Multiple Waves */}
      <Svg height={height} width={width} style={styles.waves}>
        {/* First Wave */}
        <Path
          fill="#1b2735"
          d={`M0,${height * 0.2} Q${width / 2},${height * 0.1} ${width},${height * 0.2} L${width},${height} L0,${height} Z`}
          opacity="0.6"
        />
        {/* Second Wave */}
        <Path
          fill="#17202A"
          d={`M0,${height * 0.4} Q${width / 2},${height * 0.3} ${width},${height * 0.4} L${width},${height} L0,${height} Z`}
          opacity="0.7"
        />
        {/* Third Wave */}
        <Path
          fill="#0e1117"
          d={`M0,${height * 0.6} Q${width / 2},${height * 0.5} ${width},${height * 0.6} L${width},${height} L0,${height} Z`}
          opacity="0.8"
        />
      </Svg>

      {/* Logo & Text */}
      <View style={styles.logoContainer}>
        <Image source={require('../asset/logofull.png')} style={styles.logo} resizeMode='contain' />
        <Text style={styles.title}>Welcome to Seeb</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0e1117', // Fallback background
  },
  gradient: {
    ...StyleSheet.absoluteFillObject, // Covers the whole screen
  },
  waves: {
    position: 'absolute',
    bottom: 0,
  },
  logoContainer: {
    alignItems: 'center',
    position: 'absolute',
    marginVertical:10
    // top: '40%',
  },
  logo: {
    width: '100%',
    height: width,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default SplashScreen;
