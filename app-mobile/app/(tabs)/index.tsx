import { View, ActivityIndicator } from 'react-native';
import { PatientHome } from '@/components/home/PatientHome';
import { NurseHome } from '@/components/home/NurseHome';
import { NursePending } from '@/components/NursePending';
import { useSession } from '@/providers/SessionProvider';
import { useThemeColors } from '@/constants/theme';

export default function Home() {
  const { me } = useSession();
  const colors = useThemeColors();

  if (!me) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (me.role === 'nurse') {
    const status = me.nurseProfile?.verification_status ?? 'pending';
    if (status !== 'approved') {
      return <NursePending name={me.full_name} status={status} />;
    }
    return <NurseHome />;
  }

  return <PatientHome />;
}
