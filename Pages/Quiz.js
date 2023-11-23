// import { Button, Center,FlatList,Image } from "native-base";
// import React, { useEffect, useState } from "react";
// import {View,Text,StyleSheet,TextInput,textStyle, TouchableOpacity, Dimensions} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeBaseProvider,  VStack} from "native-base";
// import Sound from 'react-native-sound';
// const {height,width}=Dimensions.addEventListener
import {useNavigation} from "@react-navigation/native";
import {Phoneno} from "./TakeAssess";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import { useEffect } from 'react';
import React, {useRef, useState} from 'react';
import {englishData} from './EnglishQuestions';
import QuestionItem from './QuestionItem';
const {height, width} = Dimensions.get('window');
const App = ({route}) => {
  const serverIP = "http://192.168.254.55:3001/";
  const [currentIndex, setCurrentIndex] = useState(1);
  // const [questions, setQuestions] = useState(englishData);
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1; // Months are zero-indexed, so add 1
  const year = currentDate.getFullYear();
  // Creating a formatted date string
  const currDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;

  const uid=route.params.uid;
  const listRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [data,setData]=useState([]);
  // const [marks,getmarks]=useState(0);
  const getData = async() => {
       
            fetch(serverIP + 'assess')
            .then(response => response.json())
            .then(results => {setData(results);console.log("results = ",results);});
        }
        useEffect(() => {
          console.log("render",uid)
            getData();
        },[])

  const OnSelectOption = (index, x) => {
    console.log("index=",index);
    console.log("x=",x);
    const tempData = data;
    console.log("temp=",temp);
    tempData.map((item, ind) => {
      if (index == ind) {
        if (item.marked !== -1) {
          item.marked = -1;
        } else {
          item.marked = x;
        }
      }
    });
    let temp = [];
    tempData.map(item => {
      temp.push(item);
    });
    setData(temp);
  };
  const getTextScore = () => {
    let marks = 0;
    data.map(item => {
      if (item.marked !== -1) {
        if(item.marked==item.correct_option){
        marks = marks + 5;
        }
      }
    });
    // getmarks(marks);
    return marks;
  };
  const onSubmit=async()=>{
    console.log("fun=",1);
    fetch("http://192.168.254.55:3001/Quiz", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        score:getTextScore(),
        patientid:uid,
        submitDate:currDate,
      })
    }).then(response => response.json())
      .then(json=>console.log(json))
      .catch(error => console.error(error))
      setModalVisible(true);
  }

  const reset = () => {
    const tempData = data;
    tempData.map((item, ind) => {
      item.marked = -1;
    });
    let temp = [];
    tempData.map(item => {
      temp.push(item);
    });
    setData(temp);
  };
  return (
    <View style={{flex: 1}}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 20,
        }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '600',

            marginLeft: 20,
            color: '#000',
          }}>
          Total Questions:{' ' + currentIndex + '/' + data.length}
        </Text>
        <Text
          style={{
            marginRight: 20,
            fontSize: 20,
            fontWeight: '600',
            color: 'black',
          }}
          onPress={() => {
            reset();
            listRef.current.scrollToIndex({animated: true, index: 0});
          }}>
          Reset
        </Text>
      </View>
      <View style={{marginTop: 10}}>
        <FlatList
          ref={listRef}
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          horizontal
          onScroll={e => {
            const x = e.nativeEvent.contentOffset.x / width + 1;
            setCurrentIndex(x.toFixed(0));
          }}
          data={data}
          renderItem={({item, index}) => {
            return (
              <QuestionItem
                data={item}
                selectedOption={x => {
                  OnSelectOption(index, x);
                }}
              />
            );
          }}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'absolute',
          bottom: 50,
          width: '100%',
        }}>
        <TouchableOpacity
          style={{
            backgroundColor: currentIndex > 1 ? 'purple' : 'gray',
            height: 50,
            width: 100,
            borderRadius: 10,
            marginLeft: 20,
            marginBottom:-20,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            console.log(parseInt(currentIndex) - 1);
            if (currentIndex > 1) {
              listRef.current.scrollToIndex({
                animated: true,
                index: parseInt(currentIndex) - 2,
              });
            }
          }}>
          <Text style={{color: '#fff'}}>Previous</Text>
        </TouchableOpacity>
        {currentIndex == data.length ? (
          <TouchableOpacity
            style={{
              backgroundColor: 'green',
              height: 50,
              width: 100,
              borderRadius: 10,
              marginBottom:-20,
              marginRight: 20,
  
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              setModalVisible(true)
              console.log("score=",getTextScore());
            }}>
            <Text style={{color: '#fff'}} onPress={onSubmit}>Submit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: 'purple',
              height: 50,
              width: 100,
              borderRadius: 10,
              marginRight: 20,
              marginBottom:-20,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              console.log(currentIndex);
              if (data[currentIndex - 1].marked !== -1) {
                if (currentIndex < data.length) {
                  listRef.current.scrollToIndex({
                    animated: true,
                    index: currentIndex,
                  });
                }
              }
            }}>
            <Text style={{color: '#fff'}}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              backgroundColor: '#fff',
              width: '90%',
              borderRadius: 10,
            }}>
            <Text
              style={{
                fontSize: 30,
                fontWeight: '800',
                alignSelf: 'center',
                marginTop: 20,
                color:"black"
              }}>
               Score
            </Text>
            <Text
              style={{
                fontSize: 40,
                fontWeight: '800',
                alignSelf: 'center',
                marginTop: 20,
                color: 'green',
              }}>
              {getTextScore()}{'/'+data.length*5}
            </Text>
            <TouchableOpacity
              style={{
                alignSelf: 'center',
                height: 40,
                padding: 10,
                borderWidth: 1,
                borderRadius: 10,
                marginTop: 20,
                marginBottom: 20,
              }}
              onPress={() => {
                setModalVisible(!modalVisible);
              }}>
              <Text style={{color:"green"}}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
export default App;
