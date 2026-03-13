/**
 * Login screen - email and password sign in.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, Icons } from '../assets/icons';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius } from '../theme/colors';

const appLogo = require('../assets/images/logo.png');

export default function LoginScreen({ navigation }) {
  const { t } = useLanguage();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    const e = (email || '').trim();
    const p = password || '';
    if (!e) {
      setError(t('email') + ' is required');
      return;
    }
    if (!p) {
      setError(t('password') + ' is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(e, p);
    } catch (err) {
      setError(err?.message || t('signInError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.centeredBlock}>
            <View style={styles.header}>
              <View style={styles.logoWrap}>
                <Image source={appLogo} style={styles.logo} resizeMode="contain" />
              </View>
              <Text style={styles.title}>{t('signIn')}</Text>
              <Text style={styles.subtitle}>
                {t('appName')} – {t('inventory')}
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.inputWrap}>
                <Icon
                  name={Icons.email}
                  size={22}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    setError('');
                  }}
                  placeholder={t('emailPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputWrap}>
                <Icon
                  name={Icons.lock}
                  size={22}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    setError('');
                  }}
                  placeholder={t('passwordPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {error ? (
                <Text style={styles.error}>{error}</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary, loading && styles.btnDisabled]}
                onPress={handleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.btnPrimaryText}>{t('signIn')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomLinkWrap}>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text style={styles.linkText}>{t('noAccount')} </Text>
              <Text style={styles.linkBold}>{t('signUp')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  keyboard: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: spacing.xl,
  },
  centeredBlock: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl * 2,
  },
  logoWrap: {
    width: 75,
    height: 75,
    borderRadius: 75 / 2,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    backgroundColor: colors.primaryBlue,
  },
  logo: {
    width: 75,
    height: 75,
    borderRadius: 75 / 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    minHeight: 48,
  },
  inputIcon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  error: {
    fontSize: 14,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  btn: {
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  btnPrimary: {
    backgroundColor: colors.primaryBlue,
  },
  btnDisabled: { opacity: 0.7 },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  bottomLinkWrap: {
    paddingBottom: spacing.xxl,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  linkText: { fontSize: 14, color: colors.textSecondary },
  linkBold: { fontSize: 14, fontWeight: '600', color: colors.primaryBlue },
});
