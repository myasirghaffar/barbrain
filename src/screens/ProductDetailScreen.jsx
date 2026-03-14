/**
 * Single product detail view. Bottle with smooth fill-level slider and full-bottle counter.
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, Icons } from '../assets/icons';
import { useLanguage } from '../context/LanguageContext';
import { useInventory } from '../context/InventoryContext';
import BottleFillSlider from '../components/BottleFillSlider';
import { FULL_BOTTLES_SAVE_DEBOUNCE_MS } from '../config/constants';
import { colors, spacing } from '../theme/colors';

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params || {};
  const { t } = useLanguage();
  const { updateFillLevel, updateFullBottles, getProductById } = useInventory();
  const initialFullBottles = product?.fullBottles ?? 0;
  const [fullBottles, setFullBottles] = useState(initialFullBottles);
  const initialFill = product?.fillLevel != null ? product.fillLevel : 100;
  const [localFillLevel, setLocalFillLevel] = useState(initialFill);
  const saveFullBottlesTimeout = useRef(null);
  const pendingFullBottlesRef = useRef(null);

  // When opening detail, load saved values so we default to previous (not 0)
  useEffect(() => {
    if (!product?.id) return;
    setLocalFillLevel(product?.fillLevel != null ? product.fillLevel : 100);
    setFullBottles(product?.fullBottles ?? 0);
    if (!getProductById) return;
    let mounted = true;
    getProductById(product.id).then((fresh) => {
      if (!mounted || !fresh) return;
      setLocalFillLevel(fresh.fillLevel != null ? fresh.fillLevel : 100);
      setFullBottles(fresh.fullBottles ?? 0);
    }).catch(() => {});
    return () => { mounted = false; };
  }, [product?.id, getProductById]);

  // Sync from list when it has values (e.g. after refresh); don't overwrite with 0 when list is stale
  useEffect(() => {
    if (product?.fillLevel != null) setLocalFillLevel(product.fillLevel);
  }, [product?.id, product?.fillLevel]);

  useEffect(() => {
    if (product?.fullBottles != null) setFullBottles(product.fullBottles);
  }, [product?.id, product?.fullBottles]);

  const handleFillChange = useCallback(
    async (fillLevel) => {
      if (!product?.id) return;
      setLocalFillLevel(fillLevel);
      await updateFillLevel(product.id, fillLevel);
    },
    [product?.id, updateFillLevel]
  );

  const scheduleSaveFullBottles = useCallback(
    (nextCount) => {
      pendingFullBottlesRef.current = nextCount;
      if (saveFullBottlesTimeout.current) clearTimeout(saveFullBottlesTimeout.current);
      saveFullBottlesTimeout.current = setTimeout(() => {
        saveFullBottlesTimeout.current = null;
        const toSave = pendingFullBottlesRef.current;
        pendingFullBottlesRef.current = null;
        if (product?.id && toSave != null) updateFullBottles(product.id, toSave);
      }, FULL_BOTTLES_SAVE_DEBOUNCE_MS);
    },
    [product?.id, updateFullBottles]
  );

  useEffect(() => {
    return () => {
      if (saveFullBottlesTimeout.current) clearTimeout(saveFullBottlesTimeout.current);
      if (pendingFullBottlesRef.current != null && product?.id) {
        updateFullBottles(product.id, pendingFullBottlesRef.current);
      }
    };
  }, [product?.id, updateFullBottles]);

  const handleDecrementFullBottles = useCallback(() => {
    const next = Math.max(0, fullBottles - 1);
    setFullBottles(next);
    scheduleSaveFullBottles(next);
  }, [fullBottles, scheduleSaveFullBottles]);

  const handleIncrementFullBottles = useCallback(() => {
    const next = fullBottles + 1;
    setFullBottles(next);
    scheduleSaveFullBottles(next);
  }, [fullBottles, scheduleSaveFullBottles]);

  if (!product) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.safeInner}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Icon name={Icons.arrowBack} size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('back')}</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{t('noProducts')}</Text>
        </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.safeInner}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Icon name={Icons.arrowBack} size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name || t('productName')} {product.volume ? `(${product.volume} ml)` : ''}
        </Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Icon name={Icons.helpOutline} size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.main}>
        <BottleFillSlider
          image={product.image}
          name={product.name}
          fillLevel={localFillLevel}
          onFillLevelChange={handleFillChange}
        />
      </View>

      <View style={styles.quantitySection}>
        <Text style={styles.quantityLabel}>{t('and')}</Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={handleDecrementFullBottles}
            activeOpacity={0.8}
          >
            <Icon name={Icons.remove} size={28} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.quantityValueWrap}>
            <View style={styles.quantityCircle}>
              <Text style={styles.quantityNumber}>{fullBottles}</Text>
            </View>
            <Text style={styles.quantitySub}>{t('fullBottles')}</Text>
          </View>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={handleIncrementFullBottles}
            activeOpacity={0.8}
          >
            <Icon name={Icons.add} size={28} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeInner: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: {
    padding: spacing.sm,
    minWidth: 40,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  main: {
    flex: 1,
    justifyContent: 'center',
  },
  quantitySection: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  quantityLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  quantityBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValueWrap: {
    alignItems: 'center',
    minWidth: 100,
  },
  quantityCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  quantityNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  quantitySub: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
