import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ListingsScreen from "../screens/ListingsScreen";
import ListingDetailsScreen from "../screens/ListingDetailsScreen";
import WeddingCardScreen from "../screens/WeddingCardScreen";
import StampScreen from "../screens/StampScreen";

const Stack = createStackNavigator();

const FeedNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StampScreen" component={StampScreen} />
    <Stack.Screen name="WeddingCardScreen" component={WeddingCardScreen} />
  </Stack.Navigator>
);

export default FeedNavigator;
