import React, { useContext, useState, useEffect } from "react";
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import context from "../../context";
import { useRouter } from "expo-router";
import { notify } from "../../utils";
import { Picker } from "@react-native-picker/picker";

export default function filter() {

    const styles = StyleSheet.create({
        buttonContainer: {
            width: "80%",
        },
        buttonStyle: {
            margin: 16,
        },
    });
    const router = useRouter();
    const { filtredPokemon, setFiltredPokemon } = useContext(context)

    //filter
    const [pokeForm, setpokeForm] = useState({
        generation: 'all',
        type1: 'all', type2: 'all',
        hpSign: 'max', hpNbr: '',
        attSign: 'max', attNbr: '',
        defSign: 'max', defNbr: '',
        attSpeSign: 'max', attSpeNbr: '',
        defSpeSign: 'max', defSpeNbr: '',
        speedSign: 'max', speedNbr: ''
    })

    const generationInt = parseInt(pokeForm.generation, 10);
    const hpNbrInt = parseInt(pokeForm.hpNbr, 10);
    const attNbrInt = parseInt(pokeForm.attNbr, 10);
    const defNbrInt = parseInt(pokeForm.defNbr, 10);
    const attSpeNbrInt = parseInt(pokeForm.attSpeNbr, 10);
    const defSpeNbrInt = parseInt(pokeForm.defSpeNbr, 10);
    const speedNbrInt = parseInt(pokeForm.speedNbr, 10);
    const updatedPokeForm = { ...pokeForm, generation: generationInt, hpNbr: hpNbrInt, attNbr: attNbrInt, defNbr: defNbrInt, attSpeNbr: attSpeNbrInt, defSpeNbr: defSpeNbrInt, speedNbr: speedNbrInt };




    const [pokemons, setPokemons] = useState([])
    useEffect(() => {
        fetch('https://tyradex.vercel.app/api/v1/pokemon')
            .then(res => res.json())
            .then(data => {
                data.shift(); // Remove the first element
                setPokemons(data);
            })
            .catch(console.error)
    }, [])

    const [types, setTypes] = useState([]);
    useEffect(() => {
        fetch("https://tyradex.vercel.app/api/v1/types")
            .then(res => res.json())
            .then(data => setTypes(data.map(type => type.name.fr)))
            .catch(console.error)
    }, [])

    const [generations, setGenerations] = useState([])
    useEffect(() => {
        fetch("https://tyradex.vercel.app/api/v1/gen")
            .then(res => res.json())
            .then(data => setGenerations(data.map(generation => generation.generation)))
            .catch(console.error)
    }, [])

    const handleChange = (key, value) => {
        setpokeForm((prevState) => ({ ...prevState, [key]: value }));
    };

    const handleReset = () => {
        const defaultFilter = {
            generation: 'all',
            type1: 'all', type2: 'all',
            hpSign: 'max', hpNbr: '',
            attSign: 'max', attNbr: '',
            defSign: 'max', defNbr: '',
            attSpeSign: 'max', attSpeNbr: '',
            defSpeSign: 'max', defSpeNbr: '',
            speedSign: 'max', speedNbr: ''
        };
        setpokeForm(defaultFilter);
        setFiltredPokemon(pokemons);
        router.push('/');
    }
    const handlesubmit = (e) => {
        let filtered = pokemons;

        if (updatedPokeForm.generation) {
            filtered = filtered.filter(pokemon => pokemon.generation === updatedPokeForm.generation);
        }

        // Filter by type1 if selected
        if (updatedPokeForm.type1 && updatedPokeForm.type1 !== 'all') {
            filtered = filtered.filter(pokemon =>
                pokemon.types.some(type => type.name === updatedPokeForm.type1)
            );
        }

        // Filter by type2 if selected
        if (updatedPokeForm.type2 !== undefined) {
            if (updatedPokeForm.type2 === 'none') {
                // Filter for Pokémon with exactly one type
                filtered = filtered.filter(pokemon => pokemon.types.length === 1);
            } else if (updatedPokeForm.type2 !== 'all') {
                // Filter for Pokémon with a specific second type
                filtered = filtered.filter(pokemon => {
                    if (pokemon.types.length > 1) {
                        return pokemon.types.some(type => type.name === updatedPokeForm.type2);
                    } else {
                        return false; // Exclude Pokémon with only one type
                    }
                });
            }
        }
        const filterByStat = (statKey, sign, value) => {
            if (value && sign) {
                const parsedValue = parseInt(value, 10);
                switch (sign) {
                    case 'max':
                        return pokemon => pokemon.stats[statKey] > parsedValue;
                    case 'min':
                        return pokemon => pokemon.stats[statKey] < parsedValue;
                    case 'egal':
                        return pokemon => pokemon.stats[statKey] === parsedValue;
                    case 'egalMax':
                        return pokemon => pokemon.stats[statKey] >= parsedValue;
                    case 'egalMin':
                        return pokemon => pokemon.stats[statKey] <= parsedValue;
                    default:
                        return () => true;
                }
            }
            return () => true;
        };

        filtered = filtered.filter(pokemon =>
            filterByStat('hp', updatedPokeForm.hpSign, updatedPokeForm.hpNbr)(pokemon) &&
            filterByStat('atk', updatedPokeForm.attSign, updatedPokeForm.attNbr)(pokemon) &&
            filterByStat('def', updatedPokeForm.defSign, updatedPokeForm.defNbr)(pokemon) &&
            filterByStat('spe_atk', updatedPokeForm.attSpeSign, updatedPokeForm.attSpeNbr)(pokemon) &&
            filterByStat('spe_def', updatedPokeForm.defSpeSign, updatedPokeForm.defSpeNbr)(pokemon) &&
            filterByStat('vit', updatedPokeForm.speedSign, updatedPokeForm.speedNbr)(pokemon)
        );

        // Now filtered contains Pokémon filtered by both type1 and type2 conditions
        setFiltredPokemon(filtered);
        router.push('/');

    }

    return (
        <ScrollView>
            <View style={{ flex: 1, marginTop: 16, marginBottom: 16, alignItems: "center" }}>
                <Text style={{ fontWeight: 'bold' }}>Générations</Text>
                <Picker
                    style={{ width: 300, marginBottom: 16 }}
                    selectedValue={pokeForm.generation}
                    onValueChange={(value) => handleChange('generation', value)}>
                    <Picker.Item label="Toutes les générations" value="all" />
                    {generations.map((genNbr, index) => (
                        <Picker.Item
                            key={index}
                            label={`Génération ${genNbr}`}
                            value={genNbr}
                        />
                    ))}
                </Picker>

                <Text style={{ fontWeight: 'bold' }}>Type 1</Text>
                <Picker
                    style={{ width: 300, marginBottom: 16 }}
                    selectedValue={pokeForm.type1}
                    onValueChange={(value) => handleChange('type1', value)}
                >
                    <Picker.Item label="Tout les types" value="all" />
                    {types.map((typeName, index) => (
                        <Picker.Item
                            key={index}
                            label={typeName}
                            value={typeName}
                        />
                    ))}
                </Picker>

                <Text style={{ fontWeight: 'bold' }}>Type 2</Text>
                <Picker
                    style={{ width: 300, marginBottom: 16 }}
                    selectedValue={pokeForm.type2}
                    disabled={pokeForm.type1 === "all"}
                    onValueChange={(value) => handleChange('type2', value)}>
                    <Picker.Item label="Tout les types" value="all" />
                    <Picker.Item label="pas de second type" value="none" />
                    {types.map((typeName, index) => (
                        <Picker.Item
                            key={index}
                            label={typeName}
                            value={typeName}
                        />
                    ))}
                </Picker>
                <Text style={{ fontWeight: 'bold' }}>HP</Text>
                <View style={{ alignItems: "center", flexDirection: 'row', gap: 5 }}>
                    <Picker
                        style={{ width: 100, marginBottom: 16 }}
                        selectedValue={pokeForm.hpSign}
                        onValueChange={(value) => handleChange('hpSign', value)}
                    >
                        <Picker.Item label=">" value="max" />
                        <Picker.Item label="<" value="min" />
                        <Picker.Item label="=" value="egal" />
                        <Picker.Item label=">=" value="egalMax" />
                        <Picker.Item label="<=" value="egalMin" />
                    </Picker>
                    <TextInput inputMode="numeric" style={{ width: 195, height: 25, backgroundColor: 'white', borderColor: 'black', borderWidth: 1 }}
                        value={pokeForm.hpNbr}
                        onChangeText={(value) => handleChange('hpNbr', value)}
                    />
                </View>
                <Text style={{ fontWeight: 'bold' }}>Attaque</Text>
                <View style={{ alignItems: "center", flexDirection: 'row', gap: 5 }}>
                    <Picker
                        style={{ width: 100, marginBottom: 16 }}
                        selectedValue={pokeForm.attSign}
                        onValueChange={(value) => handleChange('attSign', value)}
                    >
                        <Picker.Item label=">" value="max" />
                        <Picker.Item label="<" value="min" />
                        <Picker.Item label="=" value="egal" />
                        <Picker.Item label=">=" value="egalMax" />
                        <Picker.Item label="<=" value="egalMin" />
                    </Picker>
                    <TextInput inputMode="numeric" style={{ width: 195, height: 25, backgroundColor: 'white', borderColor: 'black', borderWidth: 1 }}
                        value={pokeForm.attNbr}
                        onChangeText={(value) => handleChange('attNbr', value)}
                    />
                </View>
                <Text style={{ fontWeight: 'bold' }}>Defense</Text>
                <View style={{ alignItems: "center", flexDirection: 'row', gap: 5 }}>
                    <Picker
                        style={{ width: 100, marginBottom: 16 }}
                        selectedValue={pokeForm.defSign}
                        onValueChange={(value) => handleChange('defSign', value)}
                    >
                        <Picker.Item label=">" value="max" />
                        <Picker.Item label="<" value="min" />
                        <Picker.Item label="=" value="egal" />
                        <Picker.Item label=">=" value="egalMax" />
                        <Picker.Item label="<=" value="egalMin" />
                    </Picker>
                    <TextInput inputMode="numeric" style={{ width: 195, height: 25, backgroundColor: 'white', borderColor: 'black', borderWidth: 1 }}
                        value={pokeForm.defNbr}
                        onChangeText={(value) => handleChange('defNbr', value)}
                    />
                </View>
                <Text style={{ fontWeight: 'bold' }}>Attaque Speciale</Text>
                <View style={{ alignItems: "center", flexDirection: 'row', gap: 5 }}>
                    <Picker
                        style={{ width: 100, marginBottom: 16 }}
                        selectedValue={pokeForm.attSpeSign}
                        onValueChange={(value) => handleChange('attSpeSign', value)}
                    >
                        <Picker.Item label=">" value="max" />
                        <Picker.Item label="<" value="min" />
                        <Picker.Item label="=" value="egal" />
                        <Picker.Item label=">=" value="egalMax" />
                        <Picker.Item label="<=" value="egalMin" />
                    </Picker>
                    <TextInput inputMode="numeric" style={{ width: 195, height: 25, backgroundColor: 'white', borderColor: 'black', borderWidth: 1 }}
                        value={pokeForm.attSpeNbr}
                        onChangeText={(value) => handleChange('attSpeNbr', value)}
                    />
                </View>
                <Text style={{ fontWeight: 'bold' }}>Defense Speciale</Text>
                <View style={{ alignItems: "center", flexDirection: 'row', gap: 5 }}>
                    <Picker
                        style={{ width: 100, marginBottom: 16 }}
                        selectedValue={pokeForm.defSpeSign}
                        onValueChange={(value) => handleChange('defSpeSign', value)}
                    >
                        <Picker.Item label=">" value="max" />
                        <Picker.Item label="<" value="min" />
                        <Picker.Item label="=" value="egal" />
                        <Picker.Item label=">=" value="egalMax" />
                        <Picker.Item label="<=" value="egalMin" />
                    </Picker>
                    <TextInput inputMode="numeric" style={{ width: 195, height: 25, backgroundColor: 'white', borderColor: 'black', borderWidth: 1 }}
                        value={pokeForm.defSpeNbr}
                        onChangeText={(value) => handleChange('defSpeNbr', value)}
                    />
                </View>
                <Text style={{ fontWeight: 'bold' }}>Vitesse</Text>
                <View style={{ alignItems: "center", flexDirection: 'row', gap: 5 }}>
                    <Picker
                        style={{ width: 100, marginBottom: 16 }}
                        selectedValue={pokeForm.speedSign}
                        onValueChange={(value) => handleChange('speedSign', value)}
                    >
                        <Picker.Item label=">" value="max" />
                        <Picker.Item label="<" value="min" />
                        <Picker.Item label="=" value="egal" />
                        <Picker.Item label=">=" value="egalMax" />
                        <Picker.Item label="<=" value="egalMin" />
                    </Picker>
                    <TextInput inputMode="numeric" style={{ width: 195, height: 25, backgroundColor: 'white', borderColor: 'black', borderWidth: 1 }}
                        value={pokeForm.speedNbr}
                        onChangeText={(value) => handleChange('speedNbr', value)} />
                </View>
                <View style={styles.buttonContainer}>
                    <View style={styles.buttonStyle}>
                        <Button onPress={handlesubmit} color="#CC0000" title="Go !" />
                    </View>
                </View>
                <View style={styles.buttonContainer}>
                    <View style={styles.buttonStyle}>
                        <Button color={"blue"} title="Reinitialiser le filtre" onPress={handleReset} />
                    </View>
                </View>
            </View>
        </ScrollView>
    );

}
