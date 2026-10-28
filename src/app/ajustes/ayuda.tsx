import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ComingSoon } from '@/components/ui/ComingSoon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { LOYALTY_TARGET } from '@/state/loyalty';
import { fonts, makeStyles, spacing, useTheme } from '@/theme';

const FAQS = [
  {
    question: '¿Cuánto tarda en llegar mi pedido?',
    answer:
      'Entregamos en el horario que elijas al pedir. Si eliges "Hoy", el repartidor sale en cuanto confirmamos y puedes seguirlo en Rastreo.',
  },
  {
    question: '¿Recogen el garrafón vacío?',
    answer: 'Sí. Ten listo tu garrafón vacío al recibir el pedido y el repartidor se lo lleva para lavarlo y rellenarlo.',
  },
  {
    question: '¿Cómo funciona el Club Hidra?',
    answer: `Cada pedido suma una compra. Al llegar a ${LOYALTY_TARGET}, tu siguiente garrafón purificado de 20 L es gratis y la tarjeta vuelve a empezar.`,
  },
  {
    question: '¿Puedo cancelar un pedido?',
    answer: 'Puedes cancelarlo sin costo mientras el repartidor no haya salido.',
  },
];

function Faq({ question, answer, first }: { question: string; answer: string; first: boolean }) {
  const t = useTheme();
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withSpring(open ? '180deg' : '0deg', { damping: 14 }) }],
  }));

  return (
    <View style={[styles.faq, !first && styles.divider]}>
      <PressableScale
        haptic="light"
        scaleTo={0.99}
        accessibilityRole="button"
        accessibilityLabel={question}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
        style={styles.faqHeader}
      >
        <Text style={styles.question}>{question}</Text>
        <Animated.View style={chevronStyle}>
          <Ionicons name="chevron-down" size={18} color={t.textTertiary} />
        </Animated.View>
      </PressableScale>
      {open ? (
        <Animated.Text entering={FadeIn.duration(220)} style={styles.answer}>
          {answer}
        </Animated.Text>
      ) : null}
    </View>
  );
}

export default function HelpScreen() {
  const styles = useStyles();
  const [soon, setSoon] = useState(false);

  return (
    <Screen>
      <ScreenHeader title="Ayuda" fallback="/perfil" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Reveal index={0}>
          <Text style={styles.sectionTitle}>Preguntas frecuentes</Text>
          <Card padded={false} style={styles.group}>
            {FAQS.map((faq, index) => (
              <Faq key={faq.question} question={faq.question} answer={faq.answer} first={index === 0} />
            ))}
          </Card>
        </Reveal>

        <Reveal index={1}>
          <Card style={styles.contact}>
            <Text style={styles.contactTitle}>¿Necesitas algo más?</Text>
            <Text style={styles.contactCopy}>Nuestro equipo responde de 8:00 am a 9:00 pm, todos los días.</Text>
            <View style={styles.contactActions}>
              <Button label="Chat" icon="chatbubbles-outline" size="small" onPress={() => setSoon(true)} style={styles.flex} />
              <Button
                label="Llamar"
                icon="call-outline"
                size="small"
                variant="secondary"
                onPress={() => setSoon(true)}
                style={styles.flex}
              />
            </View>
            <ComingSoon visible={soon} message="El chat y las llamadas estarán disponibles muy pronto." />
          </Card>
        </Reveal>
      </ScrollView>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing['3xl'],
    gap: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontFamily: fonts.bold,
    fontSize: 17,
    color: t.text,
  },
  group: {
    overflow: 'hidden',
  },
  faq: {
    paddingHorizontal: 16,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: t.border,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
  },
  question: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: t.text,
  },
  answer: {
    paddingBottom: 15,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: t.textSecondary,
  },
  contact: {
    gap: 4,
  },
  contactTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: t.text,
  },
  contactCopy: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: t.textSecondary,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
}));
