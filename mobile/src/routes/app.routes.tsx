import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PlusCircle, SoccerBall } from 'phosphor-react-native';
import { useTheme } from 'native-base';
import { Platform } from 'react-native';
import { New } from '../screens/New';
import { Pools } from '../screens/Pools';
import { Find } from '../screens/Find';

const { Navigator, Screen } = createBottomTabNavigator();

export function AppRoutes(){
    const { colors, sizes } = useTheme(); // pegando o tema do native-base

    const size = sizes[6];
    return (
        // Navegador por tabs inferiores
        <Navigator screenOptions={{
            headerShown: false, // remover o cabeçalho padrão que o componente coloca
            tabBarLabelPosition: 'beside-icon', // colocar o texto ao lado do icone
            tabBarActiveTintColor: colors.yellow[500], // cor do texto quando o botão estiver ativo
            tabBarInactiveTintColor: colors.gray[300], // cor do texto quando o botão estiver inativo
            tabBarStyle:{
                position: 'absolute',
                height: sizes[22],
                borderTopWidth: 0,
                backgroundColor: colors.gray[800],
            },
            tabBarItemStyle: {
                position: 'relative',
                top: Platform.OS === 'android' ? -10 : 0,
            }
        }}>
            <Screen
                name="new"
                component={New}
                options={{
                    tabBarIcon: ({ color }) => <PlusCircle color={color} size={size}/>,
                    tabBarLabel: 'Novo bolão'
                }}
            />

            <Screen
                name="pools"
                component={Pools}
                options={{
                    tabBarIcon: ({ color }) => <SoccerBall color={color} size={size}/>,
                    tabBarLabel: 'Meus bolões'
                }}
            />

            <Screen
                name="find"
                component={Find}
                options={{ tabBarButton: () => null, }} // remover o botão
            />
        </Navigator>
    )
}