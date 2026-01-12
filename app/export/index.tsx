import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Button, Text, View } from "react-native";
import * as XLSX from 'xlsx';


// O StorageAccessFramework foi movido para dentro do /legacy no SDK 52.
// a biblioteca mais moderna para arquivos esta instavel e nao consegui fazer trabalhar com excel satisfatoriamente
// Usamos o @ts-ignore para o TypeScript não reclamar da definição.
// @ts-ignore
import * as FileSystem from 'expo-file-system/legacy';

export default function ExportScreen() {

  // --- 1. FUNÇÃO ORIGINAL (TXT) ---
  const exportTxt = async () => {
    let output = "";
    const rawRooms = await AsyncStorage.getItem("rooms");
    const rooms = rawRooms ? JSON.parse(rawRooms) : [];
  // percorre todas as salas
    for (const room of rooms) {
      output += `${room}\n`;
      const rawItems = await AsyncStorage.getItem(`items-${room}`);
      const items = rawItems ? JSON.parse(rawItems) : [];
      for (const item of items) {
        output += `${item}\n`;
      }
      output += `\n`;
    }
    Alert.alert("TXT Gerado", output);
  };

  // --- 2. AUXILIAR: DATA NO NOME DO ARQUIVO ---
  const getFileNameWithDate = () => {
    // Formata a data e hora atual para o nome do arquivo
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR').replace(/\//g, '-');
    const timeStr = now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}).replace(/:/g, '-');
    //nome do arquivo gerado
    return `Relatorio_${dateStr}_${timeStr}.xlsx`;
  };

 // --- 3. GERAR O CONTEÚDO DO EXCEL (ATUALIZADO) ---
  const generateExcelBase64 = async () => {
    try {
      // Pega todas as salas
      const rawRooms = await AsyncStorage.getItem("rooms");
      const rooms = rawRooms ? JSON.parse(rawRooms) : [];
      // Matriz para armazenar os dados do Excel
      const dadosParaExcel: any[][] = [];
      
      // Conjunto para memorizar o que já achamos
      const tombosEncontrados = new Set<string>();

      // Cabeçalho da planilha
      dadosParaExcel.push(["Tombamento", "Nome", "Status", "Localização"]);

      // --- PARTE 1: ITENS ENCONTRADOS (Status: Presente) ---
      for (const room of rooms) {
        // Pega os itens da sala atual
        const rawItems = await AsyncStorage.getItem(`items-${room}`);
        if (!rawItems) continue;

        const items = JSON.parse(rawItems);
        // Percorre todos os itens da sala
        for (const item of items) {
          let tombamento = "";
          let nome = "";
          let status = "Presente"; // Padrão para itens nessa lista

          // Lógica de Detecção Universal
          if (typeof item === 'object' && item !== null) {
              if (Array.isArray(item)) {
                  tombamento = item[0] ? String(item[0]) : "";
                  nome = item[1] ? String(item[1]) : "";
                  if (item[2]) status = String(item[2]); 
              } else {
                  tombamento = item.tombamento || item.id || item.code || "";
                  nome = item.nome || item.name || item.descricao || "";
                  if (item.status) status = item.status;
              }
          } 
          //tenta interpretar JSON
          else if (typeof item === 'string' && (item.startsWith('[') || item.startsWith('{'))) {
              try {
                  const parsed = JSON.parse(item);
                  if (Array.isArray(parsed)) {
                      tombamento = parsed[0];
                      nome = parsed[1];
                  } else {
                      tombamento = parsed.tombamento || parsed.id;
                      nome = parsed.nome || parsed.name;
                  }
              } catch (e) {
                  tombamento = item;
              }
          }
          else if (typeof item === 'string' && item.includes("-")) {
              const partes = item.split("-");
              tombamento = partes[0].trim();
              nome = partes.slice(1).join("-").trim();
          } 
          else {
              tombamento = String(item);
              nome = "Não identificado";
          }

          const tomboNormalizado = tombamento.trim();
          
          if (tomboNormalizado) {
             tombosEncontrados.add(tomboNormalizado);
          }

          dadosParaExcel.push([
            tombamento,
            nome,
            status,
            room // Aqui vai o nome da sala (Ex: "Sala 1", "Geral" se foi bipado lá)
          ]);
        }
      }

      // --- PARTE 2: ITENS NÃO ENCONTRADOS (Status: Ausente) ---
      const rawLoadItems = await AsyncStorage.getItem("loadItems");
      
      if (rawLoadItems) {
        const loadItems = JSON.parse(rawLoadItems);
        
        for (const itemCarga of loadItems) {
           let tomboCarga = "";
           let nomeCarga = "";

           // Extrai dados da carga original
           if (Array.isArray(itemCarga)) {
               tomboCarga = String(itemCarga[0] || "").trim();
               nomeCarga = String(itemCarga[1] || "").trim();
           }

           // Se NÃO foi encontrado em nenhuma sala (nem na Geral como presente)
           if (tomboCarga && !tombosEncontrados.has(tomboCarga)) {
               dadosParaExcel.push([
                   tomboCarga,
                   nomeCarga,
                   "Ausente", 
                   "Geral" // <--- MUDANÇA AQUI: Define como Geral
               ]);
           }
        }
      }

      if (dadosParaExcel.length <= 1) return null;

      // Gera a planilha
      const ws = XLSX.utils.aoa_to_sheet(dadosParaExcel);

      ws['!cols'] = [
          { wch: 15 }, //estima a largura da coluna
          { wch: 40 }, //estima a largura da coluna
          { wch: 15 }, //estima a largura da coluna
          { wch: 20 } //estima a largura da coluna
      ];

      // Cria o workbook e adiciona a planilha
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventario");

      return XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

    } catch (error) {
      console.error("Erro ao gerar Excel:", error);
      Alert.alert("Erro", "Falha ao processar os dados para o Excel.");
      return null;
    }
  };

  // --- 4. SALVAR NA PASTA ESCOLHIDA (SAF LEGACY) ---
  const saveToFolder = async () => {
    try {
      // Pega o SAF diretamente do FileSystem (que agora é o Legacy)
      const { StorageAccessFramework } = FileSystem;

      // Verificação de segurança extra
      if (!StorageAccessFramework) {
        Alert.alert("Erro Crítico", "A versão Legacy não carregou o StorageAccessFramework. Verifique sua versão do Expo.");
        return;
      }

      const excelData = await generateExcelBase64();
      if (!excelData) {
          Alert.alert("Atenção", "Sem dados para salvar.");
          return;
      }

      // 1. Pede permissão para escolher a pasta
      const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        const fileName = getFileNameWithDate();
        
        // 2. Cria o arquivo na pasta escolhida
        const uri = await StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        // 3. Escreve os dados (Como importamos o Legacy, isso não dará aviso de Deprecated)
        await FileSystem.writeAsStringAsync(uri, excelData, { 
            encoding: 'base64' 
        });
        
        Alert.alert("Sucesso", "Arquivo salvo na pasta escolhida!");
      }

    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Falha ao salvar. Tente novamente.");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 20 }}>Exportar Dados</Text>
      
      <View style={{ marginBottom: 15 }}>
        <Button title="Gerar .TXT (Simples)" onPress={exportTxt} />
      </View>

      <View style={{ marginBottom: 15 }}>
        <Button 
            title="Escolher Pasta e Salvar" 
            onPress={saveToFolder} 
            color="#2e7d32"
        />
      </View>
      
      <Text style={{ marginTop: 20, color: '#666', fontStyle: 'italic' }}>
        Selecione a pasta Destino e confirme no botão azul lá embaixo.
      </Text>
    </View>
  );
}