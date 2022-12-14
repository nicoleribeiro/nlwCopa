import { useCallback, useState } from 'react';
import { Icon, Toast, useToast, VStack, FlatList } from "native-base";
import { Octicons } from '@expo/vector-icons'
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from '@react-navigation/native';
import { Button } from "../components/Button";
import { Header } from "../components/Header";
import { api } from "../services/api";
import { PoolCard, PoolPros } from '../components/PoolCard';
import { Loading } from '../components/Loading';
import { EmptyPoolList } from '../components/EmptyPoolList';


export function Pools() {
    const [isLoading, setIsLoading] = useState(true);
    const [pools, setPools] = useState<PoolPros[]>([]);

    const { navigate } = useNavigation();
    const toast = useToast();

    async function fetchPools() {
        try {
            setIsLoading(true);

            const response = await api.get('/pools');
            setPools(response.data.pools);
        } catch (error) {
            console.log(error);

            toast.show({
                title: "Erro ao carregar bolões",
                placement: "top",
                bgColor: "red.500",
            })
        } finally {
            setIsLoading(false);
        }
    }

    // useEffect só carrega quando o componente é renderizado
    // useFocusEffect carrega toda vez que o componente é focado
    useFocusEffect(useCallback(() => {
        fetchPools();
    }, []));

    return (
        <VStack flex={1} bgColor="gray.900">
            <Header title="Meus bolões" />
            <VStack mt={6} mx={5} borderBottomWidth={1} borderBottomColor="gray.600" pb={4} mb={4}>
                <Button
                    title="Buscar bolão por código"
                    leftIcon={<Icon as={Octicons} name="search" color="black" size="md" />}
                    onPress={() => navigate('find')}
                />
            </VStack>

            {
                isLoading ? <Loading /> : 
                <FlatList
                    data={pools}
                    keyExtractor={item => item.id}
                    renderItem={({item}) => (
                        <PoolCard
                            data={item}
                            onPress={() => navigate('details', {id: item.id})}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                    _contentContainerStyle={{ pb: 10 }}
                    ListEmptyComponent={() => <EmptyPoolList/>}
                    px={5}
                />
        }
        </VStack>
    )
}