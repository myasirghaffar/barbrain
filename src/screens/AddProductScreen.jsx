/**
 * SCREEN 2 — Product Catalog Add. Search catalog, select multiple products, add to current area.
 * Catalog is loaded from API/DB (all products, deduped by name+volume).
 */
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon, Icons } from "../assets/icons";
import { useInventory } from "../context/InventoryContext";
import { useLanguage } from "../context/LanguageContext";
import SearchBar from "../components/SearchBar";
import ProductItem from "../components/ProductItem";
import { colors, spacing } from "../theme/colors";

function dedupeCatalog(products) {
  const seen = new Set();
  return (products || []).filter((p) => {
    const key = `${(p.name || "").trim()}|${Number(p.volume) || 0}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map((p) => ({ id: p.id || `${p.name}-${p.volume}`, name: p.name, volume: p.volume, image: p.image }));
}

function filterCatalog(list, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return list;
  return list.filter((p) => (p.name || "").toLowerCase().includes(q));
}

export default function AddProductScreen({ navigation }) {
  const { addProducts, getAllProductsForPriceScreen, currentCategoryName, dbReady } = useInventory();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [catalogRaw, setCatalogRaw] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  useEffect(() => {
    if (!dbReady) return;
    let cancelled = false;
    getAllProductsForPriceScreen().then((list) => {
      if (!cancelled) {
        setCatalogRaw(dedupeCatalog(list));
        setLoadingCatalog(false);
      }
    }).catch(() => {
      if (!cancelled) setLoadingCatalog(false);
    });
    return () => { cancelled = true; };
  }, [dbReady, getAllProductsForPriceScreen]);

  const catalog = filterCatalog(catalogRaw, search);

  const toggleSelect = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleAdd = useCallback(async () => {
    if (selected.size === 0) return;
    setSaving(true);
    const toAdd = catalog.filter((p) => selected.has(p.id));
    const products = toAdd.map((p) => ({ name: p.name, volume: p.volume }));
    await addProducts(products);
    setSaving(false);
    navigation.goBack();
  }, [selected, catalog, addProducts, navigation]);

  const renderItem = useCallback(
    ({ item }) => (
      <ProductItem
        name={item.name}
        volume={item.volume}
        image={item.image}
        metaText={t("measurable")}
        showCheckbox
        selected={selected.has(item.id)}
        onSelect={() => toggleSelect(item.id)}
        onPress={() => toggleSelect(item.id)}
      />
    ),
    [selected, toggleSelect, t],
  );

  const keyExtractor = useCallback((item) => item.id, []);

  if (!dbReady || loadingCatalog) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.safeInner}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
        >
          <Icon name={Icons.arrowBack} size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {currentCategoryName}
        </Text>
        <TouchableOpacity
          onPress={handleAdd}
          disabled={selected.size === 0 || saving}
          style={styles.headerAddBtn}
        >
          <Icon
            name={Icons.addCircleOutline}
            size={20}
            color={
              selected.size === 0 || saving
                ? colors.textSecondary
                : colors.primaryBlue
            }
            style={styles.addBtnIcon}
          />
          <Text
            style={[
              styles.addBtn,
              (selected.size === 0 || saving) && styles.addBtnDisabled,
            ]}
          >
            {t("add")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.addNewCard}
          onPress={() => navigation.navigate("AddNewProduct")}
          activeOpacity={0.7}
        >
          <Icon
            name={Icons.add}
            size={24}
            color={colors.primaryBlue}
            style={styles.addNewIcon}
          />
          <Text style={styles.addNewText}>{t("addNewProduct")}</Text>
          <Icon
            name={Icons.chevronRight}
            size={22}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t("catalogPlaceholder")}
          style={styles.searchBar}
        />
        <FlatList
          data={catalog}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Icon
                name={Icons.searchOff}
                size={48}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyText}>{t("noProductsFound")}</Text>
              <Text style={styles.emptyHint}>{t("tryDifferentSearch")}</Text>
            </View>
          }
        />
      </View>
      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
        </View>
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  safeInner: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.cardBackground, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerBtn: { padding: spacing.sm, marginRight: spacing.xs },
  headerAddBtn: { flexDirection: "row", alignItems: "center", padding: spacing.sm },
  addBtnIcon: { marginRight: spacing.xs },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  addBtn: { fontSize: 16, fontWeight: "600", color: colors.primaryBlue },
  addBtnDisabled: { color: colors.textSecondary },
  content: { flex: 1, padding: spacing.md },
  addNewCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.cardBackground, paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: 12, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  addNewIcon: { marginRight: spacing.sm },
  addNewText: { flex: 1, fontSize: 16, fontWeight: "600", color: colors.textPrimary },
  searchBar: { paddingBottom: spacing.md },
  listContent: { paddingBottom: spacing.xxl, paddingHorizontal: 2, paddingTop: spacing.md },
  emptyWrap: { alignItems: "center", paddingVertical: spacing.xxl },
  emptyText: { marginTop: spacing.md, fontSize: 16, color: colors.textSecondary },
  emptyHint: { marginTop: spacing.xs, fontSize: 14, color: colors.textSecondary },
  savingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
});
