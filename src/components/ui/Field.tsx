import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { fonts, makeStyles, radius, useTheme } from '@/theme';

type FieldProps = Omit<TextInputProps, 'style'> & {
  /** Visible label above the input. */
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Secure fields get an eye toggle on the right. */
  secure?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  hint?: string;
};

/** Labelled text field with a clear focus border and an optional reveal toggle. */
export function Field({ label, icon, secure = false, containerStyle, hint, onFocus, onBlur, ...rest }: FieldProps) {
  const t = useTheme();
  const styles = useStyles();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  return (
    <View style={containerStyle}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, focused && styles.boxFocused]}>
        {icon ? <Ionicons name={icon} size={18} color={focused ? t.primary : t.textTertiary} /> : null}
        <TextInput
          {...rest}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          secureTextEntry={secure ? hidden : rest.secureTextEntry}
          placeholderTextColor={t.textTertiary}
          selectionColor={t.primary}
          style={styles.input}
          accessibilityLabel={label}
        />
        {secure ? (
          <PressableScale
            haptic="light"
            scaleTo={0.88}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            onPress={() => setHidden((value) => !value)}
            hitSlop={8}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={19} color={t.textTertiary} />
          </PressableScale>
        ) : null}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  label: {
    marginBottom: 6,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: t.textSecondary,
  },
  box: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: t.borderStrong,
    backgroundColor: t.surface,
  },
  boxFocused: {
    borderColor: t.primary,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    color: t.text,
    fontFamily: fonts.medium,
    fontSize: 15,
    paddingVertical: 0,
  },
  hint: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: t.textTertiary,
  },
}));
