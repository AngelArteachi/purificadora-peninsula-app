import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import Animated, { BounceInDown } from 'react-native-reanimated';

import { Reveal } from '@/components/motion/Reveal';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Logo } from '@/components/ui/Logo';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { useSession } from '@/state/session';
import { fonts, makeStyles, radius, spacing, useTheme } from '@/theme';

export default function LoginScreen() {
  const styles = useStyles();
  const { signIn } = useSession();
  const [email, setEmail] = useState('mariana@hidra.mx');
  const [password, setPassword] = useState('aguafresca');

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={BounceInDown.duration(900)}>
            <Logo size={34} />
          </Animated.View>

          <Reveal index={2}>
            <Text style={styles.title} accessibilityRole="header">
              Inicia sesión
            </Text>
            <Text style={styles.subtitle}>Pide tus garrafones y sigue tu entrega en tiempo real.</Text>
          </Reveal>

          <Reveal index={3}>
            <Field
              label="Correo electrónico"
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              value={email}
              onChangeText={setEmail}
              containerStyle={styles.firstField}
            />
            <Field
              label="Contraseña"
              icon="lock-closed-outline"
              secure
              autoComplete="password"
              textContentType="password"
              containerStyle={styles.field}
              value={password}
              onChangeText={setPassword}
            />
          </Reveal>

          <Reveal index={4}>
            <PressableScale haptic="none" scaleTo={0.96} accessibilityRole="link" style={styles.forgotWrap}>
              <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
            </PressableScale>

            {/* The root layout's route guard swaps to the tabs once a user exists. */}
            <Button label="Iniciar sesión" style={styles.submit} onPress={() => signIn(email)} />
          </Reveal>

          <Reveal index={5}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <SocialButton icon="logo-apple" label="Continuar con Apple" />
            <SocialButton icon="logo-google" label="Continuar con Google" />
          </Reveal>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes cuenta? </Text>
            <PressableScale haptic="light" scaleTo={0.96} accessibilityRole="link">
              <Text style={styles.link}>Regístrate</Text>
            </PressableScale>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function SocialButton({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }) {
  const t = useTheme();
  const styles = useStyles();
  return (
    <PressableScale haptic="light" scaleTo={0.98} accessibilityRole="button" style={styles.social}>
      <Ionicons name={icon} size={20} color={t.text} />
      <Text style={styles.socialLabel}>{label}</Text>
    </PressableScale>
  );
}

const useStyles = makeStyles((t) => ({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  title: {
    marginTop: spacing['3xl'],
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.6,
    color: t.text,
  },
  subtitle: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 21,
    color: t.textSecondary,
  },
  firstField: {
    marginTop: spacing['2xl'],
  },
  field: {
    marginTop: spacing.lg,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: 12,
    paddingVertical: 4,
  },
  link: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: t.primaryText,
  },
  submit: {
    marginTop: spacing.xl,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: t.border,
  },
  dividerText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: t.textTertiary,
  },
  social: {
    height: 52,
    marginBottom: 10,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: t.borderStrong,
    backgroundColor: t.surface,
  },
  socialLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: t.text,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: spacing['2xl'],
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: t.textSecondary,
  },
}));
