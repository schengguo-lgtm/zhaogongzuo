import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../src/constants/colors';

export default function DisclaimerScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t('disclaimer.title')}</Text>
        <View style={styles.card}>
          <Text style={styles.body}>{t('disclaimer.body')}</Text>
        </View>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.back()}
        >
          <Text style={styles.btnText}>{t('disclaimer.agree_and_continue')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  body: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  btn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: '700',
  },
});
