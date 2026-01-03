//importa o componente link para navegação entre telas usando expo router
import { Link } from "expo-router";

//importa react e o hook usestate para controle de estado
import React, { useState } from "react";

//importa componentes visuais do react native
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

//define o tipo das propriedades esperadas pelo componente roomcard
type RoomCardProps = {
  room: string; //nome do ambiente
  onEdit: (room: string) => void; //função para editar ambiente
  onDelete: (room: string) => void; //função para excluir ambiente
};

//componente visual que representa um card de ambiente
export function RoomCard({ room, onEdit, onDelete }: RoomCardProps) {

  //estado que controla a exibição dos botões de editar e excluir
  const [showOptions, setShowOptions] = useState(false);

  //retorno do layout do card
  return (
    //container principal do card
    <View style={styles.card}>

      {/*cabeçalho do card com nome do ambiente e botão de opções*/}
      <View style={styles.header}>

        {/*exibe o nome do ambiente*/}
        <Text style={styles.roomName}>{room}</Text>

        {/*botão de opções (três pontos)*/}
        <TouchableOpacity onPress={() => setShowOptions(!showOptions)}>
          <Text style={styles.optionsIcon}>•••</Text>
        </TouchableOpacity>

      </View>

      {/*botão para abrir o ambiente*/}
      <Link href={`/rooms/${room}`} asChild>
        <TouchableOpacity style={styles.openButton}>
          <Text style={styles.buttonText}>Abrir Ambiente</Text>
        </TouchableOpacity>
      </Link>

      {/*linha de ações extras exibidas ao clicar nas opções*/}
      {showOptions && (
        <View style={styles.actionsRow}>

          {/*botão para editar o ambiente*/}
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit(room)}
          >
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>

          {/*botão para excluir o ambiente*/}
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(room)}
          >
            <Text style={styles.buttonText}>Excluir</Text>
          </TouchableOpacity>

        </View>
      )}
    </View>
  );
}

//objeto de estilos do componente
const styles = StyleSheet.create({

  //estilo do card principal
  card: {
    backgroundColor: "#fff", //cor de fundo branca
    padding: 15, //espaçamento interno
    borderRadius: 0, //bordas quadradas
    marginBottom: 12, //espaçamento inferior
    elevation: 3, //sombra no android
  },

  //estilo do cabeçalho do card
  header: {
    flexDirection: "row", //itens em linha
    justifyContent: "space-between", //espaço entre nome e opções
    alignItems: "center", //alinhamento vertical
    marginBottom: 10, //espaçamento inferior
  },

  //estilo do texto do nome do ambiente
  roomName: {
    fontSize: 18, //tamanho da fonte
    fontWeight: "bold", //texto em negrito
  },

  //estilo do ícone de opções
  optionsIcon: {
    fontSize: 22, //tamanho do ícone
    color: "#555", //cor do ícone
  },

  //estilo do botão abrir ambiente
  openButton: {
    backgroundColor: "#3A6F78", //cor principal
    padding: 12, //espaçamento interno
    alignItems: "center", //centraliza o texto
  },

  //estilo da linha de botões editar e excluir
  actionsRow: {
    flexDirection: "row", //botões lado a lado
    marginTop: 6, //espaçamento superior
  },

  //estilo base dos botões de ação
  actionButton: {
    flex: 1, //cada botão ocupa metade da largura
    padding: 12, //espaçamento interno
    alignItems: "center", //centraliza o texto
  },

  //estilo específico do botão editar
  editButton: {
    backgroundColor: "#3A6F78", //cor principal
    marginRight: 6, //espaçamento entre os botões
  },

  //estilo específico do botão excluir
  deleteButton: {
    backgroundColor: "#D64545", //cor vermelha para exclusão
  },

  //estilo do texto dos botões
  buttonText: {
    color: "#fff", //texto branco
    fontWeight: "bold", //texto em negrito
  },
});
