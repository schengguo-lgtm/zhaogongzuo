/**
 * Chat Room — real-time messaging via Firestore.
 * MVP: uses local mock state. Replace with subscribeToMessages() for production.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../src/constants/colors';
import { useAuthStore } from '../../src/store/authStore';
import type { ChatMessage } from '../../src/types';

const ROOM_NAMES: Record<string, string> = {
  'room-001': '강남 파크뷰 담당자',
  'room-002': '마포 물류센터 담당자',
};

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    roomId: 'room-001',
    senderId: 'employer-mock-1',
    text: '안녕하세요! 지원해주셔서 감사합니다.',
    sentAt: new Date('2026-03-09T09:00:00'),
  },
  {
    id: 'msg-2',
    roomId: 'room-001',
    senderId: 'mock-worker',
    text: '감사합니다. 언제 출근하면 될까요?',
    sentAt: new Date('2026-03-09T09:05:00'),
  },
  {
    id: 'msg-3',
    roomId: 'room-001',
    senderId: 'employer-mock-1',
    text: '내일 오전 7시까지 현장에 오시면 됩니다.',
    sentAt: new Date('2026-03-09T14:30:00'),
  },
];

export default function ChatRoomScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { appUser } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>(
    MOCK_MESSAGES.filter((m) => m.roomId === id),
  );
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({ title: ROOM_NAMES[id ?? ''] ?? '채팅' });

    // TODO (Production): Replace with Firestore real-time subscription
    // const unsub = subscribeToMessages(id, setMessages);
    // return unsub;
  }, [id, navigation]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // TODO (Production): sendMessage(id, appUser.id, trimmed)
    const newMsg: ChatMessage = {
      id: `msg-local-${Date.now()}`,
      roomId: id ?? '',
      senderId: appUser?.id ?? 'mock-worker',
      text: trimmed,
      sentAt: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMine = item.senderId === (appUser?.id ?? 'mock-worker');
    return (
      <View style={[styles.msgRow, isMine && styles.msgRowMine]}>
        <View style={[styles.bubble, isMine && styles.bubbleMine]}>
          <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>
            {item.text}
          </Text>
          <Text style={[styles.msgTime, isMine && styles.msgTimeMine]}>
            {item.sentAt.toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderMessage}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={t('chat.message_placeholder')}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
    gap: 8,
  },
  msgRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  msgRowMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    maxWidth: '78%',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  bubbleMine: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
    borderColor: Colors.primary,
  },
  bubbleText: {
    fontSize: 15,
    color: Colors.text.primary,
  },
  bubbleTextMine: {
    color: Colors.text.inverse,
  },
  msgTime: {
    fontSize: 10,
    color: Colors.text.disabled,
    alignSelf: 'flex-end',
  },
  msgTimeMine: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    backgroundColor: Colors.background,
    color: Colors.text.primary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.text.disabled,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
});
