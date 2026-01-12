//importacoes
import * as DocumentPicker from "expo-document-picker";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

//componente principal
export default function Home2() {
  const { fileUri, fileName } = useLocalSearchParams();
  console.log("Arquivo recebido:", fileUri);
 
  //router para navegacao
  const router = useRouter();

  return (
    
    <View
      style={{
        flex: 1,
        backgroundColor: "#E6F0F2",
        padding: 20,
        justifyContent: "space-between",
      }}
    >
      <View>
        <Text>Arquivo selecionado: {fileName}</Text>
        <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 10 }}>
          Coleta em andamento
        </Text>

        <Text style={{ fontSize: 16, opacity: 0.7, marginBottom: 30 }}>
          Crie ambientes para organizar e transferir dados mais facilmente
        </Text>

        {/*importar lista desativado*/}
        <TouchableOpacity
          disabled
          style={{
            backgroundColor: "#FFF",
            padding: 16,
            marginBottom: 12,
            opacity: 0.6,
            borderWidth: 1,
            borderColor: "#3A6F78",
          }}
        >
          <Text style={{ color: "#3A6F78", textAlign: "center", fontSize: 16 }}>
            Importar Lista
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/continue-collection")}
          style={{
            backgroundColor: "#3A6F78",
            padding: 16,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#FFF", textAlign: "center", fontSize: 16 }}>
            Continuar Coleta
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/reports")}
          style={{
            backgroundColor: "#3A6F78",
            padding: 16,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#FFF", textAlign: "center", fontSize: 16 }}>
            Relatórios
          </Text>
        </TouchableOpacity>

        <Link href="/rooms" asChild>
          <TouchableOpacity
            style={{
              backgroundColor: "#3A6F78",
              padding: 16,
            }}
          >
            <Text style={{ color: "#FFF", textAlign: "center", fontSize: 16 }}>
              Gerenciar Ambientes
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
            <TouchableOpacity
  style={{ backgroundColor: "red", padding: 16, marginBottom: 16 }}
  onPress={async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });
    console.log(result);
  }}
>
  <Text style={{ color: "#FFF", textAlign: "center" }}>TEST PICKER</Text>
</TouchableOpacity>

      <Text style={{ flex: 0.2, opacity: 0.5, textAlign: "center", fontSize: 14 }}>
        
        
        
        INSISTEMS - Inventário Inteligente - v1.0
      </Text>
    </View>
  );
}
