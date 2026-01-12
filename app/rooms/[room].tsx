import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function RoomPage() {
  const { room } = useLocalSearchParams<{ room: string }>();
  
  const [items, setItems] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);

  // Estados de controle de UI
  const [expandedindex, setExpandedindex] = useState<number | null>(null);
  const [showmanual, setShowmanual] = useState(false);

  // Campos do novo item
  const [newcode, setNewcode] = useState("");
  const [newname, setNewname] = useState("");
  const [newtype, setNewtype] = useState("");

  // Recarrega sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [room])
  );

  const loadItems = async () => {
    setLoading(true);
    try {
      // 1. Carregar lista mestra (Importada)
      const masterListRaw = await AsyncStorage.getItem("loadItems");
      const masterList: string[][] = masterListRaw ? JSON.parse(masterListRaw) : [];

      // 2. Carregar itens salvos NESTA sala
      const currentRoomItemsRaw = await AsyncStorage.getItem(`items-${room}`);
      const currentRoomItems: string[][] = currentRoomItemsRaw ? JSON.parse(currentRoomItemsRaw) : [];

      // Mapa para acesso rápido
      const currentRoomMap = new Map();
      currentRoomItems.forEach(item => currentRoomMap.set(String(item[0]).trim(), item));

      if (room === "Geral") {
        // --- LÓGICA HÍBRIDA DO GERAL ---
        
        // A. Descobrir o que está em OUTRAS salas para esconder
        const roomsListRaw = await AsyncStorage.getItem("rooms");
        const roomsList: string[] = roomsListRaw ? JSON.parse(roomsListRaw) : [];
        const assignedElsewhere = new Set<string>();

        for (const r of roomsList) {
          if (r === "Geral") continue;
          const rItemsRaw = await AsyncStorage.getItem(`items-${r}`);
          const rItems: string[][] = rItemsRaw ? JSON.parse(rItemsRaw) : [];
          rItems.forEach(i => assignedElsewhere.add(String(i[0]).trim()));
        }

        // B. Montar a lista de exibição
        let displayList: string[][] = [];

        // 1. Itens da lista geral(que não estão em outras salas)
        masterList.forEach(masterItem => {
          const tombo = String(masterItem[0]).trim();

          if (assignedElsewhere.has(tombo)) return;

          if (currentRoomMap.has(tombo)) {
            displayList.push(currentRoomMap.get(tombo)); 
          } else {
            displayList.push(masterItem);
          }
        });

        // 2. Itens MANUAIS (extras)
        currentRoomItems.forEach(localItem => {
          const tombo = String(localItem[0]).trim();
          const existsInMaster = masterList.some(m => String(m[0]).trim() === tombo);
          if (!existsInMaster) {
            displayList.push(localItem);
          }
        });

        // Ordenar: Presentes primeiro
        displayList.sort((a, b) => {
            if ((a[2] === "presente" || a[2] === "manual") && b[2] === "ausente") return -1;
            if (a[2] === "ausente" && (b[2] === "presente" || b[2] === "manual")) return 1;
            return 0;
        });

        setItems(displayList);

      } else {
        // --- LÓGICA PADRÃO (Salas Comuns) ---
        setItems(currentRoomItems);
      }

    } catch (error) {
      console.error("Erro ao carregar itens", error);
    } finally {
      setLoading(false);
    }
  };

 // ... dentro de app/rooms/[room].tsx

  const addItem = async () => {
    // Validação básica
    if (!newcode) return Alert.alert("Erro", "O código do tombamento/indentificador é obrigatório");

    const codeToSearch = String(newcode).trim().toUpperCase(); // Normaliza para evitar erros de caixa

    // 1. Carrega a Lista Mestra (Importada)
    const masterListRaw = await AsyncStorage.getItem("loadItems");
    const masterList: string[][] = masterListRaw ? JSON.parse(masterListRaw) : [];
    
    // 2. Tenta encontrar o item na lista original
    const foundItem = masterList.find(i => String(i[0]).trim().toUpperCase() === codeToSearch);
    
    // --- MUDANÇA AQUI: TRAVA DE SEGURANÇA ---
    if (!foundItem) {
      Alert.alert(
        "Item Não Identificado", 
        `O tombamento "${newcode}" não existe na lista importada.`
      );
      setNewcode(""); // Limpa o campo para tentar outro
      return; // PARA TUDO AQUI. Não adiciona nada.
    }
    // ----------------------------------------

    // Se chegou aqui, o item EXISTE. Vamos marcá-lo como PRESENTE.
    const itemToSave = [foundItem[0], foundItem[1], "presente"];

    // 3. Verificação de Duplicidade em OUTRAS salas (Apenas se estivermos no Geral)
    // Se  estiver no Geral, não queremos adicionar algo que já está guardado na Sala 01
    if (room === "Geral") {
        const roomsListRaw = await AsyncStorage.getItem("rooms");
        const roomsList: string[] = roomsListRaw ? JSON.parse(roomsListRaw) : [];
        
        for (const r of roomsList) {
            if (r === "Geral") continue;
            
            const rItemsRaw = await AsyncStorage.getItem(`items-${r}`);
            const rItems: string[][] = rItemsRaw ? JSON.parse(rItemsRaw) : [];
            
            // Verifica se o item já está nessa outra sala
            if (rItems.some(i => String(i[0]).trim().toUpperCase() === codeToSearch)) {
                Alert.alert("Atenção", `Este item já foi conferido e está guardado na ${r}.`);
                setNewcode("");
                return; 
            }
        }
    }

    // 4. Carrega itens JÁ SALVOS NESTA SALA ATUAL
    const currentStoredRaw = await AsyncStorage.getItem(`items-${room}`);
    const currentStored: string[][] = currentStoredRaw ? JSON.parse(currentStoredRaw) : [];

    // 5. Verifica se já bipamos este item NESTA sala
    if(currentStored.some(i => String(i[0]).trim().toUpperCase() === codeToSearch)) {
      Alert.alert("Já Conferido", `O item "${foundItem[1]}" já está marcado como presente nesta lista.`);
      setNewcode(""); 
      return;
    }
    
    // 6. TUDO CERTO: Salva no topo da lista
    const updated = [itemToSave, ...currentStored];
    await AsyncStorage.setItem(`items-${room}`, JSON.stringify(updated));
    
    // Feedback visual (opcional: Vibrate)
    // Alert.alert("Sucesso", `${foundItem[1]} marcado como presente!`); 
    
    // Limpa campos e recarrega a tela
    setNewcode("");
    setNewname(""); // Não é mais usado, mas limpamos por garantia
    setNewtype("");
    setShowmanual(false);
    loadItems(); 
  };

  const deleteItem = async (index: number) => {
    const itemToDelete = items[index];
    const tomboToDelete = String(itemToDelete[0]).trim();

    const currentStoredRaw = await AsyncStorage.getItem(`items-${room}`);
    let currentStored: string[][] = currentStoredRaw ? JSON.parse(currentStoredRaw) : [];

    const updated = currentStored.filter(i => String(i[0]).trim() !== tomboToDelete);
    
    await AsyncStorage.setItem(`items-${room}`, JSON.stringify(updated));
    setExpandedindex(null);
    loadItems();
  };

  // Contagem de progresso
  const verifiedCount = items.filter(i => i[2] === 'presente' || i[2] === 'manual').length;

  // ... (o código anterior de imports e funções addItem/loadItems continua igual)

  // SUBSTITUA A PARTIR DAQUI (O RETURN DO COMPONENTE):
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
         <Text style={{width: 20}}></Text> 
         <Text style={styles.headerTitle}>{room}</Text>
         <View style={{width: 20}} /> 
      </View>

      <Text style={styles.sectionTitle}>Seu progresso</Text>

      {/* BARRA DE PROGRESSO */}
      <View style={styles.progressBar}>
        <View style={{
            ...styles.progressFill, 
            width: items.length > 0 ? `${(verifiedCount / items.length) * 100}%` : "0%"
        }} />
      </View>

      <Text style={styles.progressText}>
        {verifiedCount} itens já foram verificados neste ambiente
      </Text>

      {/* BOTÕES DE AÇÃO */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowmanual(!showmanual)}
        >
          <Ionicons name="create-outline" size={50} color="#fff" />
          <Text style={styles.actionText}>Novo item</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="camera-outline" size={50} color="#fff" />
          <Text style={styles.actionText}>Novo item</Text>
        </TouchableOpacity>
      </View>

      {/* FORMULÁRIO MANUAL */}
      {showmanual && (
        <View style={styles.card}>
          <TextInput
            placeholder="Tombamento ou Id"
            value={newcode}
            onChangeText={setNewcode}
            style={styles.input}
            autoCapitalize="characters"
          />
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.saveButton} onPress={addItem}>
              <Text style={styles.saveText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowmanual(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ÁREA DA LISTA (OCUPA O ESPAÇO DO MEIO) */}
      <View style={{ flex: 1, marginBottom: 10 }}> 
        {loading ? (
          <ActivityIndicator size="large" color="#3a6f78" style={{marginTop: 20}} />
        ) : (
          <ScrollView contentContainerStyle={{paddingBottom: 20}}>
            {items.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum item cadastrado ainda</Text>
            ) : (
              items.map((item, index) => {
                const expanded = expandedindex === index;
                const isPresent = item[2] === 'presente' || item[2] === 'manual';
                
                return (
                  <View key={index} style={[styles.itemCard, isPresent && {borderColor: '#3a6f78', borderLeftWidth: 5}]}>
                    <TouchableOpacity
                      style={styles.itemRow}
                      onPress={() => setExpandedindex(expanded ? null : index)}
                    >
                      {/* Nome do Item com quebra de linha */}
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={styles.itemTitle}>{item[1]}</Text>
                      </View>
                      
                      <View style={[styles.arrowButton, {backgroundColor: isPresent ? "#3a6f78" : "#aaa"}]}>
                        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color="#fff" />
                      </View>
                    </TouchableOpacity>

                    {expanded && (
                      <View style={styles.itemDetails}>
                        <Text style={styles.detailText}>Tombamento: {item[0]}</Text>
                        <Text style={styles.detailText}>Status: {String(item[2]).toUpperCase()}</Text>

                        {isPresent && (
                           <TouchableOpacity style={styles.deleteButton} onPress={() => deleteItem(index)}>
                             <Text style={styles.deleteText}>Excluir</Text>
                           </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </View>

      {/* BOTÃO FIXO NO RODAPÉ (FORA DO SCROLLVIEW) */}
      {!loading && (
        <TouchableOpacity
          style={styles.finishButton}
          onPress={() => router.push("/rooms")}
        >
          <Text style={styles.finishText}>Finalizar sala</Text>
        </TouchableOpacity>
      )}

    </View>
  );
}

// ATUALIZE TAMBÉM OS ESTILOS PARA GARANTIR O VISUAL
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8", padding: 20 }, // Flex 1 aqui é essencial
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  sectionTitle: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  progressBar: { height: 10, backgroundColor: "#ddd", marginBottom: 10 },
  progressFill: { height: "100%", backgroundColor: "#3a6f78" },
  progressText: { marginBottom: 20 },
  
  actionRow: { flexDirection: "row", marginBottom: 20 },
  actionButton: { flex: 1, backgroundColor: "#3a6f78", marginHorizontal: 5, padding: 14, alignItems: "center" },
  actionText: { color: "#fff", marginTop: 5, fontSize: 12, textAlign: "center" },

  card: { backgroundColor: "#fff", padding: 15, borderWidth: 1, borderColor: "#ccc", marginBottom: 20 },
  input: { backgroundColor: "#eee", padding: 12, marginBottom: 10 },
  formActions: { flexDirection: "row", justifyContent: "space-between" },
  saveButton: { backgroundColor: "#3a6f78", padding: 12, flex: 1, marginRight: 5, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "bold" },
  cancelButton: { backgroundColor: "#d64545", padding: 12, flex: 1, marginLeft: 5, alignItems: "center" },
  cancelText: { fontWeight: "bold", color: "#FFF" },

  itemCard: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#cbd5dc", marginBottom: 10 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14 },
  itemTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  arrowButton: { width: 32, height: 32, borderWidth: 1, borderColor: "#fff", backgroundColor: "#3a6f78", justifyContent: "center", alignItems: "center" },
  itemDetails: { borderTopWidth: 1, borderColor: "#eee", padding: 14 },
  detailText: { fontSize: 14, color: "#555", marginBottom: 6 },
  deleteButton: { backgroundColor: "#d64545", padding: 10, alignItems: "center", marginTop: 10 },
  deleteText: { color: "#fff", fontWeight: "bold" },
  emptyText: { opacity: 0.5, marginBottom: 20 },

  // Estilo do botão de finalizar ajustado
  finishButton: { 
    backgroundColor: "#3a6f78", 
    padding: 15, 
    alignItems: "center", 
    marginTop: 0, // Removido margem superior excessiva
    marginBottom: 0 // Removido margem inferior excessiva pois o padding do container já cuida disso
  },
  finishText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
});