import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function ContinueCollection() {
  // Estado para armazenar as salas reais
  const [rooms, setRooms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // useFocusEffect: Executa toda vez que a tela ganha foco (quando você volta pra ela)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Carregar as salas salvas
      const savedRooms = await AsyncStorage.getItem("rooms");
      let parsedRooms = savedRooms ? JSON.parse(savedRooms) : [];

      // Lógica de segurança: Garante que "Geral" existe e é a primeira
      if (!parsedRooms.includes("Geral")) {
        parsedRooms = ["Geral", ...parsedRooms];
      } else {
        // Remove Geral de onde estiver e coloca no topo
        parsedRooms = parsedRooms.filter((r: string) => r !== "Geral");
        parsedRooms = ["Geral", ...parsedRooms];
      }

      setRooms(parsedRooms);

      // 2. (Opcional) Atualizar a contagem total de itens importados para o texto de progresso
      const allItemsRaw = await AsyncStorage.getItem("loadItems");
      const allItems = allItemsRaw ? JSON.parse(allItemsRaw) : [];
      setTotalItems(allItems.length);

    } catch (error) {
      console.log("Erro ao carregar salas:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F6F8", padding: 20 }}>
      
      {/* título */}
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        Continuar Coleta
      </Text>

      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Seu Progresso Geral
      </Text>

      {/* barra de progresso (ainda visual, mas agora com número real de itens) */}
      <View style={{ height: 10, backgroundColor: "#DDD", marginBottom: 10, borderRadius: 5 }}>
        <View
          style={{
            width: "20%", // Aqui você futuramente pode calcular a % real de itens conferidos
            height: "100%",
            backgroundColor: "#3A6F78",
            borderRadius: 5
          }}
        />
      </View>

      <Text style={{ marginBottom: 20, opacity: 0.7 }}>
        {totalItems > 0 
          ? `${totalItems} itens totais carregados no sistema.` 
          : "Nenhum item importado ainda."}
      </Text>

      {/* botão comparar itens sem plaqueta */}
      <TouchableOpacity
        onPress={() => router.push("/compare")} 
        style={{
          backgroundColor: "#3A6F78",
          padding: 14,
          alignItems: "center",
          marginBottom: 20,
          borderRadius: 6
        }}
      >
        <Text style={{ color: "#FFF", fontWeight: "bold" }}>
          Comparar itens sem plaqueta
        </Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Ambientes Disponíveis
      </Text>

      {/* LISTA DE AMBIENTES DINÂMICA */}
      {loading ? (
        <ActivityIndicator size="large" color="#3A6F78" />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {rooms.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: 20, opacity: 0.5 }}>
              Nenhum ambiente criado. Vá em "Gerenciar Ambientes" ou importe uma lista.
            </Text>
          ) : (
            rooms.map((env) => (
              <TouchableOpacity
                key={env}
                onPress={() => router.push({ pathname: "/rooms/[room]", params: { room: env } })}
                style={{
                  backgroundColor: "#FFF",
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#CCC",
                  marginBottom: 10,
                  borderRadius: 8,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  elevation: 2
                }}
              >
                <View>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: "#333" }}>{env}</Text>
                  <Text style={{ fontSize: 12, color: "#666" }}>
                    {env === "Geral" ? "Itens pendentes" : "Ambiente de coleta"}
                  </Text>
                </View>

                {/* Seta indicativa simples */}
                <Text style={{color: "#3A6F78", fontWeight: "bold"}}>{">"}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}