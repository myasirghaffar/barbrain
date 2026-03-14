/**
 * Sign up screen - register new user.
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

export default function SignUpScreen({ navigation }) {
  const { t } = useLanguage();
  const { signupAndLogin } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    const fn = (firstName || '').trim();
    const ln = (lastName || '').trim();
    const un = (username || '').trim();
    const e = (email || '').trim();
    const phone = (phoneNumber || '').trim();
    const p = password || '';
    const cp = confirmPassword || '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+\-\s()]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]+$/;

    if (!fn) {
      setError(t('firstName') + ' is required');
      return;
    }
    if (!ln) {
      setError(t('lastName') + ' is required');
      return;
    }
    if (!un || un.length < 3 || !usernameRegex.test(un)) {
      setError('Username must be at least 3 characters and contain only letters, numbers, or underscores');
      return;
    }
    if (!e || !emailRegex.test(e)) {
      setError('Please provide a valid email address');
      return;
    }
    if (!phone || !phoneRegex.test(phone)) {
      setError('Please provide a valid phone number');
      return;
    }
    if (!p || p.length < 6) {
      setError(t('password') + ' must be at least 6 characters');
      return;
    }
    if (p !== cp) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await signupAndLogin({
        firstName: fn,
        lastName: ln,
        username: un,
        email: e,
        phoneNumber: phone,
        password: p,
      });
    } catch (err) {
      setError(err?.message || t('signUpError'));
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
              <Text style={styles.title}>{t('signUp')}</Text>
              <Text style={styles.subtitle}>{t('appName')} – {t('inventory')}</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.row}>
                <View style={[styles.inputWrap, styles.half]}>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={(v) => {
                      setFirstName(v);
                      setError('');
                    }}
                    placeholder={t('firstNamePlaceholder')}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={[styles.inputWrap, styles.half]}>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={(v) => {
                      setLastName(v);
                      setError('');
                    }}
                    placeholder={t('lastNamePlaceholder')}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              <View style={styles.inputWrap}>
                <Icon
                  name={Icons.person}
                  size={22}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={(v) => {
                    setUsername(v);
                    setError('');
                  }}
                  placeholder={t('usernamePlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

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
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={(v) => {
                    setPhoneNumber(v);
                    setError('');
                  }}
                  placeholder={t('phonePlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
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

              <View style={styles.inputWrap}>
                <Icon
                  name={Icons.lock}
                  size={22}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={(v) => {
                    setConfirmPassword(v);
                    setError('');
                  }}
                  placeholder={t('confirmPassword')}
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
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.btnPrimaryText}>{t('signUp')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomLinkWrap}>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.linkText}>{t('hasAccount')} </Text>
              <Text style={styles.linkBold}>{t('signIn')}</Text>
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
    marginBottom: spacing.xxl,
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
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
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
