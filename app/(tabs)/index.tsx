/**
 * Map Tab — main screen showing construction sites on a map + list toggle.
 *
 * Uses react-native-maps (Google Maps on Android, Apple Maps on iOS).
 *
 * TODO (Naver Maps): Replace MapView with react-native-naver-map for Korea-optimized maps.
 * See: https://github.com/mym0404/react-native-naver-map
 * Steps:
 *  1. `npx expo install @mj-studio/react-native-naver-map`
 *  2. Add NAVER_MAPS_CLIENT_ID to app.json android.config
 *  3. Swap out MapView import below with NaverMapView
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { MOCK_SITES, getSiteAvailabilityStatus } from '../../src/mock/sites';
import { SiteCard } from '../../src/components/SiteCard';
import { LanguageSelector } from '../../src/components/LanguageSelector';
import { useAppStore } from '../../src/store/appStore';
import { Config } from '../../src/constants/config';
import type { ConstructionSite } from '../../src/types';
import type { SupportedLanguage } from '../../src/i18n';

function calcDistanceKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const MARKER_COLORS: Record<string, string> = {
  available: Colors.map.available,
  limited: Colors.map.limited,
  full: Colors.map.full,
};

export default function MapScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { language, setLanguage, mapViewMode, setMapViewMode, searchQuery, setSearchQuery } = useAppStore();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [sites, setSites] = useState<ConstructionSite[]>(MOCK_SITES);

  // Request location and calculate distances
  const requestLocation = useCallback(async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('', t('error.location_denied'));
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = loc.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      // Annotate sites with distance
      const enriched = MOCK_SITES.map((site) => ({
        ...site,
        distanceKm: calcDistanceKm(latitude, longitude, site.latitude, site.longitude),
      })).sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
      setSites(enriched);
    } catch {
      Alert.alert('', t('error.network'));
    } finally {
      setLocationLoading(false);
    }
  }, [t]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Filter by search query
  const filteredSites = sites.filter(
    (s) =>
      !searchQuery ||
      s.name.includes(searchQuery) ||
      s.address.includes(searchQuery) ||
      s.jobs.some((j) => j.title.includes(searchQuery) || j.jobType.includes(searchQuery)),
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('map.search_placeholder')}
          placeholderTextColor={Colors.text.disabled}
          returnKeyType="search"
        />
        <LanguageSelector
          current={language}
          onSelect={(lang: SupportedLanguage) => setLanguage(lang)}
          compact
        />
      </View>

      {/* View mode toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, mapViewMode === 'map' && styles.toggleBtnActive]}
          onPress={() => setMapViewMode('map')}
        >
          <Text style={[styles.toggleText, mapViewMode === 'map' && styles.toggleTextActive]}>
            🗺 {t('map.map_view')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, mapViewMode === 'list' && styles.toggleBtnActive]}
          onPress={() => setMapViewMode('list')}
        >
          <Text style={[styles.toggleText, mapViewMode === 'list' && styles.toggleTextActive]}>
            📋 {t('map.list_view')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.locateBtn}
          onPress={requestLocation}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.locateText}>📍</Text>
          )}
        </TouchableOpacity>
      </View>

      {mapViewMode === 'map' ? (
        <MapView
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={Config.defaultMapRegion}
          region={
            userLocation
              ? {
                  latitude: userLocation.lat,
                  longitude: userLocation.lng,
                  latitudeDelta: 0.08,
                  longitudeDelta: 0.08,
                }
              : undefined
          }
          showsUserLocation
          showsMyLocationButton={false}
        >
          {filteredSites.map((site) => {
            const status = getSiteAvailabilityStatus(site);
            const color = MARKER_COLORS[status] ?? Colors.map.available;
            const openJobs = site.jobs.filter((j) => j.filledCount < j.headcount).length;
            return (
              <Marker
                key={site.id}
                coordinate={{ latitude: site.latitude, longitude: site.longitude }}
                pinColor={color}
                onCalloutPress={() => router.push(`/site/${site.id}`)}
              >
                <Callout tooltip>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle} numberOfLines={1}>
                      {site.name}
                    </Text>
                    <Text style={styles.calloutJobs}>
                      {t('map.job_count', { count: openJobs })}
                    </Text>
                    <Text style={styles.calloutAction}>탭하여 상세 보기 →</Text>
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>
      ) : (
        <FlatList
          data={filteredSites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <SiteCard
              site={item}
              onPress={() => router.push(`/site/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t('map.no_sites')}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: Colors.background,
    color: Colors.text.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  toggleTextActive: {
    color: Colors.text.inverse,
  },
  locateBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locateText: {
    fontSize: 18,
  },
  map: {
    flex: 1,
  },
  callout: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 10,
    minWidth: 160,
    maxWidth: 220,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  calloutJobs: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  calloutAction: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  list: {
    padding: 14,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.text.secondary,
    fontSize: 15,
  },
});
