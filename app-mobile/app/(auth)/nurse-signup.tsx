import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import {
  Text,
  Input,
  Button,
  StepProgress,
  Card,
  Icon,
  type IconName,
} from '@/components/ui';
import { AuthScaffold } from '@/components/AuthScaffold';
import { RoleToggle } from '@/components/RoleToggle';
import { TagInput } from '@/components/TagInput';
import { PhotoCaptureCard } from '@/components/PhotoCaptureCard';
import { PasswordRules, evaluatePassword } from '@/components/PasswordRules';
import { supabase } from '@/lib/supabase';
import { Endpoints } from '@/lib/endpoints';
import { uploadImage } from '@/lib/upload';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';

export default function NurseSignup() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [license, setLicense] = useState('');
  const [experience, setExperience] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);

  const [idFront, setIdFront] = useState<string | null>(null);
  const [idBack, setIdBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);

  const checks = evaluatePassword(password, confirm);
  const infoValid = !!fullName.trim() && !!email.trim() && checks.allValid && !!license.trim();

  const back = () => (step === 1 ? router.back() : setStep((s) => s - 1));

  const headings: Record<number, { title: string; subtitle: string }> = {
    1: { title: t('auth.createAccountTitle'), subtitle: t('auth.createNurse') },
    2: { title: t('nurse.id.title'), subtitle: t('nurse.id.subtitle') },
    3: { title: t('nurse.selfie.title'), subtitle: t('nurse.selfie.subtitle') },
    4: { title: t('nurse.review.title'), subtitle: t('nurse.review.subtitle') },
  };

  const submit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { role: 'nurse', full_name: fullName.trim(), phone: phone.trim() } },
      });
      if (error) throw error;

      // Ensure we have a session (some projects auto-confirm and return one).
      if (!data.session) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInErr) {
          Toast.show({
            type: 'info',
            text1: t('auth.verifyEmail'),
            text2: t('auth.checkCredentials'),
          });
          router.replace('/(auth)/sign-in');
          return;
        }
      }

      // Best-effort document upload (nurse stays pending regardless).
      const [frontPath, backPath, selfiePath] = await Promise.all([
        idFront ? uploadImage('nurse-docs', idFront).catch(() => undefined) : undefined,
        idBack ? uploadImage('nurse-docs', idBack).catch(() => undefined) : undefined,
        selfie ? uploadImage('nurse-docs', selfie).catch(() => undefined) : undefined,
      ]);

      await Endpoints.updateNurse({
        license_number: license.trim(),
        experience_years: experience ? Number(experience) : undefined,
        specializations,
        id_doc_front_url: frontPath,
        id_doc_back_url: backPath,
        selfie_url: selfiePath,
      }).catch(() => undefined);

      router.replace('/(tabs)');
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: t('common.somethingWrong'),
        text2: e instanceof Error ? e.message : '',
      });
    } finally {
      setLoading(false);
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
    >
      {step === 1 ? (
        <View className="gap-5">
          <RoleToggle
            value="nurse"
            onChange={(r) => {
              if (r === 'patient') router.replace('/(auth)/patient-signup');
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
          <Input
            label={t('nurse.license')}
            icon="card-outline"
            placeholder={t('nurse.licensePlaceholder')}
            autoCapitalize="characters"
            value={license}
            onChangeText={setLicense}
          />
          <Input
            label={t('nurse.experience')}
            icon="briefcase-outline"
            placeholder={t('nurse.experiencePlaceholder')}
            keyboardType="number-pad"
            value={experience}
            onChangeText={setExperience}
          />
          <TagInput
            label={t('nurse.specializations')}
            placeholder={t('nurse.specializationsPlaceholder')}
            value={specializations}
            onChange={setSpecializations}
          />
          <Input
            label={t('auth.password')}
            icon="lock-closed-outline"
            placeholder={t('auth.passwordPlaceholder')}
            secure
            value={password}
            onChangeText={setPassword}
          />
          <Input
            label={t('auth.confirmPassword')}
            icon="lock-closed-outline"
            placeholder={t('auth.confirmPasswordPlaceholder')}
            secure
            value={confirm}
            onChangeText={setConfirm}
          />
          <PasswordRules checks={checks} />
          <Button label={t('common.continue')} disabled={!infoValid} onPress={() => setStep(2)} />
        </View>
      ) : null}

      {step === 2 ? (
        <View className="gap-4">
          <PhotoCaptureCard label={t('nurse.id.front')} uri={idFront} onCaptured={setIdFront} icon="card-outline" />
          <PhotoCaptureCard label={t('nurse.id.back')} uri={idBack} onCaptured={setIdBack} icon="card-outline" />
          <Button label={t('common.continue')} disabled={!idFront || !idBack} onPress={() => setStep(3)} />
        </View>
      ) : null}

      {step === 3 ? (
        <View className="gap-4">
          <PhotoCaptureCard
            label={t('nurse.selfie.take')}
            uri={selfie}
            onCaptured={setSelfie}
            front
            icon="happy-outline"
          />
          <Button label={t('common.continue')} disabled={!selfie} onPress={() => setStep(4)} />
        </View>
      ) : null}

      {step === 4 ? (
        <View className="gap-4">
          <Card className="gap-3">
            <ReviewRow icon="person-outline" label={t('auth.fullName')} value={fullName} />
            <ReviewRow icon="mail-outline" label={t('auth.email')} value={email} />
            <ReviewRow icon="card-outline" label={t('nurse.license')} value={license} />
            <ReviewRow
              icon="briefcase-outline"
              label={t('nurse.experience')}
              value={experience ? `${experience} yrs` : '—'}
            />
            <ReviewRow
              icon="ribbon-outline"
              label={t('nurse.specializations')}
              value={specializations.join(', ') || '—'}
            />
            <View className="flex-row items-center gap-2">
              <Icon name="checkmark-circle" size={18} color={colors.success} />
              <Text variant="caption">ID (front & back) + selfie captured</Text>
            </View>
          </Card>
          <Button label={t('nurse.submit')} loading={loading} onPress={submit} />
        </View>
      ) : null}
    </AuthScaffold>
  );
}

function ReviewRow({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-3">
      <Icon name={icon} size={18} color={colors.mutedForeground} />
      <Text variant="caption" className="w-28 text-muted-foreground">
        {label}
      </Text>
      <Text variant="bodyMedium" className="flex-1" numberOfLines={1}>
        {value || '—'}
      </Text>
    </View>
  );
}
