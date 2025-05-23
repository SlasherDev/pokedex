import { useContext, useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import context from "../../context";

export default function TargetPokemonNextComponant({ targetpokemon }) {
 //console.log("data :", targetpokemon);

  function buildPokemonUrl(id) {
    return `https://tyradex.vercel.app/api/v1/pokemon/${id}`;
  }

  const styles = StyleSheet.create({
          image: {
              borderRadius: 12.5,
              width: 25,
              height: 25
          },
      });

  const [TargetedPokemons, setTargetedPokemons] = useState([]);

  useEffect(() => {
    if (targetpokemon.length > 0) {
      const urls = targetpokemon.map((target) => buildPokemonUrl(target.pokedex_id));
      //console.log("URLs", urls);

      Promise.all(
        urls.map((url) =>
          fetch(url)
            .then((res) => res.json())
            .catch((err) => console.error("Erreur fetch :", err))
        )
      ).then((results) => {
        //console.log("Données des Pokémon récupérées :", results);
        setTargetedPokemons(results);
      });
    }
  }, [targetpokemon]);

  //console.log("TargetedPokemons state :", TargetedPokemons);

  return (
    <View>
      {TargetedPokemons.map((pokemon, key) => {
        const targetData = targetpokemon.find((t) => t.pokedex_id === pokemon.pokedex_id);
        return (
          <View key={key} style={{ alignItems: "center", margin: 10 }}>
            <Text>{pokemon?.name?.fr}</Text>
            <Image
              style={{ width: 100, height: 100 }}
              source={{ uri: pokemon?.sprites?.regular }}
            />
            {targetData && <Text>{targetData.condition}</Text>}
            <View style={{ flexDirection: "row", gap: 20, paddingBottom: 10 }} >
            {pokemon?.types.map((type, typeId) => {
                                return (
                                    <View key={`${pokemon.pokedex_id}-${typeId}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                        <Image
                                            style={styles.image}
                                            source={{ uri: type.image }}
                                            accessibilityLabel={type.name}
                                        />
                                        <Text>{type.name}</Text>
                                    </View>
                                );
                            })}
                            </View>
          </View>
        );
      })}
    </View>
  );
}
