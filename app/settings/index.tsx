import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router } from "expo-router";
import { Alert, Button, StyleSheet, Text, View } from "react-native";

export default function Settings() {

  // Função "Reset de Fábrica"
  const clearAll = async () => {
    Alert.alert(
      "Apagar Tudo", 
      "Tem certeza? Isso apagará TODAS as salas, todos os itens e a lista importada.\n\nO aplicativo voltará ao estado inicial (apenas com a sala Geral vazia).",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, Apagar Tudo", 
          style: "destructive", 
          onPress: async () => {
            try {
              // 1. Apaga tudo que existe no banco
              await AsyncStorage.clear();

              // 2. Recria imediatamente a estrutura básica obrigatória
              // Define que a única sala existente é a "Geral"
              await AsyncStorage.setItem("rooms", JSON.stringify(["Geral"]));
              
              Alert.alert("Pronto!", "O aplicativo foi resetado com sucesso.");
              router.replace("/");
            } catch (e) {
              Alert.alert("Erro", "Falha ao limpar dados.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Configurações
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionText}>Dados</Text>
        
        <Link href="/export" asChild>
          <Button title="Exportar Dados" color="#3A6F78" />
        </Link>
      </View>

      <View style={[styles.section, { borderTopWidth: 1, borderColor: '#ccc', paddingTop: 20 }]}>
        <Text style={[styles.sectionText, {color: '#d64545'}]}>Reiniciar</Text>

        <Button 
          title="Apagar Tudo" 
          color="#d64545" 
          onPress={clearAll} 
        />
        <Text style={styles.warningText}>
          Isso removerá todas as salas e mantém apenas a Geral vazia.
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f4f6f8' 
  },
  title: { 
    fontSize: 26, 
    fontWeight: "bold", 
    marginBottom: 30, 
    color: '#333' 
  },
  section: { 
    marginBottom: 20 
  },
  sectionText: { 
    marginBottom: 10, 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#555' 
  },
  warningText: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  }
});