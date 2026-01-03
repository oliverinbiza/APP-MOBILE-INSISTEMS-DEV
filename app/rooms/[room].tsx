//importa o asyncstorage para salvar e ler dados localmente no dispositivo
import AsyncStorage from "@react-native-async-storage/async-storage";

//importa o router e o hook para ler parâmetros da rota no expo-router
import { router, useLocalSearchParams } from "expo-router";

//importa o react e os hooks de estado e efeito
import React, { useEffect, useState } from "react";

//importa componentes básicos do react native
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

//componente da tela interna do ambiente
export default function RoomPage() {

  //recupera o parâmetro da rota (nome do ambiente)
  const { room } = useLocalSearchParams();

  //estado que armazena a lista de itens do ambiente
  const [items, setItems] = useState<string[][]>([]);

  //estado para o código do novo item
  const [newCode, setNewCode] = useState("");

  //estado para o nome do novo item
  const [newName, setNewName] = useState("");

  //estado para o tipo do novo item
  const [newType, setNewType] = useState("");

  //executa a leitura dos itens ao carregar a tela
  useEffect(() => {
    loadItems();
  }, []);

  //função para carregar os itens salvos do ambiente
  const loadItems = async () => {

    //lê os itens salvos no asyncstorage usando o nome do ambiente
    const raw = await AsyncStorage.getItem(`items-${room}`);

    //converte o json salvo em array ou define array vazio
    setItems(raw ? JSON.parse(raw) : []);
  };

  //função para adicionar um novo item ao ambiente
  const addItem = async () => {

    //validação simples para campos vazios
    if (!newCode || !newName || !newType) return;

    //cria um novo array adicionando o item atual
    const updated = [...items, [newCode, newName, newType]];

    //salva o array atualizado no asyncstorage
    await AsyncStorage.setItem(`items-${room}`, JSON.stringify(updated));

    //limpa os campos de input
    setNewCode("");
    setNewName("");
    setNewType("");

    //recarrega a lista de itens
    loadItems();
  };

  //função para excluir um item pelo índice
  const deleteItem = async (index: number) => {

    //remove o item selecionado do array
    const updated = items.filter((_, i) => i !== index);

    //salva o array atualizado no asyncstorage
    await AsyncStorage.setItem(`items-${room}`, JSON.stringify(updated));

    //recarrega a lista de itens
    loadItems();
  };

  //renderização da interface da tela
  return (
    //container principal da tela
    <View style={{ flex: 1, backgroundColor: "#F4F4F4", padding: 20 }}>

      {/*título exibindo o nome do ambiente*/}
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        {room}
      </Text>

      {/*card para adicionar um novo item*/}
      <View
        style={{
          backgroundColor: "#FFF",
          padding: 20,
          borderRadius: 0,
          marginBottom: 20,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 4,
        }}
      >

        {/*título do card*/}
        <Text style={{ fontSize: 20, marginBottom: 15, fontWeight: "600" }}>
          Adicionar Item
        </Text>

        {/*campo de input para o código*/}
        <TextInput
          placeholder="Nº de Tombamento"
          value={newCode}
          onChangeText={setNewCode}
          style={{
            backgroundColor: "#EFEFEF",
            padding: 12,
            borderRadius: 0,
            marginBottom: 10,
          }}
        />

        {/*campo de input para o nome*/}
        <TextInput
          placeholder="Nome"
          value={newName}
          onChangeText={setNewName}
          style={{
            backgroundColor: "#EFEFEF",
            padding: 12,
            borderRadius: 0,
            marginBottom: 10,
          }}
        />

        {/*campo de input para o tipo*/}
        <TextInput
          placeholder="Tipo"
          value={newType}
          onChangeText={setNewType}
          style={{
            backgroundColor: "#EFEFEF",
            padding: 12,
            borderRadius: 0,
            marginBottom: 20,
          }}
        />

        {/*botão para salvar o item*/}
        <TouchableOpacity
          style={{
            backgroundColor: "#3A6F78",
            padding: 12,
            borderRadius: 0,
            alignItems: "center",
          }}
          onPress={addItem}
        >
          <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "bold" }}>
            Salvar Item
          </Text>
        </TouchableOpacity>
      </View>

      {/*lista de itens do ambiente*/}
      <ScrollView showsVerticalScrollIndicator={false}>

        {/*mensagem exibida quando não há itens*/}
        {items.length === 0 ? (
          <Text style={{ opacity: 0.5 }}>
            Nenhum item cadastrado ainda.
          </Text>
        ) : (

          //mapeia o array de itens para renderização visual
          items.map((item, index) => (
            <View
              key={index}
              style={{
                backgroundColor: "#FFF",
                padding: 15,
                borderRadius: 0,
                marginBottom: 15,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 3,
              }}
            >

              {/*nome do item*/}
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                {item[1]}
              </Text>

              {/*código do item*/}
              <Text style={{ fontSize: 14 }}>
              Tombamento: {item[0]}
              </Text>

              {/*tipo do item*/}
              <Text style={{ fontSize: 14 }}>
                Tipo: {item[2]}
              </Text>

              {/*botão para excluir o item*/}
              <TouchableOpacity
                style={{
                  backgroundColor: "#D9534F",
                  padding: 10,
                  borderRadius: 0,
                  marginTop: 10,
                  alignItems: "center",
                }}
                onPress={() => deleteItem(index)}
              >
                <Text style={{ color: "#FFF", fontWeight: "bold" }}>
                  Excluir
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/*botão para finalizar o ambiente*/}
        <TouchableOpacity
          style={{
            backgroundColor: "#3A6F78",
            padding: 15,
            borderRadius: 0,
            alignItems: "center",
            marginTop: 20,
            marginBottom: 40,
          }}
          onPress={() => router.push("/rooms")}
        >
          <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "bold" }}>
            Finalizar Sala
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
