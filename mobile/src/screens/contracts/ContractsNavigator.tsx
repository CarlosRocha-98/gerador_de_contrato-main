import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ContractsScreen } from "./ContractsScreen";
import { MyContractsScreen } from "./MyContractsScreen";
import { RentalForm } from "./RentalForm";
import { ServiceForm } from "./ServiceForm";

const Stack = createNativeStackNavigator();

export function ContractsNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ContratosHome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="ContratosHome" component={ContractsScreen} />
      <Stack.Screen name="MeusContratos" component={MyContractsScreen} />
      <Stack.Screen name="FormularioAluguel" component={RentalForm} />
      <Stack.Screen name="FormularioServico" component={ServiceForm} />
    </Stack.Navigator>
  );
}
