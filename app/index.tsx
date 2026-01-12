//importacoes principais
import * as DocumentPicker from "expo-document-picker";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
//componente principal
export default function Home() {
  //controle do modal de importacao
  const [showImportModal, setShowImportModal] = useState(false);

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
        <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 10 }}>
          Inicie a sua coleta
        </Text>

        <Text style={{ fontSize: 16, opacity: 0.7, marginBottom: 30 }}>
          Importe o arquivo da lista de demandas para iniciar o seu inventário
        </Text>

        {/*importar lista ativo*/}
        <TouchableOpacity
          onPress={() => setShowImportModal(true)}
          style={{
            backgroundColor: "#3A6F78",
            padding: 16,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#FFF", textAlign: "center", fontSize: 16 }}>
            Importar Lista
          </Text>
        </TouchableOpacity>

        {/*continuar coleta desativado*/}
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
            Continuar Coleta
          </Text>
        </TouchableOpacity>

        {/*relatorios desativado*/}
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
            Relatórios
          </Text>
        </TouchableOpacity>

        {/*gerenciar ambientes ativo*/}
        <Link href="/rooms" asChild>
          <TouchableOpacity
            style={{
              backgroundColor: "#3A6F78",
              padding: 16,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: "#FFF", textAlign: "center", fontSize: 16 }}>
              Gerenciar Ambientes
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      <Text style={{ flex: 0.2, opacity: 0.5, textAlign: "center", fontSize: 14 }}>
        INSISTEMS - Inventário Inteligente - v1.0
      </Text>

      {/*modal de importacao*/}
      <Modal
        visible={showImportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImportModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#FFF",
              padding: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowImportModal(false)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                padding: 8,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>✕</Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
              Importar Lista
            </Text>

            <Text style={{ marginBottom: 20, opacity: 0.7 }}>
              Selecione um arquivo para importar os dados de inventário.
            </Text>

            <TouchableOpacity
              onPress={async () => {
  setShowImportModal(false);

  const result = await DocumentPicker.getDocumentAsync({
   type: [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/vnd.oasis.opendocument.spreadsheet"
],
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    console.log("Usuário cancelou o picker");
    return;
  }

  console.log("Arquivo selecionado:", result.assets[0].uri);

  // Aqui vai pra tela home2
  router.push({
    pathname: "/import",
    params: {
      fileUri: result.assets[0].uri,
      fileName: result.assets[0].name,
    },
  });
}}

              style={{
                backgroundColor: "#3A6F78",
                padding: 14,
              }}
            >
              <Text style={{ color: "#FFF", textAlign: "center", fontSize: 16 }}>
                Carregar Arquivo
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
