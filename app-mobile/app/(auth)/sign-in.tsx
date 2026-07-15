import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Text, Input, Button } from '@/components/ui';
import { AuthScaffold } from '@/components/AuthScaffold';
import { RoleToggle, type AuthRole } from '@/components/RoleToggle';
import { SocialAuthRow } from '@/components/SocialAuthRow';
import { useSession } from '@/providers/SessionProvider';
import { useTranslation } from '@/utils/i18n';

// Accounts created by server-nest/scripts/seed-accounts.mjs. Dev builds only —
// stripped from release bundles by the __DEV__ guard.
const SEED_ACCOUNTS: Record<AuthRole, { email: string; password: string }> = {
  patient: { email: 'patient@vitala.app', password: 'Vitala123!' },
  nurse: { email: 'nurse@vitala.app', password: 'Vitala123!' },
};

export default function SignIn() {
  const { t } = useTranslation();
  const { signIn } = useSession();
  const [role, setRole] = useState<AuthRole>('patient');
  const [email, setEmail] = useState(__DEV__ ? SEED_ACCOUNTS.patient.email : '');
  const [password, setPassword] = useState(__DEV__ ? SEED_ACCOUNTS.patient.password : '');
  const [loading, setLoading] = useState(false);

  const signupHref =
    role === 'nurse' ? '/(auth)/nurse-signup' : '/(auth)/patient-signup';

  const changeRole = (next: AuthRole) => {
    setRole(next);
    if (__DEV__) {
      setEmail(SEED_ACCOUNTS[next].email);
      setPassword(SEED_ACCOUNTS[next].password);
    }
  };

  const submit = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      await signIn(email, password);
      // Route through the entry gate so the profile loads and we land in the
      // right shell by role (patient tabs vs nurse shell) — no flash of tabs.
      router.replace('/');
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: t('auth.signInFailed'),
        text2: e instanceof Error ? e.message : t('auth.checkCredentials'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold
      showLogo
      title={t('auth.welcomeBack')}
      subtitle={t('auth.signInSubtitle')}
      footer={
        <View className="flex-row justify-center gap-1">
          <Text variant="body" className="text-muted-foreground">
            {t('auth.noAccount')}
          </Text>
          <Link href={signupHref} asChild>
            <Pressable hitSlop={8}>
              <Text variant="bodyMedium" className="text-primary">
                {t('auth.signUp')}
              </Text>
            </Pressable>
          </Link>
        </View>
      }
    >
      <View className="gap-5">
        <View className="gap-2">
          <Text variant="label">{t('auth.iAmA')}</Text>
          <RoleToggle value={role} onChange={changeRole} />
          <Text variant="caption" className="text-muted-foreground">
            {role === 'nurse' ? t('auth.signInNurseHint') : t('auth.signInPatientHint')}
          </Text>
        </View>

        <View className="gap-4">
          <Input
            label={t('auth.email')}
            icon="mail-outline"
            placeholder={t('auth.emailPlaceholder')}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label={t('auth.password')}
            icon="lock-closed-outline"
            placeholder={t('auth.passwordPlaceholder')}
            secure
            value={password}
            onChangeText={setPassword}
          />
          <Pressable
            className="self-end"
            hitSlop={8}
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text variant="caption" className="font-semibold text-primary">
              {t('auth.forgotPassword')}
            </Text>
          </Pressable>
        </View>
      </View>

      <Button label={t('auth.signIn')} className="mt-6" loading={loading} onPress={submit} />

      <View className="mt-7">
        <SocialAuthRow label={t('auth.orContinueWith')} />
      </View>
    </AuthScaffold>
  );
}
