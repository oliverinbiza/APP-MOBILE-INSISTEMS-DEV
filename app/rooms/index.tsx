import AsyncStorage from "@react-native-async-storage/async-storage"; //para salvar e ler dados localmente
import { Link } from "expo-router"; //para navegação entre telas
import React, { useEffect, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { RoomCard } from "../../components/RoomCard"; //componente card de ambiente

export default function Home() {
  //estados principais da tela
  const [rooms, setRooms] = useState<string[]>([]); //lista de ambientes
  const [editing, setEditing] = useState<string | null>(null); //ambiente em edição
  const [editValue, setEditValue] = useState(""); //valor da edição
  const [showModal, setShowModal] = useState(false); //controle do modal de novo ambiente
  const [newRoom, setNewRoom] = useState(""); //nome da novo ambiente
  const [addError, setAddError] = useState(""); //mensagem de erro ao adicionar

  //carrega ambientes ao iniciar a tela
  useEffect(() => {
    loadRooms();
  }, []);

  //função para carregar ambientes do AsyncStorage
  const loadRooms = async () => {
    const raw = await AsyncStorage.getItem("rooms");
    setRooms(raw ? JSON.parse(raw) : []);
  };

  //função para adicionar novo ambienete
  const addRoom = async () => {
    const name = newRoom.trim();
    if (!name) return setAddError("O nome do ambiente não pode ser vazio.");
    if (rooms.includes(name)) return setAddError("Esse ambiente já está registrado.");

    const updated = [...rooms, name];
    await AsyncStorage.setItem("rooms", JSON.stringify(updated));
    setNewRoom("");
    setAddError("");
    setShowModal(false);
    loadRooms();
  };

  //função para excluir ambiente com confirmação
  const deleteRoom = async (room: string) => {
    Alert.alert("Apagar Ambiente", `Deseja realmente apagar o ambiente "${room}" e seus itens?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        style: "destructive",
        onPress: async () => {
          const updated = rooms.filter((r) => r !== room);
          await AsyncStorage.setItem("rooms", JSON.stringify(updated));
          await AsyncStorage.removeItem(`items-${room}`);
          loadRooms();
        },
      },
    ]);
  };

  //inicia edição de um ambiente
  const startEditing = (room: string) => {
    setEditing(room);
    setEditValue(room);
  };

  //salva edição do ambiente
  const saveEdit = async () => {
    const newName = editValue.trim();
    if (!newName) return Alert.alert("Erro", "O nome não pode ser vazio.");
    if (rooms.includes(newName) && newName !== editing) return Alert.alert("Erro", "Já existe um ambiente com esse nome.");

    const updatedRooms = rooms.map((r) => (r === editing ? newName : r));
    const rawItems = await AsyncStorage.getItem(`items-${editing}`);
    if (rawItems) {
      await AsyncStorage.setItem(`items-${newName}`, rawItems);
      await AsyncStorage.removeItem(`items-${editing}`);
    }

    await AsyncStorage.setItem("rooms", JSON.stringify(updatedRooms));
    setEditing(null);
    loadRooms();
  };

  return (
    <View style={styles.container}>
      {/*título da tela e botão para adicionar novo ambiente*/}
      <Text style={styles.title}>Ambientes</Text>
      <TouchableOpacity style={styles.primaryButton} onPress={() => setShowModal(true)}>
        <Text style={styles.buttonText}>Novo Ambiente</Text>
      </TouchableOpacity>

      {/*modal para adicionar nova ambiente*/}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setShowModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Ambiente</Text>
            <TextInput
              placeholder="Nome do Ambiente"
              value={newRoom}
              onChangeText={(v) => {
                setNewRoom(v);
                setAddError("");
              }}
              style={styles.input}
            />
            {addError ? <Text style={styles.errorText}>{addError}</Text> : null}

            <TouchableOpacity style={styles.primaryButton} onPress={addRoom}>
              <Text style={styles.buttonText}>Confirmar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.redButton} onPress={() => setShowModal(false)}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/*área de edição de ambiente*/}
<Modal
  visible={!!editing}
  transparent
  animationType="fade"
  onRequestClose={() => setEditing(null)}
>
  <TouchableOpacity
    style={styles.modalOverlay}
    activeOpacity={1}
    onPressOut={() => setEditing(null)}
  >
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Editar Ambiente</Text>

      <TextInput
        value={editValue}
        onChangeText={setEditValue}
        style={styles.input}
      />

      <TouchableOpacity style={styles.primaryButton} onPress={saveEdit}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.redButton} onPress={() => setEditing(null)}>
        <Text style={styles.buttonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
</Modal>

      {/*lista de ambientes*/}
      <ScrollView style={{ flex: 1, marginTop: 20 }}>
        {rooms.map((room, i) => (
          <RoomCard key={i} room={room} onEdit={startEditing} onDelete={deleteRoom} />
        ))}
      </ScrollView>

      {/*botão de configurações*/}
      <View style={{ marginTop: 25 }}>
        <Link href="/settings" asChild>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.buttonText}>Prosseguir</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

//estilos principais da tela
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 0,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 0,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  primaryButton: {
  backgroundColor: "#3A6F78",
  padding: 12,
  borderRadius: 0, //botão quadrado
  alignItems: "center",
  marginVertical: 5,
},

redButton: {
  backgroundColor: "#D64545",
  padding: 12,
  borderRadius: 0, //botão quadrado
  alignItems: "center",
  marginTop: 5,
},

  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelButton: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 0,
    alignItems: "center",
    marginTop: 10,
  },
  /*cancelButtonText: { color: "#333", fontSize: 16 }, */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 0 },
  modalTitle: { fontSize: 20, marginBottom: 10, fontWeight: "bold" },
  errorText: { color: "red", marginBottom: 10 },
});
