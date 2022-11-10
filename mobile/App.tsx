import { NativeBaseProvider, StatusBar } from "native-base";
import { THEME } from './src/styles/theme';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { Loading } from './src/components/Loading';
import { Routes } from "./src/routes";
import { AuthContextProvider } from "./src/contexts/AuthContext";

export default function App() {
  // Verificar que a fonte foi carregada
  const [fontsLoaded] = useFonts({Roboto_400Regular, Roboto_500Medium, Roboto_700Bold});

  return (
    <NativeBaseProvider theme={THEME}>
      <AuthContextProvider>
        {/* StatusBar é um componente que mostra a barra de status do celular */}
        <StatusBar
          barStyle="light-content" // Conteudo da barra de status
          backgroundColor="transparent" // Deixa a barra de status transparente
          translucent // Pega a tela toda
        />
        { fontsLoaded ? <Routes /> : <Loading />}
      </AuthContextProvider>
    </NativeBaseProvider>
  );
}