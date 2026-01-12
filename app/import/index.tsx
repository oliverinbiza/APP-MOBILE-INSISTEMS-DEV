import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as XLSX from 'xlsx';

// --- IMPORTANTE: Mantendo a correção do SDK 52 ---
// @ts-ignore
import * as FileSystem from 'expo-file-system/legacy';

export default function ImportScreen() {
  const { fileUri, fileName } = useLocalSearchParams<{ fileUri: string; fileName: string }>();
  
  const [data, setData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [currentFileName, setCurrentFileName] = useState(fileName || '');

  const router = useRouter();

  // Processamento Automático ao abrir a tela
  useEffect(() => {
    if (fileUri) {
      setTimeout(() => {
        processFile(fileUri, fileName || "Arquivo Importado");
      }, 500);
    }
  }, [fileUri]);

  // --- NOVA FUNÇÃO: LIMPEZA TOTAL ---
  const clearInventory = async () => {
    try {
      // 1. Pega a lista de salas atual para poder apagar os itens de cada uma
      const savedRooms = await AsyncStorage.getItem("rooms");
      const rooms = savedRooms ? JSON.parse(savedRooms) : [];

      // 2. Apaga o inventário de cada sala individualmente
      for (const room of rooms) {
        await AsyncStorage.removeItem(`items-${room}`);
      }

      // 3. Apaga a lista de salas e a carga anterior
      await AsyncStorage.removeItem("rooms");
      await AsyncStorage.removeItem("loadItems");

      console.log("Inventário anterior limpo com sucesso!");
    } catch (e) {
      console.error("Erro ao limpar inventário:", e);
    }
  };

  const processFile = async (uri: string, name: string) => {
    try {
      setLoading(true);
      setCurrentFileName(name);

      let workbook: XLSX.WorkBook;

      // 1. LEITURA DO ARQUIVO
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        workbook = XLSX.read(arrayBuffer, { type: 'array' });
      } else {
        const info = await FileSystem.getInfoAsync(uri);
        if (!info.exists) {
            throw new Error("Arquivo não encontrado no dispositivo.");
        }
        const b64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" });
        workbook = XLSX.read(b64, { type: 'base64' });
      }

      // 2. PROCESSAMENTO DA PLANILHA
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const fullData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        raw: false
      }) as string[][];

      if (!fullData || fullData.length === 0) {
        Alert.alert("Erro", "O arquivo está vazio.");
        setLoading(false);
        return;
      }
      
      // 3. IDENTIFICAÇÃO INTELIGENTE DE COLUNAS
      const limpar = (txt: any) => String(txt || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").trim();
      
      const nomes = ['NOME', 'ITEM', 'DESCRICAO', 'DESCRIÇÃO', 'BEM', 'PRODUTO', 'DENOMINACAO', 'ESPECIFICACAO'];
      const tombos = ['TOMBO', 'TOMBAMENTO', 'PATRIMONIO', 'PATRIMÔNIO', 'CODIGO', 'ID', 'PLAQUETA', 'NUMERO'];

      let idxNome = -1, idxTombo = -1;
      let headerIndex = -1;

      for (let i = 0; i < Math.min(20, fullData.length); i++) {
        const row = fullData[i];
        const tNome = row.findIndex(cell => nomes.includes(limpar(cell)));
        const tTombo = row.findIndex(cell => tombos.includes(limpar(cell)));

        if (tNome !== -1 || tTombo !== -1) {
          if (tNome !== -1) idxNome = tNome;
          if (tTombo !== -1) idxTombo = tTombo;
          
          if (idxNome !== -1 && idxTombo !== -1) {
            headerIndex = i;
            break;
          }
          headerIndex = i;
        }
      }

      if (idxNome === -1 || idxTombo === -1) {
        Alert.alert("Atenção", "Não conseguimos identificar automaticamente as colunas 'Tombo' e 'Nome'. Verifique o cabeçalho do seu Excel.");
        setLoading(false);
        return;
      }

      // 4. EXTRAÇÃO E FORMATAÇÃO DOS DADOS
      const rows = headerIndex !== -1 ? fullData.slice(headerIndex + 1) : fullData;
      
      const formatted = rows
        .filter(row => Array.isArray(row) && row.some(cell => String(cell).trim() !== ''))
        .map(row => [
          String(row[idxTombo] || '').trim(), // Index 0: Tombo
          String(row[idxNome] || '').trim(),  // Index 1: Nome
          "ausente"                           // Index 2: Status Inicial
        ])
        .filter(item => item[0] !== "");

      // LIMPEZA ANTES DE SALVAR
      await clearInventory(); 

      // 5. SALVAMENTO NO BANCO (AsyncStorage)
      setData(formatted);
      await AsyncStorage.setItem("loadItems", JSON.stringify(formatted));

      // Cria apenas a sala Geral
      const initialRooms = ["Geral"];
      await AsyncStorage.setItem("rooms", JSON.stringify(initialRooms));

      Alert.alert(
        "Importação Concluída!", 
        `${formatted.length} itens novos carregados.\n\nTodos os dados anteriores foram removidos.`,
        [
            { 
                text: "Ir para Coleta", 
                onPress: () => router.push("/continue-collection") 
            },
            { text: "Ficar aqui", style: "cancel" }
        ]
      );

    } catch (e: any) {
      console.error(e);
      Alert.alert("Erro na Leitura", "Ocorreu uma falha técnica ao processar o arquivo.");
    } finally {
      setLoading(false);
    }
  };

  const pickNewFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "text/csv"
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        processFile(result.assets[0].uri, result.assets[0].name);
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Importar Inventário</Text>
      <Text style={styles.subtitle}>
        Arquivo: {currentFileName || "..."}
      </Text>

      <TouchableOpacity
        onPress={pickNewFile}
        disabled={loading}
        style={styles.mainButton}
      >
        {loading ? <ActivityIndicator color="#FFF" /> :
          <Text style={styles.buttonText}>📂 Escolher Outro Arquivo</Text>}
      </TouchableOpacity>

      {/* --- NOVO BOTÃO: Só aparece se houver dados carregados --- */}
      {data.length > 0 && !loading && (
        <TouchableOpacity
            onPress={() => router.push("/continue-collection")}
            style={styles.goToCollectionButton}
        >
            <Text style={styles.buttonText}>Ir para Coleta Agora</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={{ marginTop: 20 }}>
        {data.length === 0 ? (
           <Text style={{textAlign: 'center', marginTop: 40, opacity: 0.5}}>
             {loading ? "Processando e limpando dados antigos..." : "Nenhum dado exibido."}
           </Text>
        ) : (
           <View>
             <Text style={{marginBottom: 10, fontWeight: 'bold'}}>Novos Dados ({data.length} itens):</Text>
             {data.slice(0, 50).map((r, i) => (
              <View key={i} style={styles.card}>
                  <Text style={styles.cardTitle}>{r[1]}</Text>
                  <Text style={styles.cardSubtitle}>Tombo: {r[0]}</Text>
                  <Text style={styles.cardSubtitle}>Status Inicial: {r[2]}</Text>
              </View>
             ))}
             {data.length > 50 && <Text style={{textAlign:'center', margin: 10, opacity: 0.5}}>... e mais {data.length - 50} itens.</Text>}
           </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", padding: 20 },
  title: { fontSize: 26, fontWeight: "bold" },
  subtitle: { opacity: 0.5, marginBottom: 15 },
  mainButton: {
    backgroundColor: "#3A6F78", 
    padding: 16,
    alignItems: 'center',
    borderRadius: 8
  },
  // --- ESTILO DO NOVO BOTÃO ---
  goToCollectionButton: {
    backgroundColor: "#3a6f78", 
    padding: 16,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10, // Espaçamento entre os botões
  },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: 'bold' },
  card: {
    padding: 14,
    backgroundColor: "#F5F5F5",
    marginBottom: 10,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#3A6F78'
  },
  cardTitle: { fontWeight: "bold", fontSize: 16, color: '#333' },
  cardSubtitle: { fontSize: 13, opacity: 0.7, color: '#555' }
});