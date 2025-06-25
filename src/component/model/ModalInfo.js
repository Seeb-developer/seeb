import * as React from 'react';
import { Text, View, StyleSheet,TextInput ,TouchableOpacity,Modal} from 'react-native';
import  MaterialIcons  from 'react-native-vector-icons/MaterialIcons'; 
import { width } from '../../utils/constent';

export const ModalInfo = ({modalVisible, setModalVisible})=>{
  return (
     <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={{
           flex: 1,
          justifyContent: "center",
          alignItems: "center",
          
        }}>
          <View
          style={{
            width:200,height:80,backgroundColor:"#fff",borderWidth:2,
            justifyContent:"center",alignItems:"center", padding:2

          }}
          >
            <Text style={{fontSize:width * 0.035, color:'#000'}}>Once Account Deleted it can't be recovered </Text>

             <TouchableOpacity onPress={()=>{setModalVisible(false)}}>
             
                <MaterialIcons name="cancel" size={24} color="black" />
             </TouchableOpacity>

          </View>
        </View>
      </Modal>
  )
}
export default ModalInfo;