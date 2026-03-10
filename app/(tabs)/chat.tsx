/**
 * Chat Tab — list of chat rooms.
 * Real-time via Firestore (subscribeToMessages in chat/[id].tsx).
 * MVP: shows mock data until Firebase is connected.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../src/constants/colors';
import { useAuthStore } from '../../src/store/authStore';
import type { ChatRoom } from '../../src/types';

const MOCK_ROOMS: ChatRoom[] = [
  {
    id: 'room-001',
    participants: ['mock-worker', 'employer-mock-1'],
    jobId: 'job-001-1',
    siteId: 'site-001',
    lastMessage: '내일 오전 7시까지 현장에 오시면 됩니다.',
    lastMessageAt: new Date('2026-03-09T14:30:00'),
    unreadCount: 1,
  },
  {
    id: 'room-002',
    participants: ['mock-worker', 'employer-mock-2'],
    jobId: 'job-002-1',
    siteId: 'site-002',
    lastMessage: '네, 알겠습니다.',
    lastMessageAt: new Date('2026-03-08T10:00:00'),
    unreadCount: 0,
  },
];

const ROOM_NAMES: Record<string, string> = {
  'employer-mock-1': '강남 파크뷰 담당자',
  'employer-mock-2': '마포 물류센터 담당자',
};

export default function ChatListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { appUser } = useAuthStore();
  const [rooms, setRooms] = useState<ChatRoom[]>(MOCK_ROOMS);

  // TODO: Replace with real-time Firestore subscription
  // useEffect(() => {
  //   if (!appUser) return;
  //   const unsub = subscribeToChatRooms(appUser.id, setRooms);
  //   return unsub;
  // }, [appUser]);

  const getOtherParticipant = (room: ChatRoom): string => {
    const otherId = room.participants.find((p) => p !== appUser?.id) ?? '';
    return ROOM_NAMES[otherId] ?? otherId;
  };

  const renderItem = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity
      style={styles.roomCard}
      onPress={() => router.push(`/chat/${item.id}`)}
      activeOpacity={0.85}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {getOtherParticipant(item).charAt(0)}
        </Text>
      </View>
      <View style={styles.roomInfo}>
        <View style={styles.roomHeader}>
          <Text style={styles.roomName} numberOfLines={1}>
            {getOtherParticipant(item)}
          </Text>
          {item.lastMessageAt && (
            <Text style={styles.time}>
              {item.lastMessageAt.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
        </View>
        <View style={styles.roomFooter}>
          <Text style={styles.lastMsg} numberOfLines={1}>
            {item.lastMessage ?? ''}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyText}>{t('chat.no_chats')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  list: {
    flexGrow: 1,
  },
  roomCard: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.text.inverse,
    fontSize: 20,
    fontWeight: '700',
  },
  roomInfo: {
    flex: 1,
    gap: 4,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roomName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  time: {
    fontSize: 12,
    color: Colors.text.disabled,
  },
  roomFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lastMsg: {
    flex: 1,
    fontSize: 13,
    color: Colors.text.secondary,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 76,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    color: Colors.text.secondary,
    fontSize: 15,
  },
});
