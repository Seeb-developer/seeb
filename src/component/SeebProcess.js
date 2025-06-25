import { View, Text, StyleSheet, Image } from 'react-native'
import React from 'react'

const SeebProcess = () => {
    const step = [{
        img: require('../asset/images/Scan-Room.png'),
        title: 'Step 1: Scan Your Room',
        description: 'Use your phone’s LiDAR or upload a floor plan. Seeb auto-detects walls, windows, and measurements. No scanner? Just enter dimensions manually.'
    },
    {
        img: require('../asset/images/Chose-Your-Style.png'),
        title: 'Step 2: Choose Your Style',
        description: 'Pick from 100+ styles like Modern, Boho, Royal, etc. Define furniture, color palette, and materials to reflect your personality.'
    },
    {
        img: require('../asset/images/AI-genrate-design.png'),
        title: 'Step 3: AI Designs Your Space',
        description: 'Seeb’s AI creates 2 photorealistic 3D views per room with full wall and element-wise control to mix-match styles consistently.'
    },
    {
        img: require('../asset/images/review-edit.png'),
        title: 'Step 4: Review + Edit Elements',
        description: 'Tweak individual elements — from beds to curtains — right from the Seeb app. Customize sizes, materials, and styles easily.'
    },
    {
        img: require('../asset/images/Book-team.png'),
        title: 'Step 5: Book Skilled Execution Team',
        description: 'Once you finalize your design, book our verified team for precise factory-finish + on-site services like wall paneling, furniture, and lighting.'
    },
    {
        img: require('../asset/images/Live-Project.png'),
        title: 'Step 6: Live Project Tracker',
        description: 'Track execution progress, team visits, payment milestones, and delivery timelines — all from your phone.'
    },
    {
        img: require('../asset/images/Dream-home.png'),
        title: 'Step 7: Enjoy Your New Space',
        description: 'Experience your dream home with Seeb’s hassle-free execution and expert support. Your satisfaction is our priority!'
    }
    ]
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Step by Step Process</Text>
            <Text style={styles.subText}>India’s first <Text style={{ fontWeight: 'bold', color: 'blue' }}>AI-powered interior execution platform</Text> — combining factory-finish precision with on-site expert services.</Text>
            {step.map((item, index) => (
                <View key={index} style={styles.card}>
                    <Image source={item.img} style={{ width: '100%', height: 110, borderRadius: 10 }} resizeMode='contain' />
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000', textAlign: 'center', marginTop: 10 }}>{item.title}</Text>
                    <Text style={{ fontSize: 16, color: '#333', marginTop: 5, textAlign: 'center' }}>{item.description}</Text>
                </View>
            ))}

        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        marginHorizontal: 10,
        marginVertical: 15,
    },
    text: {
        fontSize: 30,
        color: '#000',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subText: {
        fontSize: 16,
        color: '#000',
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 24,
    },
    card: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    }
})

export default SeebProcess