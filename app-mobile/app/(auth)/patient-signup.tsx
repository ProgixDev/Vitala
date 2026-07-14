import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import Toast from 'react-native-toast-message';
import {
  Text,
  Input,
  Button,
  StepProgress,
  OtpInput,
  Chip,
} from '@/components/ui';
import { AuthScaffold } from '@/components/AuthScaffold';
import { SocialAuthRow } from '@/components/SocialAuthRow';
import { RoleToggle } from '@/components/RoleToggle';
import { TagInput } from '@/components/TagInput';
import { PasswordRules, evaluatePassword } from '@/components/PasswordRules';
import { supabase } from '@/lib/supabase';
import { Endpoints } from '@/lib/endpoints';
import { useTranslation } from '@/utils/i18n';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS: { key: 'male' | 'female' | 'other'; label: string }[] = [
  { key: 'male', label: 'Male' },
  { key: 'female', label: 'Female' },
  { key: 'other', label: 'Other' },
];

export default function PatientSignup() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // step 1
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  // step 2
  const [code, setCode] = useState('');
  // step 3
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const checks = evaluatePassword(password, confirm);
  // step 4
  const [gender, setGender] = useState<string | null>(null);
  const [blood, setBlood] = useState<string | null>(null);
  const [dob, setDob] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [chronic, setChronic] = useState<string[]>([]);

  const back = () => (step === 1 ? router.back() : setStep((s) => s - 1));

  const headings: Record<number, { title: string; subtitle: string }> = {
    1: { title: t('auth.createAccountTitle'), subtitle: t('auth.signUpSubtitle') },
    2: { title: t('auth.verifyEmail'), subtitle: t('auth.verifyEmailSubtitle', { email }) },
    3: { title: t('auth.setPassword'), subtitle: t('auth.setPasswordSubtitle') },
    4: { title: t('auth.medicalProfile'), subtitle: t('auth.medicalSubtitle') },
  };

  const sendCode = async () => {
    if (!fullName.trim() || !email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          data: { role: 'patient', full_name: fullName.trim(), phone: phone.trim() },
        },
      });
      if (error) throw error;
      setStep(2);
    } catch (e) {
      Toast.show({ type: 'error', text1: t('common.somethingWrong'), text2: msg(e) });
    } finally {
      setLoading(false);
    }
  };

  const verify = async (value: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: value,
        type: 'email',
      });
      if (error) throw error;
      setStep(3);
    } catch {
      Toast.show({ type: 'error', text1: t('auth.invalidCode') });
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async () => {
    if (!checks.allValid) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setStep(4);
    } catch (e) {
      Toast.show({ type: 'error', text1: t('common.somethingWrong'), text2: msg(e) });
    } finally {
      setLoading(false);
    }
  };

  const finish = async () => {
    setLoading(true);
    try {
      await Endpoints.updateMedical({
        gender: gender ?? undefined,
        blood_type: blood ?? undefined,
        date_of_birth: dob || undefined,
        allergies,
        chronic_illnesses: chronic,
      });
    } catch {
      // Medical profile is optional — don't block entry on it.
    } finally {
      setLoading(false);
      router.replace('/(tabs)');
    }
  };

  return (
    <AuthScaffold
      showLogo
      logoVariant="mark"
      title={headings[step].title}
      subtitle={headings[step].subtitle}
      onBack={back}
      headerRight={
        <View className="w-24">
          <StepProgress total={4} current={step} tone="onDark" />
        </View>
      }
      footer={
        step === 1 ? (
          <View className="flex-row justify-center gap-1">
            <Text variant="body" className="text-muted-foreground">
              {t('auth.haveAccount')}
            </Text>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable hitSlop={8}>
                <Text variant="bodyMedium" className="text-primary">
                  {t('auth.signIn')}
                </Text>
              </Pressable>
            </Link>
          </View>
        ) : null
      }
    >
      {step === 1 ? (
        <View className="gap-5">
          <RoleToggle
            value="patient"
            onChange={(r) => {
              if (r === 'nurse') router.replace('/(auth)/nurse-signup');
            }}
          />
          <Input
            label={t('auth.fullName')}
            icon="person-outline"
            placeholder={t('auth.fullNamePlaceholder')}
            value={fullName}
            onChangeText={setFullName}
          />
          <Input
            label={t('auth.email')}
            icon="mail-outline"
            placeholder={t('auth.emailPlaceholder')}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label={t('auth.phone')}
            icon="call-outline"
            placeholder={t('auth.phonePlaceholder')}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Button label={t('common.continue')} loading={loading} onPress={sendCode} />
          <SocialAuthRow label={t('auth.orContinueWith')} />
        </View>
      ) : null}

      {step === 2 ? (
        <View className="gap-6">
          <OtpInput onChange={setCode} onFilled={verify} />
          <Button
            label={t('auth.verify')}
            loading={loading}
            disabled={code.length < 6}
            onPress={() => verify(code)}
          />
          <Pressable className="self-center" hitSlop={8} onPress={sendCode}>
            <Text variant="bodyMedium" className="text-primary">
              {t('auth.resendCode')}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {step === 3 ? (
        <View className="gap-5">
          <Input
            label={t('auth.password')}
            icon="lock-closed-outline"
            secure
            value={password}
            onChangeText={setPassword}
          />
          <Input
            label={t('auth.confirmPassword')}
            icon="lock-closed-outline"
            secure
            value={confirm}
            onChangeText={setConfirm}
          />
          <PasswordRules checks={checks} />
          <Button
            label={t('common.continue')}
            loading={loading}
            disabled={!checks.allValid}
            onPress={savePassword}
          />
        </View>
      ) : null}

      {step === 4 ? (
        <View className="gap-5">
          <View className="gap-2">
            <Text variant="label">{t('auth.gender')}</Text>
            <View className="flex-row gap-2">
              {GENDERS.map((g) => (
                <Chip
                  key={g.key}
                  label={g.label}
                  selected={gender === g.key}
                  onPress={() => setGender(g.key)}
                />
              ))}
            </View>
          </View>

          <View className="gap-2">
            <Text variant="label">{t('auth.bloodType')}</Text>
            <View className="flex-row flex-wrap gap-2">
              {BLOOD_TYPES.map((b) => (
                <Chip key={b} label={b} selected={blood === b} onPress={() => setBlood(b)} />
              ))}
            </View>
          </View>

          <Input
            label={t('auth.dateOfBirth')}
            icon="calendar-outline"
            placeholder="YYYY-MM-DD"
            value={dob}
            onChangeText={setDob}
          />
          <TagInput label={t('auth.allergies')} value={allergies} onChange={setAllergies} />
          <TagInput label={t('auth.chronic')} value={chronic} onChange={setChronic} />

          <Button label={t('auth.finish')} loading={loading} onPress={finish} />
        </View>
      ) : null}
    </AuthScaffold>
  );
}

function msg(e: unknown): string {
  return e instanceof Error ? e.message : '';
}
