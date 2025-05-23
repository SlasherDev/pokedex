import { useStorage } from "../utils";
import { Stack } from "expo-router";
import { View} from "react-native";
import { useState } from "react";
import Context from "../context";

export default function Layout() {

    const [filtredPokemon, setFiltredPokemon] = useState([])
    const { storage, setStorage } = useStorage('team', [])
    const { storage: trainer, setStorage: setTrainer } = useStorage('trainer', {
        firstName: '',
        age: '',
        region: '',
        genre: '',
        city: '',
        type: '',
        profilePic:'',
        devise: ''
        
      });

    return (
        <Context.Provider value={{ filtredPokemon, setFiltredPokemon, storage, setStorage, trainer, setTrainer  }}>
            <View style={{ flex: 1 }}>
            <Stack screenOptions={{headerStyle: { backgroundColor: '#CC0000' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold', textTransform: 'capitalize' },
        tabBarShowLabel: false, tabBarActiveBackgroundColor: '#05068955' }}>
            
                    <Stack.Screen name="(home)" options={{ headerShown: false }} />
                    <Stack.Screen name="details" />
                </Stack>
            </View>
        </Context.Provider>
    )
}