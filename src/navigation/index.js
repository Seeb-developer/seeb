import { NavigationContainer } from "@react-navigation/native";
import { Image, Platform, TouchableOpacity } from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeMain from "../screens/HomeMain";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FreepikAIImageGenerator from "../screens/FreepikAIImageGenerator";
import MobileNumber from "../screens/auth/MobileNumber";
import OTPVerification from "../screens/auth/OTPVerification";
import NameEmailScreen from "../screens/auth/NameEmailScreen";
import Services from "../screens/Services";
import ServiceDetail from "../screens/ServiceDetail";
import Profile from "../screens/account/Profile";
import { width } from "../utils/constent";
import BookingScreen from "../screens/BookingScreen";
import Cart from "../screens/Cart";
import CheckoutScreen from "../screens/account/CheckoutScreen";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TipsScreen from "../screens/TipsScreen";
import BookingSuccess from "../screens/BookingSuccess";
import Bookings from "../screens/account/Bookings";
import BookingDetails from "../screens/account/BookingDetails";
import OpenAIIntegration from "../screens/OpenAIIntegration";
import DesignDetailsScreen from "../screens/DesignDetailsScreen";
import ProfileSettings from "../screens/account/ProfileSettings";
import PoliciesLegal from "../screens/account/PoliciesLegal";
import SupportContact from "../screens/support/SupportContact";
import RaiseTicket from "../screens/support/RaiseTicket";
import TicketDetails from "../screens/support/TicketDetails";
import ChatTicket from "../screens/support/ChatTicket";
import FloorPlanCanvas from "../screens/floorplan/FloorPlanCanvas";
import FloorPlan from "../screens/floorplan/FloorPlan";
import ElementsDesign from "../screens/floorplan/ElementsDesign";
import GeminiAi from "../screens/floorplan/GeminiAi";
import RoomSelectionScreen from "../screens/RoomSelectionScreen";
import SavedFloorPlans from "../screens/account/SavedFloorPlans";
import SavedFloorPlanDetails from "../screens/account/SavedFloorPlanDetails";
import React from "react";
import BookingSupportReasonScreen from "../screens/support/BookingSupportReasonScreen";
import PreviousTicketsScreen from "../screens/support/PreviousTicketsScreen";
import PreviousBookingsScreen from "../screens/support/PreviousBookingsScreen";
import HelpFAQList from "../screens/support/HelpFAQList";
import ReferAndEarnScreen from "../screens/account/ReferAndEarnScreen";
import Step1PersonalInfo from "../screens/auth/Step1PersonalInfo";
import Step2LocationPreferences from "../screens/auth/Step2LocationPreferences";
import DashboardScreen from "../screens/DashboardScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
export const AppNavigater = (props) => {

    const navigationRef = React.useRef();
    return (
        <NavigationContainer
            ref={navigationRef}
            onReady={() => {
                if (props.onReady) {
                    props.onReady(navigationRef.current);
                }
            }}
        >
            <Stack.Navigator initialRouteName={props.screenName}
                options={{
                    swipeEnabled: false,
                    animationEnabled: false,
                    lazy: true,
                    transitionConfig: () => ({
                        transitionSpec: {
                            duration: 0,
                        },
                    }),
                }}
                screenOptions={{
                    headerShown: false,

                }}>
                <Stack.Screen name="/home" component={HomeTabs} />
                <Stack.Screen name='AIHomeDesign' component={FreepikAIImageGenerator} />
                <Stack.Screen name='Login' component={MobileNumber} />
                <Stack.Screen name='OTPVerification' component={OTPVerification} />
                <Stack.Screen name='NameEmailScreen' component={NameEmailScreen} />
                <Stack.Screen name="Step1PersonalInfo" component={Step1PersonalInfo} />
                <Stack.Screen name="Step2LocationPreferences" component={Step2LocationPreferences} />
                <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
                <Stack.Screen name='BookingScreen' component={BookingScreen} />
                <Stack.Screen name='Services' component={Services} />
                <Stack.Screen name='ServiceDetail' component={ServiceDetail} />
                <Stack.Screen name='CheckoutScreen' component={CheckoutScreen} />
                <Stack.Screen name='BookingSuccess' component={BookingSuccess} />
                <Stack.Screen name='BookingDetails' component={BookingDetails} />
                <Stack.Screen name='OpenAIIntegration' component={OpenAIIntegration} />
                <Stack.Screen name='DesignDetailsScreen' component={DesignDetailsScreen} />
                <Stack.Screen name='ProfileSettings' component={ProfileSettings} />
                <Stack.Screen name='PoliciesLegal' component={PoliciesLegal} />
                <Stack.Screen name='SupportContact' component={SupportContact} />
                <Stack.Screen name="RaiseTicket" component={RaiseTicket} />
                <Stack.Screen name="TicketDetails" component={TicketDetails} />
                <Stack.Screen name="ChatTicket" component={ChatTicket} />
                <Stack.Screen name="FloorPlanCanvas" component={FloorPlanCanvas} />
                <Stack.Screen name="FloorPlan" component={FloorPlan} />
                <Stack.Screen name='ElementsDesign' component={ElementsDesign} />
                <Stack.Screen name='Cart' component={Cart} />
                <Stack.Screen name='GeminiAi' component={GeminiAi} />
                <Stack.Screen name="Bookings" component={Bookings} />
                <Stack.Screen name="SavedFloorPlans" component={SavedFloorPlans} />
                <Stack.Screen name="SavedFloorPlanDetails" component={SavedFloorPlanDetails} />
                <Stack.Screen name="BookingSupportReasonScreen" component={BookingSupportReasonScreen} />
                <Stack.Screen name="PreviousTickets" component={PreviousTicketsScreen} />
                <Stack.Screen name="PreviousBookings" component={PreviousBookingsScreen} />
                <Stack.Screen name="HelpFAQList" component={HelpFAQList} />
                <Stack.Screen name="ReferEarn" component={ReferAndEarnScreen} />

            </Stack.Navigator>
        </NavigationContainer>
    )
}


