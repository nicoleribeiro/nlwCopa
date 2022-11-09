import { Center, Spinner } from 'native-base';

export function Loading(){
    return(
        <Center flex={1} bg="gray.900">
            {/* Spinner é um componente que mostra uma animação de carregamento */}
            <Spinner color="yellow.500" />
        </Center>
    )
}