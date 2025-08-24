import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Animated,
  Modal,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import IconFA from 'react-native-vector-icons/FontAwesome';
import { BlurView } from '@react-native-community/blur';
import IconMa from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from "@react-navigation/native";


interface MessageItem {
  id: string;
  name: string;
  message: string;
  time: string;
  isGroup: boolean;
  avatar?: string | null;
  showInvitePopup?: boolean;
  showBAAPopup?: boolean;
}

const mockMessages: MessageItem[] = [
  { 
    id: '1', 
    name: 'Hammad Aslam', 
    message: 'Hi developer, how are you doing?', 
    time: '1 hour ago', 
    isGroup: false, 
    avatar: 'https://hammadaslam.asperinfotech.com/assets/img/hammad%20pic.jpg',
    showBAAPopup: true 
  },
  { id: '6', name: 'Tabish Bin Tahir', message: 'Hi Tabish, how are you doing?', time: '1 hour ago', isGroup: false },
  { id: '2', name: 'Anna', message: 'Hi Tabish, how are you doing?', time: '1 hour ago', isGroup: false },
  { id: '3', name: 'Group name', message: 'Anna: Hi Hammad, how are you doing?', time: '1 hour ago', isGroup: true },
  { id: '4', name: 'Group name', message: 'Tabish: Hi Hammad, how are you doing?', time: '1 hour ago', isGroup: true },
  { 
    id: '5', 
    name: 'Ali Hassan', 
    message: 'Hi Hammad, how are you doing?', 
    time: '1 hour ago', 
    isGroup: false, 
    avatar: 'https://i.pravatar.cc/150?img=12',
    showInvitePopup: true 
  },
];

const ChatHomeScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'All' | 'Groups' | 'Unread'>('All');
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [showBAAPopup, setShowBAAPopup] = useState(false);
  const [email, setEmail] = useState('');
  const currentOpenSwipeable = useRef<Swipeable | null>(null);
  const swipeableRefs = useRef<{[key: string]: Swipeable | null}>({});
  const navigation = useNavigation();

  const handleChat = () => {
    navigation.navigate('Chat'as never);
  };
  const filteredMessages = mockMessages.filter((msg) => {
    let matchesTab = true;
    if (selectedTab === 'Groups') matchesTab = msg.isGroup;
    
    const matchesSearch = searchText === '' || 
      msg.name.toLowerCase().includes(searchText.toLowerCase()) || 
      msg.message.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
    
    return (
      <TouchableOpacity 
        style={styles.rightAction}
        onPress={() => {
          console.log('More pressed');
          currentOpenSwipeable.current?.close();
          currentOpenSwipeable.current = null;
        }}
        activeOpacity={0.6}
      >
        <Animated.View style={[styles.actionContent, { transform: [{ scale }] }]}>
          <View style={styles.dotsContainer}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <Text style={styles.actionText}>More</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: MessageItem }) => {
    return (
      <Swipeable
        ref={(ref) => {
          swipeableRefs.current[item.id] = ref;
        }}
        onSwipeableWillOpen={() => {
          if (currentOpenSwipeable.current && currentOpenSwipeable.current !== swipeableRefs.current[item.id]) {
            currentOpenSwipeable.current.close();
          }
          currentOpenSwipeable.current = swipeableRefs.current[item.id];
        }}
        renderRightActions={renderRightActions}
        rightThreshold={40}
        friction={2}
      >
        <TouchableOpacity 
          style={styles.messageRow} 
          activeOpacity={0.7}
          onPress={() => {
            if (item.showInvitePopup) {
              setShowInvitePopup(true);
            } else if (item.showBAAPopup) {
              setShowBAAPopup(true);
            } else {
              // Navigate to chat screen with the item data
              navigation.navigate('Chat' as never, 
              );
            }
            
            if (currentOpenSwipeable.current) {
              currentOpenSwipeable.current.close();
              currentOpenSwipeable.current = null;
            }
          }}
        >
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={item.isGroup ? styles.groupAvatar : styles.defaultAvatar}>
              {item.isGroup ? (
                <View style={styles.groupIconContainer}>
                  <Icon name="people" size={25} color="#71839b" />
                  <View style={styles.groupMemberIndicator}>
                    <Image 
                      source={{ uri: 'https://hammadaslam.asperinfotech.com/assets/img/hammad%20pic.jpg' }} 
                      style={styles.groupMemberImage}
                    />
                  </View>
                </View>
              ) : (
                <Icon name="person" size={25} color="#71839b" />
              )}
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.message}>{item.message}</Text>
          </View>
          <Text style={[styles.time, { color: '#0057D9' }]}>{item.time}</Text>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  

  const handleAcceptBAA = () => {
    console.log('BAA accepted');
    setShowBAAPopup(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* Top Navigation */}
        <View style={styles.topNav}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.iconCircle}>
              <Icon name="menu" size={30} color="#71839b" />
            </TouchableOpacity>
            <Text style={styles.header}>Home</Text>
          </View>
          <View style={styles.iconsRight}>
            <View style={styles.iconWithLabel}>
              <TouchableOpacity style={styles.iconCircle}>
                <Image source={require('../assets/images/group.png')} style={styles.image} />
              </TouchableOpacity>
              <Text style={styles.iconLabel}>Groups</Text>
            </View>
            <View style={styles.iconWithLabel}>
              <TouchableOpacity style={styles.iconCircle}>
                <IconMa name="contacts" size={25} color="#71839b" />
              </TouchableOpacity>
              <Text style={styles.iconLabel}>Contacts</Text>
            </View>
            <View style={styles.iconWithLabel}>
              <TouchableOpacity style={styles.iconCircle}>
                <IconFA name="gear" size={28} color="#71839b" />
              </TouchableOpacity>
              <Text style={styles.iconLabel}>Settings</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={25} color="#888" />
          <TextInput 
            placeholder="Search here" 
            style={styles.search} 
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              setIsSearching(text.length > 0);
            }}
          />
          {isSearching && (
            <TouchableOpacity 
              style={styles.searchIconCircle}
              onPress={() => {
                setSearchText('');
                setIsSearching(false);
              }}
            >
              <Icon name="close" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['All', 'Groups', 'Unread'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                selectedTab === tab && styles.tabActive
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={selectedTab === tab ? styles.tabTextActive : styles.tabText}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Messages */}
        <FlatList
          data={filteredMessages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages found</Text>
            </View>
          }
        />

        {/* Send New Message Button */}
        <TouchableOpacity style={styles.fab}>
          <Icon name="add" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Invite Popup Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showInvitePopup}
          onRequestClose={() => setShowInvitePopup(false)}
        >
          <View style={styles.popupOverlay}>
            <BlurView
              style={styles.absolute}
              blurType="dark"
              blurAmount={10}
              reducedTransparencyFallbackColor="rgba(60, 60, 60, 0.5)"
            />
            <Pressable 
              style={styles.popupBackground}
              onPress={() => setShowInvitePopup(false)}
            >
              <View style={styles.popupContainer}>
                <Text style={styles.popupTitle}>
                  Invite your organization administrator to sign up
                </Text>
                
                <TextInput
                  style={styles.emailInput}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus={true}
                />
                
                <TouchableOpacity 
                  style={styles.inviteButton}
                >
                  <Text style={styles.inviteButtonText}>Invite</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </View>
        </Modal>

        {/* BAA Agreement Popup Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showBAAPopup}
          onRequestClose={() => setShowBAAPopup(false)}
        >
          <View style={styles.popupOverlay}>
            <BlurView
              style={styles.absolute}
              blurType="dark"
              blurAmount={10}
              reducedTransparencyFallbackColor="rgba(60, 60, 60, 0.5)"
            />
            <Pressable 
              style={styles.popupBackground}
              onPress={() => setShowBAAPopup(false)}
            >
              <View style={styles.popupContainer}>
                <Text style={styles.popupTitle}>
                  Hammad Aslam wants to send you information that may include confidential patient information.
                </Text>
                
                <Text style={styles.baaText}>
                  Please review and e-sign the Business Associate Agreement that says you will keep this information safe, and use it only as intended.
                </Text>
                
                <Text style={styles.baaText}>
                  Please find a copy of agreement in your user profile.
                </Text>
                
                <TouchableOpacity 
                  style={styles.acceptButton}
                  onPress={handleChat}
                >
                  <Text style={styles.inviteButtonText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: { 
    fontSize: 22,
    fontWeight: 'bold', 
    marginLeft: 15,
  },
  iconsRight: { 
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWithLabel: {
    alignItems: 'center',
    marginLeft: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLabel: {
    fontSize: 10,
    color: '#71839b',
    marginTop: 4,
  },
  image: {
    width: 30,
    height: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 15,
    borderRadius: 25,
    height: 50,
  },
  searchIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e6e6e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  search: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  groupIconContainer: {
    position: 'relative',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupMemberIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
  groupMemberImage: {
    width: '100%',
    height: '100%',
  },
  tabs: { 
    flexDirection: 'row', 
    marginBottom: 15,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 10,
  },
  tabActive: { 
    backgroundColor: '#0057D9' 
  },
  tabText: { 
    color: '#71839b',
    fontSize: 14,
  },
  tabTextActive: { 
    color: '#fff',
    fontSize: 14,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  defaultAvatar: {
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#ddd',
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12,
  },
  groupAvatar: {
    width: 50, 
    height: 50, 
    borderRadius: 15, 
    backgroundColor: '#ccc',
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12,
  },
  avatar: {
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    marginRight: 12,
  },
  name: { 
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 3,
  },
  message: { 
    color: '#666',
    fontSize: 14,
  },
  time: { 
    fontSize: 12, 
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 25, 
    right: 25,
    backgroundColor: '#0057D9',
    width: 60, 
    height: 60,
    borderRadius: 30,
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  rightAction: {
    backgroundColor: '#0057D9',
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderRadius: 10,
    marginVertical: 10,
    width: 70,
  },
  actionContent: {
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'white',
    marginHorizontal: 2,
  },
  popupOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  popupBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 20,
    textAlign: 'center',
  },
  baaText: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    color: '#555',
  },
  emailInput: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  inviteButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  inviteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChatHomeScreen;