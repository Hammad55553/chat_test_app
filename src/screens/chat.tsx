import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary,ImageLibraryOptions, MediaType } from 'react-native-image-picker';
import IconMa from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get('window');

type Message = {
  id: string;
  text: string;
  isSent: boolean;
  time: string;
  type: 'text' | 'image';
  imageUrl?: string;
};

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi Brother! Not sure if the address is correct for this job.',
      isSent: false,
      time: 'Today 9:30 pm',
      type: 'text'
    },
    {
      id: '2',
      text: 'Let me check but I think we had it right',
      isSent: true,
      time: '',
      type: 'text'
    },
    {
      id: '3',
      text: 'Just confirmed and yes it is incorrect. Julie, can you please change it since you are the boss?',
      isSent: false,
      time: '',
      type: 'text'
    },
    {
      id: '4',
      text: 'Yep, I will get that done now',
      isSent: true,
      time: '',
      type: 'text'
    },
    {
      id: '5',
      text: 'Thank you and talk soon!',
      isSent: false,
      time: '',
      type: 'text'
    },
    {
      id: '6',
      text: '',
      isSent: true,
      time: 'Today 9:35 pm',
      type: 'image',
      imageUrl: 'https://www.aradon.ro/wp-content/uploads/2025/03/+otf/650x435/qkzCXzS9VbXOJkfGxS7KXk5PVF9WRVJZX1NFQ48YukjF6qy8CsyfGYYxL1lX9Bhm80Gg__YtXgqVZPVVI/1961745cartedeidentitate.jpg'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const navigation = useNavigation();

  const handleback = () => {
    navigation.navigate('Home'as never);
  };
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      isSent: true,
      time: currentTime,
      type: 'text'
    };

    setMessages([...messages, message]);
    setNewMessage('');
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendImage = async () => {
    try {
        const options: ImageLibraryOptions = {
            mediaType: 'photo' as MediaType,  // or 'video' if you need video
            quality: 0.5,  // Numeric quality (0 = low, 1 = high)
            includeBase64: false,  // Set to true if you want base64 encoding
          };

      const result = await launchImageLibrary(options);
      
      if (result.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to pick image');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const message: Message = {
          id: Date.now().toString(),
          text: '',
          isSent: true,
          time: currentTime,
          type: 'image',
          imageUrl: asset.uri || ''
        };

        setMessages([...messages, message]);
        
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error(error);
    }
  };

  const openImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        {/* Header with black background */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}
           onPress={handleback}>
            
            <IconMa name="chevron-left" size={30} color="#fff" />
          </TouchableOpacity>
          
          <Image
            source={{ uri: 'https://i.pravatar.cc/300' }}
            style={styles.userAvatar}
          />
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Anna Paul</Text>
            <Text style={styles.userStatus}>Active 15 min ago</Text>
          </View>
        </View>
        
        {/* Chat messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatArea} 
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View 
              key={message.id} 
              style={[
                styles.message, 
                message.isSent ? styles.sentMessage : styles.receivedMessage
              ]}
            >
              {message.type === 'image' ? (
                <>
                  <TouchableOpacity 
                    activeOpacity={0.8}
                    onPress={() => message.imageUrl && openImagePreview(message.imageUrl)}
                  >
                    <Image
                      source={{ uri: message.imageUrl }}
                      style={styles.messageImage}
                    />
                  </TouchableOpacity>
                  {message.time && <Text style={styles.messageTime}>{message.time}</Text>}
                </>
              ) : (
                <>
                  <Text style={[
                    styles.messageText,
                    message.isSent && styles.sentMessageText
                  ]}>
                    {message.text}
                  </Text>
                  {message.time && <Text style={styles.messageTime}>{message.time}</Text>}
                </>
              )}
            </View>
          ))}
        </ScrollView>
        
        {/* Message input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.inputContainer}>
            <TouchableOpacity 
              style={styles.attachmentButton}
              onPress={handleSendImage}
            >
              <IconMa
  name="attach-file"
  size={30}
  color="#004aad"
  style={{
    transform: [
      { rotate: '45deg' }, // Rotate slightly up and left
      { translateY: -2 },   // Optional: move it slightly up
      { translateX: -1 },   // Optional: move it slightly to the left
    ],
  }}
/>
            </TouchableOpacity>
            
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputField}
                placeholder="Start typing a message..."
                placeholderTextColor="#999"
                value={newMessage}
                onChangeText={setNewMessage}
                onSubmitEditing={handleSendMessage}
                multiline
              />
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={handleSendMessage}
              >
                <Icon name="send" size={20}
  color="#fff"
  style={{
    transform: [
      { rotate: '-45deg' }, // Rotate slightly up and left
      { translateY: 1 },   // Optional: move it slightly up
      { translateX: 2 },   // Optional: move it slightly to the left
    ],
  }}  />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.phiButton}
            >
              <Text style={styles.phiButtonText}>PHI</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Full-screen image preview modal */}
      <Modal
        visible={!!previewImage}
        transparent={true}
        onRequestClose={closeImagePreview}
      >
        <TouchableWithoutFeedback onPress={closeImagePreview}>
          <View style={styles.modalContainer}>
            <Image
              source={{ uri: previewImage || '' }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={closeImagePreview}
            >
              <Icon name="close" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    marginRight: 15,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  userStatus: {
    fontSize: 14,
    color: '#aaa',
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatContent: {
    padding: 15,
  },
  message: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    borderColor: '#7099d1',
    borderBottomLeftRadius: 0,
    borderWidth: 1,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#f8f8f8',
    borderBottomRightRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  sentMessageText: {
    color: '#3d3d3d',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  attachmentButton: {
    padding: 8,
    marginRight: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingRight: 8,
    minHeight: 40,
    maxHeight: 100,
  },
  inputField: {
    flex: 1,
    maxHeight: 100,
    paddingLeft: 15,
    paddingVertical: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#004aad',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phiButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    height: 35,
    borderRadius: 15,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phiButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: height,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
  },
});

export default ChatScreen;