function HomeTabs({ navigation }) {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginBottom: 5,
                },
                tabBarStyle: {
                    backgroundColor: "#000",
                    height: Platform.OS === 'ios' ? 80 : 70,
                    paddingBottom: Platform.OS === 'ios' ? 10 : 5,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: "#FACC15",
                tabBarInactiveTintColor: "#fff",
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    let IconComponent = Feather;

                    switch (route.name) {
                        case "HomeStack":
                            iconName = "home";
                            break;
                        case "Account":
                            iconName = "user";
                            break;
                        case "Tips":
                            IconComponent = AntDesign;
                            iconName = "appstore-o";
                            break;
                        case "CreateFloorPlan":
                            IconComponent = MaterialCommunityIcons;
                            iconName = "floor-plan";
                            break;
                        case "AIDesign":
                            IconComponent = MaterialCommunityIcons;
                            iconName = "robot";
                            break;
                    }

                    return (
                        <IconComponent
                            name={iconName}
                            size={28}
                            color={focused ? "#FACC15" : "#fff"}
                            style={{ opacity: focused ? 1 : 0.6 }}
                        />
                    );
                },
            })}
        >
            <Tab.Screen name="HomeStack" component={HomeStack} options={{ tabBarLabel: 'Home' }} />
            <Tab.Screen name="Tips" component={TipsScreen} options={{ tabBarLabel: 'Designs' }} />
            <Tab.Screen name="CreateFloorPlan" component={RoomSelectionScreen} options={{ tabBarLabel: 'Floor Plan' }} />
            <Tab.Screen name="AIDesign" component={FreepikAIImageGenerator} options={{ tabBarLabel: 'AI Design' }} />
            <Tab.Screen name="Account" component={Profile} options={{ tabBarLabel: 'Profile' }} />
        </Tab.Navigator>
    );
}

function HomeStack() {
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false
        }}>

            <Stack.Screen name='HomeMain' component={HomeMain} />

        </Stack.Navigator>
    );

}