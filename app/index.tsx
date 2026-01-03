//importa componentes de navegação do expo router
import { Link, useRouter } from "expo-router";

//importa react e o hook useState para controle de estado
import React, { useState } from "react";

//importa componentes básicos do react native
import {
  Modal, //componente para criação de popups
  Text, //componente para exibição de texto
  TouchableOpacity, //componente para botões clicáveis
  View, //componente base de layout
} from "react-native";

//componente principal da tela inicial do aplicativo
export default function Home() {

  //estado responsável por controlar a visibilidade do modal de importação
  const [showImportModal, setShowImportModal] = useState(false);

  //hook para navegação programática entre telas
  const router = useRouter();

  //retorno do layout da tela
  return (
    //container principal da tela
    <View
      style={{
        flex: 1, //ocupa toda a tela
        backgroundColor: "#E6F0F2", //cor de fundo
        padding: 20, //espaçamento interno
        justifyContent: "space-between", //distribui conteúdo entre topo e rodapé
      }}
    >
      {/*container do conteúdo principal*/}
      <View>

        {/*título principal da aplicação*/}
        <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 10 }}>
          Maneje o seu inventário
        </Text>

        {/*texto descritivo da tela*/}
        <Text style={{ fontSize: 16, opacity: 0.7, marginBottom: 30 }}>
          Importe listas ou continue uma coleta existente
        </Text>

        {/*botão para importar lista*/}
        <TouchableOpacity
          //abre o modal de importação ao clicar
          onPress={() => setShowImportModal(true)}
          style={{
            backgroundColor: "#4F7C8A", //cor do botão
            padding: 16, //tamanho interno
            borderRadius: 0, //bordas quadradas
            marginBottom: 12, //espaçamento inferior
          }}
        >
          {/*texto do botão importar lista*/}
          <Text style={{ color: "#FFF", textAlign: "center", fontSize: 16 }}>
            Importar Lista
          </Text>
        </TouchableOpacity>

        {/*link para continuar a coleta*/}
        <Link href="/rooms" asChild>
          <TouchableOpacity
            style={{
              backgroundColor: "#FFFFFF",
              padding: 16,
              borderRadius: 0,
              marginBottom: 12,
            }}
          >
            {/*texto do botão continuar coleta*/}
            <Text style={{ textAlign: "center", fontSize: 16 }}>
              Continuar Coleta
            </Text>
          </TouchableOpacity>
        </Link>

        {/*botão de relatórios (funcionalidade futura)*/}
        <TouchableOpacity
          style={{
            backgroundColor: "#D9E4E8",
            padding: 14,
            borderRadius: 0,
            marginBottom: 12,
          }}
        >
          {/*texto do botão relatórios*/}
          <Text style={{ textAlign: "center", fontSize: 16 }}>
            Relatórios
          </Text>
        </TouchableOpacity>

        {/*link para tela de gerenciamento de ambientes*/}
        <Link href="/rooms" asChild>
          <TouchableOpacity
            style={{
              backgroundColor: "#FFFFFF",
              padding: 16,
              borderRadius: 0,
              marginBottom: 12,
            }}
          >
            {/*texto do botão gerenciar ambientes*/}
            <Text style={{ textAlign: "center", fontSize: 16 }}>
              Gerenciar Ambientes
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/*rodapé da aplicação*/}
      <View style={{ alignItems: "center", marginBottom: 10 }}>
        <Text style={{ opacity: 0.5 }}>Inventário • v1.0</Text>
      </View>

      {/*modal de importação de lista*/}
      <Modal
        visible={showImportModal} //controla se o modal está visível
        transparent //permite fundo transparente
        animationType="fade" //animação de entrada
        onRequestClose={() => setShowImportModal(false)} //fecha o modal
      >
        {/*overlay escuro por trás do modal*/}
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          {/*conteúdo principal do modal*/}
          <View
            style={{
              backgroundColor: "#FFF",
              padding: 20,
              borderRadius: 0,
            }}
          >
            {/*botão de fechar o modal (x)*/}
            <TouchableOpacity
              onPress={() => setShowImportModal(false)} //fecha o modal
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                padding: 8,
                zIndex: 10,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>✕</Text>
            </TouchableOpacity>

            {/*título do modal*/}
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              Importar lista
            </Text>

            {/*texto explicativo do modal*/}
            <Text style={{ marginBottom: 20, opacity: 0.7 }}>
              Selecione um arquivo para importar os dados de inventário.
            </Text>

            {/*botão para avançar para a tela de importação*/}
            <TouchableOpacity
              onPress={() => {
                setShowImportModal(false); //fecha o modal
                router.push("/import"); //navega para a tela de importação
              }}
              style={{
                backgroundColor: "#4F7C8A",
                padding: 14,
                borderRadius: 0,
              }}
            >
              {/*texto do botão carregar arquivo*/}
              <Text
                style={{
                  color: "#FFF",
                  textAlign: "center",
                  fontSize: 16,
                }}
              >
                Carregar arquivo
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
